"use client";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLuneaStore } from "@/store/lunea";
import { Card, Lbl, LoadingDots, PromptDots, Stars, StarRating, Divider, SectionHeader } from "@/components/ui";
import type { Prompt, StudentReflection, StructuredFeedback } from "@/types";

export function StudentView({ studentId }: { studentId: string }) {
  const store = useLuneaStore();
  const { session } = store;
  const ss = session?.studentSessions[studentId];
  const cfg = session?.config;
  const phase = session?.currentPhase;

  const [promptText, setPromptText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [transferAnswer, setTransferAnswer] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{data:string;mediaType:string}|null>(null);
  const [showPriorDone, setShowPriorDone] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<string|null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [ss?.chatHistory]);

  if (!ss || !cfg || !phase) return null;

  const sc = cfg.subjectColor;
  const promptsLeft = cfg.maxPrompts - ss.promptsUsed;
  const kiActive = phase === "ki";

  const sendPrompt = async () => {
    if (!promptText.trim() || promptsLeft <= 0 || chatLoading) return;
    const text = promptText.trim();
    setPromptText("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[...ss.chatHistory, {role:"user", content:text}],
          mode:cfg.aiMode, subject:cfg.subject,
          topic:cfg.topic, grade:cfg.grade, task:cfg.task,
          imageData:pendingImage,
        }),
      });
      const data = await res.json();
      const response: string = data.reply ?? "Verbindungsfehler. Bitte erneut versuchen.";
      const promptId = uuidv4();
      store.addPrompt(studentId, {
        id:promptId, studentId, studentName:ss.student.name,
        text, response, timestamp:Date.now(), phase,
      });
      setPendingImage(null); setImagePreview(null);
      // Background rating
      fetch("/api/rate-prompt", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({promptText:text, subject:cfg.subject, topic:cfg.topic, grade:cfg.grade}),
      }).then(r=>r.json()).then(d=>{if(d.rating) store.updatePromptRating(studentId,promptId,d.rating);}).catch(()=>{});
    } catch { /* silent */ }
    setChatLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setPendingImage({data:result.split(",")[1], mediaType:file.type});
      store.addImage(studentId, {id:uuidv4(), studentId, dataUrl:result, mediaType:file.type, timestamp:Date.now()});
    };
    reader.readAsDataURL(file);
  };

  const requestFeedback = async () => {
    if (feedbackLoading || ss.feedback) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type:"student-feedback",
          subject:cfg.subject, topic:cfg.topic,
          grade:cfg.grade, task:cfg.task,
          ownThoughts:ss.ownThoughts,
          priorAnswers:ss.priorAnswers,
          prompts:ss.prompts.map(p=>({text:p.text, response:p.response})),
        }),
      });
      const data = await res.json();
      if (data.feedback) store.setStudentFeedback(studentId, data.feedback as StructuredFeedback);
    } catch { /* silent */ }
    setFeedbackLoading(false);
  };

  const submitReflection = () => {
    if (!transferAnswer.trim()) return;
    store.setStudentReflection(studentId, {
      studentId, transferAnswer:transferAnswer.trim(), submittedAt:Date.now(),
    });
  };

  const fb = ss.feedback as StructuredFeedback | undefined;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* ── AUFGABE ─────────────────────────────────────────────── */}
      <Card style={{ borderColor:`${sc}25` }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:`${sc}12`, border:`1.5px solid ${sc}22`,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, fontSize:16, color:sc,
          }}>◈</div>
          <div>
            <div style={{ fontSize:11, color:sc, fontWeight:600, letterSpacing:"0.04em", marginBottom:5 }}>
              {cfg.subject} · Jg. {cfg.grade} · {cfg.topic}
            </div>
            <div style={{ fontSize:14.5, color:"var(--text)", lineHeight:1.65 }}>{cfg.task}</div>
          </div>
        </div>
        {cfg.lastWeekQuestion && (
          <div style={{
            marginTop:12, padding:"8px 12px",
            background:`${sc}08`, border:`1.5px solid ${sc}18`,
            borderRadius:9, fontSize:12.5, color:sc, lineHeight:1.6,
          }}>💭 {cfg.lastWeekQuestion}</div>
        )}
      </Card>

      {/* ── VORWISSEN ───────────────────────────────────────────── */}
      {phase === "eigen" && cfg.priorKnowledgeEnabled && cfg.priorKnowledgeQuestions.length > 0 && !showPriorDone && (
        <Card className="fade-up">
          <SectionHeader title="Vorwissen aktivieren" subtitle={cfg.topic} color="var(--phase-eigen)" />
          {cfg.priorKnowledgeQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, color:"var(--text)", marginBottom:7, lineHeight:1.5 }}>
                <span style={{ color:"var(--phase-eigen)", fontWeight:700, marginRight:7 }}>{i+1}.</span>{q}
              </div>
              <textarea
                value={ss.priorAnswers.find(a=>a.questionIndex===i)?.answer ?? ""}
                onChange={e => store.addPriorAnswer(studentId, {questionIndex:i, question:q, answer:e.target.value})}
                rows={2} placeholder="Deine Antwort..." style={{fontSize:13}}
              />
            </div>
          ))}
          <button onClick={()=>setShowPriorDone(true)} style={{
            width:"100%", padding:"10px", borderRadius:10, border:"none",
            background:"var(--phase-eigen)", color:"#fff",
            fontSize:13, fontWeight:600, cursor:"pointer",
          }}>Vorwissen notiert – weiter ✓</button>
        </Card>
      )}

      {/* ── EIGENE GEDANKEN ─────────────────────────────────────── */}
      {(phase==="eigen"||phase==="ki"||phase==="fokus") && (
        <Card className="fade-up">
          <SectionHeader
            title="Deine eigenen Gedanken"
            subtitle={phase==="eigen"?"KI erst nach diesem Schritt freigeschaltet":undefined}
            color="var(--phase-eigen)"
          />
          <textarea
            value={ss.ownThoughts}
            onChange={e=>store.updateStudentOwnThoughts(studentId, e.target.value)}
            placeholder="Was weisst du schon? Was vermutest du? Was faellt dir dazu ein?"
            rows={4} disabled={phase==="fokus"}
            style={{fontSize:13.5, opacity:phase==="fokus"?0.4:1, transition:"opacity 0.3s"}}
          />
        </Card>
      )}

      {/* ── FOKUS ───────────────────────────────────────────────── */}
      {phase==="fokus" && (
        <Card style={{textAlign:"center", padding:"44px 24px", borderColor:"var(--blue-border)"}} className="fade-up">
          <div style={{
            width:52, height:52, borderRadius:"50%",
            background:"var(--blue-soft)", border:"1.5px solid var(--blue-border)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px", fontSize:20, color:"var(--blue)",
          }}>◉</div>
          <div style={{fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.025em", marginBottom:8}}>Fokus-Phase</div>
          <div style={{fontSize:13.5, color:"var(--text-3)", lineHeight:1.8, maxWidth:300, margin:"0 auto"}}>
            Die KI ist gesperrt.<br/>Arbeite jetzt eigenstaendig weiter.
          </div>
        </Card>
      )}

      {/* ── KI-CHAT ─────────────────────────────────────────────── */}
      {kiActive && (
        <Card style={{borderColor:"rgba(249,115,22,0.2)"}} className="fade-up">
          {/* Header */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14}}>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:"var(--text)", letterSpacing:"-0.02em", marginBottom:4}}>LUNEA</div>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:5,
                padding:"3px 9px", borderRadius:6,
                background: cfg.aiMode==="unreliable" ? "rgba(220,38,38,0.06)" : "var(--orange-soft)",
                border:`1.5px solid ${cfg.aiMode==="unreliable" ? "rgba(220,38,38,0.15)" : "var(--orange-border)"}`,
              }}>
                <span style={{fontSize:9}}>{cfg.aiMode==="standard"?"◈":cfg.aiMode==="socratic"?"◇":"⚠"}</span>
                <span style={{fontSize:11, fontWeight:600, color:cfg.aiMode==="unreliable"?"#DC2626":"var(--orange)", letterSpacing:"-0.01em"}}>
                  {cfg.aiMode==="standard"?"Standard":cfg.aiMode==="socratic"?"Sokratisch":"Kritischer Modus"}
                </span>
              </div>
            </div>
            <PromptDots used={ss.promptsUsed} max={cfg.maxPrompts} />
          </div>

          {cfg.aiMode==="unreliable" && (
            <div style={{
              marginBottom:12, padding:"9px 13px", borderRadius:9,
              background:"rgba(220,38,38,0.05)", border:"1.5px solid rgba(220,38,38,0.14)",
              fontSize:12.5, color:"#DC2626", lineHeight:1.6,
            }}>⚠ Kritischer Modus: Pruefe alle Aussagen – die KI kann absichtlich Fehler enthalten.</div>
          )}

          {/* Suggestions */}
          {cfg.promptSuggestions.length>0 && ss.prompts.length===0 && (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11, color:"var(--text-3)", marginBottom:7}}>Vorschlaege:</div>
              <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                {cfg.promptSuggestions.map((s,i) => (
                  <button key={i} onClick={()=>setPromptText(s)} style={{
                    padding:"5px 11px", borderRadius:8,
                    border:"1.5px solid var(--orange-border)", background:"var(--orange-soft)",
                    color:"var(--orange)", fontSize:12, cursor:"pointer",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div style={{
            minHeight:80, maxHeight:340, overflowY:"auto",
            display:"flex", flexDirection:"column", gap:8,
            marginBottom:12, padding:"2px 0",
          }}>
            {ss.chatHistory.length===0 && (
              <div style={{fontSize:13, color:"var(--text-4)", textAlign:"center", padding:"24px 0", fontStyle:"italic"}}>
                Ueberlege zuerst: Was willst du wirklich wissen?
              </div>
            )}
            {ss.chatHistory.map((msg,i) => (
              <div key={i} className={msg.role==="user"?"bubble-user":"bubble-ai"}>{msg.content}</div>
            ))}
            {chatLoading && <div className="bubble-ai" style={{padding:"12px 14px"}}><LoadingDots /></div>}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt ratings (collapsible) */}
          {ss.prompts.some(p=>p.rating) && (
            <>
              <Divider margin={8} />
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11, color:"var(--text-3)", marginBottom:8}}>Bewertungen deiner Prompts</div>
                {ss.prompts.map(p => {
                  if (!p.rating) return null;
                  const avg = Math.round((p.rating.praezision.stars+p.rating.eigenanteil.stars+p.rating.lernwert.stars)/3);
                  const isOpen = expandedPrompt===p.id;
                  return (
                    <div key={p.id} style={{marginBottom:6}}>
                      <button onClick={()=>setExpandedPrompt(isOpen?null:p.id)} style={{
                        width:"100%", padding:"8px 12px",
                        background:"var(--bg)", border:"1.5px solid var(--border)",
                        borderRadius:10, cursor:"pointer",
                        display:"flex", alignItems:"center", gap:8, textAlign:"left",
                      }}>
                        <span style={{flex:1, fontSize:12, color:"var(--text-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.text}</span>
                        <Stars value={avg} size={11} />
                        <span style={{fontSize:10, color:"var(--text-4)"}}>{isOpen?"▲":"▼"}</span>
                      </button>
                      {isOpen && (
                        <div className="scale-in" style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginTop:6}}>
                          <StarRating label="Praezision" stars={p.rating.praezision.stars} comment={p.rating.praezision.comment} color="var(--orange)" />
                          <StarRating label="Eigenanteil" stars={p.rating.eigenanteil.stars} comment={p.rating.eigenanteil.comment} color="var(--green)" />
                          <StarRating label="Lernwert" stars={p.rating.lernwert.stars} comment={p.rating.lernwert.comment} color="var(--blue)" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Image upload */}
          {cfg.imageUploadEnabled && (
            <div style={{marginBottom:8}}>
              {imagePreview ? (
                <div style={{position:"relative", marginBottom:8, display:"inline-block"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Vorschau" style={{maxWidth:"100%", maxHeight:110, borderRadius:9, border:"1.5px solid var(--border)"}} />
                  <button onClick={()=>{setImagePreview(null);setPendingImage(null);}} style={{
                    position:"absolute", top:5, right:5, width:22, height:22, borderRadius:"50%",
                    background:"rgba(0,0,0,0.6)", border:"none", color:"#fff", fontSize:12, cursor:"pointer",
                  }}>×</button>
                </div>
              ) : (
                <button onClick={()=>fileRef.current?.click()} style={{
                  padding:"5px 11px", borderRadius:8, cursor:"pointer",
                  border:"1.5px dashed var(--border-2)", background:"transparent",
                  color:"var(--text-3)", fontSize:12,
                }}>📎 Bild anhaengen</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{display:"none"}} />
            </div>
          )}

          {/* Input */}
          {promptsLeft>0 ? (
            <div style={{display:"flex", gap:8}}>
              <input
                ref={inputRef}
                value={promptText}
                onChange={e=>setPromptText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPrompt();}}}
                placeholder="Deine Frage..."
                disabled={chatLoading}
                style={{flex:1, borderRadius:12, fontSize:14}}
              />
              <button
                onClick={sendPrompt}
                disabled={!promptText.trim()||chatLoading}
                style={{
                  width:44, height:44, borderRadius:12, border:"none", flexShrink:0,
                  background: promptText.trim()&&!chatLoading ? "var(--orange)" : "var(--bg2)",
                  color:"#fff", fontSize:18, cursor:"pointer",
                  boxShadow: promptText.trim()&&!chatLoading ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                  transition:"all 0.18s",
                }}>↑</button>
            </div>
          ) : (
            <div style={{
              textAlign:"center", fontSize:13, color:"var(--text-3)",
              padding:"12px", background:"var(--bg)", borderRadius:10,
              border:"1.5px solid var(--border)",
            }}>Prompts aufgebraucht – denke jetzt eigenstaendig weiter.</div>
          )}

          {/* Feedback trigger */}
          {ss.prompts.length>0 && !fb && !feedbackLoading && (
            <>
              <Divider />
              <button onClick={requestFeedback} style={{
                width:"100%", padding:"10px", borderRadius:10, border:"none",
                background:sc, color:"#fff",
                fontSize:13, fontWeight:600, cursor:"pointer",
                boxShadow:`0 4px 12px ${sc}35`,
              }}>Persoenliches Feedback anfordern ◈</button>
            </>
          )}
          {feedbackLoading && <div style={{display:"flex", justifyContent:"center", paddingTop:12}}><LoadingDots /></div>}
        </Card>
      )}

      {/* ── STRUKTURIERTES FEEDBACK (5 Dimensionen + Sterne) ──── */}
      {fb && (
        <Card style={{borderColor:`${sc}22`}} className="fade-up">
          <SectionHeader title="Persoenliches Feedback" color={sc} />

          {/* 5 Dimensionen */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16}}>
            {([
              {key:"vorwissen", label:"Vorwissen", color:"var(--green)"},
              {key:"kritischePruefung", label:"Kritische Pruefung", color:"var(--orange)"},
              {key:"umgangMitKI", label:"Umgang mit KI", color:"var(--blue)"},
              {key:"eigenanteil", label:"Eigenanteil", color:"var(--purple)"},
              {key:"denkqualitaet", label:"Denkqualitaet", color:sc},
            ] as const).map(({key, label, color}) => {
              const dim = fb[key];
              return (
                <StarRating
                  key={key}
                  label={label}
                  stars={dim.stars}
                  comment={dim.comment}
                  color={color}
                />
              );
            })}
          </div>

          <Divider margin={0} />

          {/* Staerke, Blinder Fleck, Naechster Schritt */}
          <div style={{display:"flex", flexDirection:"column", gap:8, marginTop:14}}>
            {[
              {icon:"💪", label:"Groesste Staerke", val:fb.staerke, color:"var(--green)"},
              {icon:"🔍", label:"Blinder Fleck", val:fb.blinder_fleck, color:"var(--orange)"},
              {icon:"→", label:"Naechster Schritt", val:fb.naechster_schritt, color:"var(--blue)"},
            ].map(({icon,label,val,color}) => (
              <div key={label} style={{
                padding:"11px 13px", borderRadius:10,
                background:"var(--bg)", border:"1.5px solid var(--border)",
              }}>
                <div style={{fontSize:11, fontWeight:600, color, letterSpacing:"0.02em", marginBottom:4}}>
                  {icon} {label}
                </div>
                <div style={{fontSize:13.5, color:"var(--text)", lineHeight:1.65}}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── GRUPPENVERGLEICH / REFLEXION ─────────────────────── */}
      {phase==="reflexion" && !ss.reflection && (
        <Card style={{borderColor:"rgba(124,58,237,0.2)"}} className="fade-up">
          <SectionHeader
            title="Transfer-Satz"
            subtitle="Reiche deinen Satz ein – dann vergleicht die Gruppe."
            color="var(--purple)"
          />
          <div style={{
            padding:"13px 15px",
            background:"rgba(124,58,237,0.04)", border:"1.5px solid rgba(124,58,237,0.14)",
            borderRadius:12, marginBottom:14,
          }}>
            <div style={{fontSize:12.5, color:"var(--purple)", fontWeight:600, marginBottom:9}}>
              Was nimmst du aus dieser Stunde mit?
            </div>
            <textarea
              value={transferAnswer}
              onChange={e=>setTransferAnswer(e.target.value)}
              rows={3}
              placeholder="In einem Satz: Was habe ich heute wirklich verstanden oder neu gedacht?"
              style={{fontSize:13.5, background:"var(--bg1)"}}
            />
          </div>
          <button
            onClick={submitReflection}
            disabled={!transferAnswer.trim()}
            style={{
              width:"100%", padding:"12px", borderRadius:10, border:"none",
              background: transferAnswer.trim() ? "var(--purple)" : "var(--bg2)",
              color: transferAnswer.trim() ? "#fff" : "var(--text-3)",
              fontSize:14, fontWeight:600, cursor:"pointer",
              boxShadow: transferAnswer.trim() ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
            }}
          >Transfer-Satz einreichen ◇</button>
        </Card>
      )}

      {phase==="reflexion" && ss.reflection && (
        <Card style={{textAlign:"center", padding:"44px 24px", borderColor:"rgba(124,58,237,0.2)"}} className="fade-up">
          <div style={{
            width:52, height:52, borderRadius:"50%",
            background:"rgba(124,58,237,0.08)", border:"1.5px solid rgba(124,58,237,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 14px", fontSize:22, color:"var(--purple)",
          }}>◇</div>
          <div style={{fontSize:17, fontWeight:700, color:"var(--text)", marginBottom:6}}>Transfer eingereicht</div>
          <div style={{fontSize:13, color:"var(--text-3)"}}>Die Lehrkraft startet den Gruppenvergleich.</div>
          {ss.reflection.transferAnswer && (
            <div style={{
              marginTop:18, padding:"12px 16px",
              background:"rgba(124,58,237,0.04)", border:"1.5px solid rgba(124,58,237,0.14)",
              borderRadius:12, fontSize:14, color:"var(--text)", fontStyle:"italic", lineHeight:1.65,
            }}>
              „{ss.reflection.transferAnswer}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
