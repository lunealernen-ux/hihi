"use client";
import { useState } from "react";
import { useLuneaStore } from "@/store/lunea";
import { Phase } from "@/types";
import { PHASE_META, SubjectDot, Stars, Lbl, PillBadge } from "@/components/ui";
import { Timer } from "@/components/shared/Timer";

export function Topbar({ onAnalyze, onGroupCompare }: { onAnalyze: () => void; onGroupCompare: () => void }) {
  const { session, setPhase, endSession } = useLuneaStore();
  const [panel, setPanel] = useState<"students" | "analysis" | null>(null);

  if (!session) return null;
  const { config, currentPhase, studentSessions, analysis } = session;
  const students = Object.values(studentSessions);
  const allPrompts = students.flatMap(ss => ss.prompts);
  const sc = config.subjectColor;
  const phases: Phase[] = ["eigen", "ki", "fokus", "reflexion"];
  const toggle = (p: "students" | "analysis") => setPanel(prev => prev === p ? null : p);

  return (
    <>
      <div className="topbar">
        {/* Left: identity + session code */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:"0 0 auto", minWidth:0 }}>
          <SubjectDot color={sc} label="" />
          <span style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>
            {config.subject}
          </span>
          <span style={{ color:"var(--text-4)", fontSize:12 }}>·</span>
          <span style={{ fontSize:12, color:"var(--text-3)", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {config.topic}
          </span>
          <span style={{ color:"var(--text-4)", fontSize:12 }}>·</span>
          <span style={{ fontSize:11, color:"var(--text-3)" }}>Jg. {config.grade}</span>
        </div>

        {/* Center: phases */}
        <div style={{ flex:1, display:"flex", justifyContent:"center", gap:3 }}>
          {phases.map(p => {
            const pm = PHASE_META[p];
            const isActive = currentPhase === p;
            return (
              <button key={p} onClick={() => setPhase(p)} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"5px 13px", borderRadius:100,
                border:`1.5px solid ${isActive ? pm.color : "var(--border-2)"}`,
                background: isActive ? `${pm.color}0f` : "transparent",
                color: isActive ? pm.color : "var(--text-3)",
                fontSize:12, fontWeight:500, cursor:"pointer",
                transition:"all 0.18s",
              }}>
                <span style={{fontSize:9}}>{pm.icon}</span>
                {pm.label}
              </button>
            );
          })}
        </div>

        {/* Right: controls */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:"0 0 auto" }}>
          <Timer />

          {/* Session code — prominent */}
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"5px 12px", borderRadius:8,
            background:"var(--bg2)", border:"1.5px solid var(--border-2)",
          }}>
            <span style={{ fontSize:10, color:"var(--text-3)", fontWeight:500 }}>CODE</span>
            <span style={{
              fontSize:13.5, fontWeight:700, color:"var(--text)",
              letterSpacing:"0.12em", fontVariantNumeric:"tabular-nums",
            }}>
              {config.sessionCode}
            </span>
          </div>

          <button onClick={() => toggle("students")} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"5px 12px", borderRadius:100,
            border:`1.5px solid ${panel==="students" ? "var(--border-3)" : "var(--border-2)"}`,
            background: panel==="students" ? "var(--bg2)" : "transparent",
            color:"var(--text-2)", fontSize:12, cursor:"pointer",
          }}>
            ⬡ {students.length}
          </button>

          <button onClick={() => { onAnalyze(); toggle("analysis"); }} style={{
            padding:"5px 12px", borderRadius:100,
            border:`1.5px solid ${panel==="analysis" ? "rgba(249,115,22,0.4)" : "rgba(249,115,22,0.2)"}`,
            background: panel==="analysis" ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.06)",
            color:"var(--orange)", fontSize:12, cursor:"pointer",
          }}>Analyse</button>

          {currentPhase==="reflexion" && (
            <button onClick={onGroupCompare} style={{
              padding:"5px 12px", borderRadius:100,
              border:"1.5px solid rgba(124,58,237,0.25)",
              background:"rgba(124,58,237,0.06)",
              color:"var(--purple)", fontSize:12, cursor:"pointer",
            }}>Vergleich</button>
          )}

          <button onClick={endSession} style={{
            width:30, height:30, borderRadius:"50%",
            border:"1.5px solid rgba(220,38,38,0.2)",
            background:"rgba(220,38,38,0.06)",
            color:"#DC2626", fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>×</button>
        </div>
      </div>

      {/* ── STUDENTS PANEL ──────────────────────────────────────────────── */}
      {panel==="students" && (
        <div className="slide-down" style={{
          position:"fixed", top:62, right:16, zIndex:300,
          width:360, maxHeight:480, overflowY:"auto",
          background:"var(--bg1)", border:"1.5px solid var(--border-2)",
          borderRadius:18, boxShadow:"var(--shadow-lg)", padding:18,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <Lbl style={{marginBottom:0}}>Schueler:innen ({students.length})</Lbl>
            <button onClick={()=>setPanel(null)} style={{background:"none",border:"none",color:"var(--text-3)",fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          {students.length===0 ? (
            <div style={{fontSize:13, color:"var(--text-3)"}}>Noch keine Eintraege.</div>
          ) : students.map(ss => (
            <div key={ss.student.id} style={{
              padding:"10px 0", borderBottom:"1.5px solid var(--border)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <span style={{fontSize:13.5, fontWeight:600, color:"var(--text)"}}>{ss.student.name}</span>
                <div style={{ display:"flex", gap:4 }}>
                  {ss.reflection && <PillBadge color="var(--purple)" style={{fontSize:9.5}}>◇ Transfer</PillBadge>}
                  {ss.prompts.length>0 && <PillBadge color={sc} style={{fontSize:9.5}}>{ss.prompts.length} Prompts</PillBadge>}
                </div>
              </div>
              {ss.ownThoughts && (
                <div style={{fontSize:11.5, color:"var(--text-3)", lineHeight:1.5, marginBottom:3}}>
                  {ss.ownThoughts.slice(0,80)}{ss.ownThoughts.length>80?"…":""}
                </div>
              )}
              {ss.prompts.slice(-1).map((p,i) => (
                <div key={i} style={{fontSize:11.5, color:"var(--text-3)"}}>
                  → {p.text.slice(0,60)}{p.text.length>60?"…":""}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── ANALYSIS PANEL ──────────────────────────────────────────────── */}
      {panel==="analysis" && (
        <div className="slide-down" style={{
          position:"fixed", top:62, right:16, zIndex:300,
          width:440, maxHeight:560, overflowY:"auto",
          background:"var(--bg1)", border:"1.5px solid rgba(249,115,22,0.2)",
          borderRadius:18, boxShadow:"var(--shadow-lg)", padding:20,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <Lbl color="var(--orange)" style={{marginBottom:0}}>Top-5 Prompts · Gruppenanalyse</Lbl>
            <button onClick={()=>setPanel(null)} style={{background:"none",border:"none",color:"var(--text-3)",fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          {!analysis ? (
            <div style={{fontSize:13, color:"var(--text-3)"}}>
              {allPrompts.length===0 ? "Noch keine Prompts vorhanden." : "Analyse laeuft..."}
            </div>
          ) : (
            <div>
              {analysis.topPrompts.slice(0,5).map((p,i) => (
                <div key={i} style={{
                  padding:"12px 14px", borderRadius:12,
                  background: i===0 ? "rgba(249,115,22,0.06)" : "var(--bg)",
                  border:`1.5px solid ${i===0 ? "rgba(249,115,22,0.2)" : "var(--border)"}`,
                  marginBottom:8,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{fontSize:10.5, color:"var(--orange)", fontWeight:700, letterSpacing:"0.03em"}}>
                      #{p.rank} · {p.studentName}
                    </span>
                    {i===0 && <span style={{fontSize:10, color:"var(--orange)"}}>Staerkster Prompt</span>}
                  </div>
                  <div style={{fontSize:13, color:"var(--text)", marginBottom:5, lineHeight:1.45}}>
                    „{p.text}"
                  </div>
                  <div style={{fontSize:11.5, color:"var(--text-3)", lineHeight:1.55}}>{p.reason}</div>
                </div>
              ))}
              {analysis.groupPatterns.length>0 && (
                <div style={{marginTop:14}}>
                  <Lbl>Muster in der Gruppe</Lbl>
                  {analysis.groupPatterns.map((pat,i) => (
                    <div key={i} style={{
                      fontSize:12.5, color:"var(--text-2)", marginBottom:5,
                      paddingLeft:12, borderLeft:"2px solid var(--border-2)", lineHeight:1.5,
                    }}>{pat}</div>
                  ))}
                </div>
              )}
              {analysis.commonWeaknesses.length>0 && (
                <div style={{marginTop:12}}>
                  <Lbl>Haeufige Schwaechen</Lbl>
                  {analysis.commonWeaknesses.map((w,i) => (
                    <div key={i} style={{
                      fontSize:12.5, color:"rgba(220,38,38,0.75)", marginBottom:5,
                      paddingLeft:12, borderLeft:"2px solid rgba(220,38,38,0.2)", lineHeight:1.5,
                    }}>{w}</div>
                  ))}
                </div>
              )}
              {analysis.generalFeedback && (
                <div style={{
                  marginTop:14, padding:"12px 14px",
                  background:"var(--blue-soft)", border:"1.5px solid var(--blue-border)",
                  borderRadius:12, fontSize:13, color:"var(--text-2)", lineHeight:1.65,
                }}>{analysis.generalFeedback}</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
