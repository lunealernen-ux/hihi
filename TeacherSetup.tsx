"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLuneaStore } from "@/store/lunea";
import { SUBJECTS, getGradesForSubject, getTopicsForGrade } from "@/lib/curriculum";
import { Card, Lbl, Toggle, PHASE_META } from "@/components/ui";
import { AIMode, PhaseTimings } from "@/types";

const AI_MODES: Record<AIMode, { label: string; desc: string; color: string }> = {
  standard:   { label:"Standard",   desc:"Starke, kompetente KI. Klar und hilfreich.",               color:"var(--blue)"   },
  socratic:   { label:"Sokratisch", desc:"Nur Rueckfragen. Kein erklaerende Text.",                   color:"var(--green)"  },
  unreliable: { label:"Kritisch",   desc:"Subtile Fehler eingebaut. Schueler muessen pruefen.",       color:"#DC2626"       },
};
const PROMPT_LIMITS = [2, 3, 5, 7];

export function TeacherSetup() {
  const { startSession, setView } = useLuneaStore();
  const [subjectId, setSubjectId]               = useState("deutsch");
  const [grade, setGrade]                       = useState(7);
  const [topicId, setTopicId]                   = useState("");
  const [customTopic, setCustomTopic]           = useState("");
  const [task, setTask]                         = useState("");
  const [aiMode, setAiMode]                     = useState<AIMode>("standard");
  const [maxPrompts, setMaxPrompts]             = useState(5);
  const [timings, setTimings]                   = useState<PhaseTimings>({ eigen:10, ki:10, fokus:10, reflexion:10 });
  const [priorEnabled, setPriorEnabled]         = useState(true);
  const [imageEnabled, setImageEnabled]         = useState(true);
  const [lastWeekQ, setLastWeekQ]               = useState("");
  const [promptSuggestions, setPromptSuggestions] = useState("");
  const [subjectSearch, setSubjectSearch]       = useState("");
  const [loading, setLoading]                   = useState(false);

  const subject     = SUBJECTS.find(s => s.id === subjectId)!;
  const grades      = getGradesForSubject(subjectId);
  const topics      = getTopicsForGrade(subjectId, grade);
  const activeTopic = customTopic.trim() || topics.find(t => t.id === topicId)?.label || "";
  const canStart    = activeTopic.trim().length > 0 && task.trim().length > 0;
  const filtered    = SUBJECTS.filter(s => s.label.toLowerCase().includes(subjectSearch.toLowerCase()));

  useEffect(() => {
    const vg = getGradesForSubject(subjectId);
    if (!vg.includes(grade)) setGrade(vg[0] ?? 5);
    setTopicId(""); setCustomTopic("");
  }, [subjectId]);
  useEffect(() => { setTopicId(""); setCustomTopic(""); }, [grade]);

  const handleStart = async () => {
    if (!canStart || loading) return;
    setLoading(true);
    let priorKnowledgeQuestions: string[] = [];
    if (priorEnabled) {
      try {
        const res = await fetch("/api/prior-knowledge", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ subject:subject.label, grade, topic:activeTopic, task }),
        });
        const data = await res.json();
        priorKnowledgeQuestions = data.questions ?? [];
      } catch {}
    }
    setLoading(false);
    startSession({
      id: uuidv4(),
      subject: subject.label,
      subjectColor: subject.color,
      grade,
      topic: activeTopic,
      task,
      aiMode,
      maxPrompts,
      phaseTimings: timings,
      priorKnowledgeEnabled: priorEnabled,
      priorKnowledgeQuestions,
      imageUploadEnabled: imageEnabled,
      lastWeekQuestion: lastWeekQ,
      promptSuggestions: promptSuggestions.split("\n").filter(Boolean),
      createdAt: Date.now(),
    });
  };

  const sc = subject.color;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #EFF6FF 0%, #FFFBEB 100%)" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <button onClick={()=>setView("landing")} style={{
            background:"none", border:"none", color:"var(--text-3)",
            fontSize:13, cursor:"pointer", marginBottom:16, padding:0,
            display:"flex", alignItems:"center", gap:4,
          }}>← Zurueck</button>
          <h1 style={{ fontSize:30, fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", marginBottom:6 }}>
            Session einrichten
          </h1>
          <p style={{ fontSize:14, color:"var(--text-2)", lineHeight:1.6 }}>
            Fach · Thema · Aufgabe · KI-Modus · Prompt-Limit
          </p>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"168px 1fr 228px", gap:14, alignItems:"start" }}>

          {/* Fach */}
          <Card style={{ padding:16 }}>
            <Lbl>Fach</Lbl>
            <input
              value={subjectSearch}
              onChange={e=>setSubjectSearch(e.target.value)}
              placeholder="Suchen..."
              style={{ marginBottom:8, fontSize:13, padding:"7px 11px", borderRadius:9 }}
            />
            <div style={{ maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:1 }}>
              {filtered.map(s => (
                <button key={s.id} onClick={()=>setSubjectId(s.id)} style={{
                  padding:"8px 10px", borderRadius:9, border:"none", textAlign:"left", cursor:"pointer",
                  background: subjectId===s.id ? `${s.color}12` : "transparent",
                  color: subjectId===s.id ? s.color : "var(--text-2)",
                  fontSize:13, fontWeight: subjectId===s.id ? 600 : 400,
                  borderLeft:`2.5px solid ${subjectId===s.id ? s.color : "transparent"}`,
                  transition:"all 0.14s",
                }}>{s.label}</button>
              ))}
            </div>
          </Card>

          {/* Mitte */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {/* Jahrgang */}
            <Card style={{ padding:16 }}>
              <Lbl>Jahrgang</Lbl>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {grades.map(g => (
                  <button key={g} onClick={()=>setGrade(g)} style={{
                    padding:"6px 15px", borderRadius:100, cursor:"pointer",
                    border:`1.5px solid ${grade===g ? sc : "var(--border-2)"}`,
                    background: grade===g ? `${sc}12` : "transparent",
                    color: grade===g ? sc : "var(--text-2)",
                    fontSize:13, fontWeight: grade===g ? 700 : 400,
                    transition:"all 0.14s",
                  }}>{g}</button>
                ))}
              </div>
            </Card>

            {/* Thema */}
            <Card style={{ padding:16 }}>
              <Lbl>Thema</Lbl>
              {topics.length>0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                  {topics.map(t => (
                    <button key={t.id} onClick={()=>{ setTopicId(t.id); setCustomTopic(""); }} style={{
                      padding:"4px 11px", borderRadius:100, fontSize:12, cursor:"pointer",
                      border:`1.5px solid ${topicId===t.id&&!customTopic ? sc : "var(--border-2)"}`,
                      background: topicId===t.id&&!customTopic ? `${sc}10` : "transparent",
                      color: topicId===t.id&&!customTopic ? sc : "var(--text-3)",
                      transition:"all 0.14s",
                    }}>{t.label}</button>
                  ))}
                </div>
              )}
              <input
                value={customTopic}
                onChange={e=>{ setCustomTopic(e.target.value); setTopicId(""); }}
                placeholder={topics.length>0 ? "Oder eigenes Thema..." : "Thema eingeben..."}
                style={{ fontSize:13 }}
              />
              {activeTopic && (
                <div style={{ marginTop:8, fontSize:12, color:sc, fontWeight:600 }}>✓ {activeTopic}</div>
              )}
            </Card>

            {/* Aufgabe */}
            <Card style={{ padding:16 }}>
              <Lbl>Arbeitsauftrag <span style={{color:"var(--orange)", fontWeight:400}}>*</span></Lbl>
              <textarea
                value={task}
                onChange={e=>setTask(e.target.value)}
                placeholder="Formuliere den Arbeitsauftrag so, wie er den Schueler:innen angezeigt wird."
                rows={3}
                style={{ fontSize:13.5, lineHeight:1.65 }}
              />
            </Card>

            {/* Anknuepfung */}
            <Card style={{ padding:16 }}>
              <Lbl>Anknuepfung <span style={{color:"var(--text-3)",fontWeight:400}}>(optional)</span></Lbl>
              <input
                value={lastWeekQ}
                onChange={e=>setLastWeekQ(e.target.value)}
                placeholder="Was haben wir letzte Stunde erarbeitet...?"
                style={{ fontSize:13 }}
              />
            </Card>

            {/* Prompt-Vorschlaege */}
            <Card style={{ padding:16 }}>
              <Lbl>Prompt-Vorschlaege <span style={{color:"var(--text-3)",fontWeight:400}}>(optional)</span></Lbl>
              <textarea
                value={promptSuggestions}
                onChange={e=>setPromptSuggestions(e.target.value)}
                placeholder={"Eine Zeile pro Vorschlag:\nWie haengt X mit Y zusammen?\nWas sind die Gruende fuer...?"}
                rows={3}
                style={{ fontSize:12.5 }}
              />
            </Card>
          </div>

          {/* Rechts */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {/* KI-Modus */}
            <Card style={{ padding:16 }}>
              <Lbl>KI-Modus</Lbl>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {(Object.entries(AI_MODES) as [AIMode, typeof AI_MODES[AIMode]][]).map(([key,val]) => (
                  <button key={key} onClick={()=>setAiMode(key)} style={{
                    padding:"11px 13px", borderRadius:12, textAlign:"left", cursor:"pointer",
                    border:`1.5px solid ${aiMode===key ? val.color+"40" : "var(--border-2)"}`,
                    background: aiMode===key ? `${val.color}08` : "var(--bg)",
                    transition:"all 0.14s",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:aiMode===key ? val.color : "var(--text)", marginBottom:2, letterSpacing:"-0.01em" }}>
                      {val.label}
                    </div>
                    <div style={{ fontSize:11.5, color:"var(--text-3)", lineHeight:1.5 }}>{val.desc}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Prompt-Limit */}
            <Card style={{ padding:16 }}>
              <Lbl>Prompts pro Schueler:in</Lbl>
              <div style={{ display:"flex", gap:6 }}>
                {PROMPT_LIMITS.map(n => (
                  <button key={n} onClick={()=>setMaxPrompts(n)} style={{
                    flex:1, padding:"8px 0", borderRadius:10, fontSize:16, fontWeight:700, cursor:"pointer",
                    border:`1.5px solid ${maxPrompts===n ? sc : "var(--border-2)"}`,
                    background: maxPrompts===n ? `${sc}12` : "transparent",
                    color: maxPrompts===n ? sc : "var(--text-3)",
                    transition:"all 0.14s",
                  }}>{n}</button>
                ))}
              </div>
              <div style={{ marginTop:7, fontSize:11.5, color:"var(--text-3)" }}>In der KI-Phase</div>
            </Card>

            {/* Phasenzeiten */}
            <Card style={{ padding:16 }}>
              <Lbl>Phasenzeiten <span style={{color:"var(--text-3)",fontWeight:400}}>(min)</span></Lbl>
              {(["eigen","ki","fokus","reflexion"] as const).map(phase => {
                const pm = PHASE_META[phase];
                return (
                  <div key={phase} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
                    <span style={{ fontSize:11, color:pm.color, width:18, textAlign:"center" }}>{pm.icon}</span>
                    <span style={{ fontSize:12.5, color:"var(--text-2)", flex:1 }}>{pm.label}</span>
                    <input
                      type="number" min={1} max={60}
                      value={timings[phase]}
                      onChange={e=>setTimings(t=>({...t,[phase]:Math.max(1,parseInt(e.target.value)||1)}))}
                      style={{ width:50, textAlign:"center", fontSize:14, fontWeight:700, padding:"5px 7px", borderRadius:8 }}
                    />
                  </div>
                );
              })}
            </Card>

            {/* Toggles */}
            <Card style={{ padding:16 }}>
              <Lbl>Optionen</Lbl>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Toggle value={priorEnabled} onChange={setPriorEnabled} color={sc} />
                  <div>
                    <div style={{ fontSize:13, color:"var(--text)", fontWeight:600, letterSpacing:"-0.01em" }}>Vorwissensaktivierung</div>
                    <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:1 }}>KI generiert 3 themenspez. Fragen</div>
                  </div>
                </div>
                <div style={{ height:1.5, background:"var(--border)" }} />
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Toggle value={imageEnabled} onChange={setImageEnabled} color={sc} />
                  <div>
                    <div style={{ fontSize:13, color:"var(--text)", fontWeight:600, letterSpacing:"-0.01em" }}>Bild-Upload</div>
                    <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:1 }}>Bilder in den Chat einbinden</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Start */}
            <button
              onClick={handleStart}
              disabled={!canStart||loading}
              style={{
                width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer",
                background: canStart&&!loading ? "var(--blue)" : "var(--bg3)",
                color: canStart&&!loading ? "#fff" : "var(--text-3)",
                fontSize:15, fontWeight:700, letterSpacing:"-0.02em",
                boxShadow: canStart&&!loading ? "0 4px 20px rgba(37,99,235,0.35)" : "none",
                transition:"all 0.2s",
              }}
            >
              {loading ? "Bereite vor..." : canStart ? "Session starten →" : "Thema + Aufgabe erforderlich"}
            </button>

            {canStart&&!loading && (
              <div style={{
                padding:"10px 14px", borderRadius:11,
                background:"var(--bg1)", border:"1.5px solid var(--border)",
                fontSize:12, color:"var(--text-3)", lineHeight:1.8,
              }}>
                <span style={{color:sc, fontWeight:700}}>{subject.label}</span> · Jg. {grade}<br/>
                {activeTopic}<br/>
                {AI_MODES[aiMode].label} · max. {maxPrompts} Prompts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
