"use client";
import { useState } from "react";
import { useLuneaStore } from "@/store/lunea";
import { Topbar } from "./Topbar";
import { StudentView } from "@/components/student/StudentView";
import { GroupComparisonPanel } from "./GroupComparison";
import { Card, PHASE_META, EmptyState } from "@/components/ui";

export function SessionView() {
  const store = useLuneaStore();
  const { session, addStudent, setActiveStudent, activeStudentId, setGroupAnalysis, setGroupComparison } = store;
  const [nameInput, setNameInput] = useState("");
  const [showGroupCompare, setShowGroupCompare] = useState(false);

  if (!session) return null;
  const { config, currentPhase, studentSessions, groupComparison } = session;
  const students = Object.values(studentSessions);
  const sc = config.subjectColor;
  const pm = PHASE_META[currentPhase];

  const handleAddStudent = () => {
    const n = nameInput.trim();
    if (!n) return;
    addStudent(n);
    setNameInput("");
  };

  const handleAnalyze = async () => {
    const allPrompts = students.flatMap(ss => ss.prompts.map(p => ({ studentName: ss.student.name, text: p.text })));
    if (!allPrompts.length) return;
    try {
      const res = await fetch("/api/analyze", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:"group", promptsList:allPrompts, subject:config.subject, topic:config.topic, grade:config.grade }),
      });
      const data = await res.json();
      if (data.analysis) setGroupAnalysis(data.analysis);
    } catch {}
  };

  const handleGroupCompare = async () => {
    setShowGroupCompare(true);
    setGroupComparison({ gemeinsames:"", unterschiede:"", starksteAntwort:"", begruendung:"", loading:true });
    const entries = students
      .filter(ss => ss.reflection?.transferAnswer?.trim())
      .map(ss => ({ name:ss.student.name, answer:ss.reflection!.transferAnswer }));
    if (!entries.length) {
      setGroupComparison({ gemeinsames:"Noch keine Transfer-Saetze eingereicht.", unterschiede:"", starksteAntwort:"", begruendung:"", loading:false });
      return;
    }
    try {
      const res = await fetch("/api/group-compare", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ entries, task:config.task, subject:config.subject, topic:config.topic }),
      });
      const data = await res.json();
      setGroupComparison(data.comparison ? { ...data.comparison, loading:false } : null);
    } catch {
      setGroupComparison(null);
    }
  };

  const groupEntries = students
    .filter(ss => ss.reflection?.transferAnswer?.trim())
    .map(ss => ({ name:ss.student.name, answer:ss.reflection!.transferAnswer }));

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Topbar onAnalyze={handleAnalyze} onGroupCompare={handleGroupCompare} />

      <div style={{ paddingTop:62 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"20px 20px 80px" }}>

          {/* Phase strip */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:18, padding:"10px 14px",
            background:`${pm.color}08`,
            border:`1.5px solid ${pm.color}20`,
            borderRadius:12,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{fontSize:11, color:pm.color}}>{pm.icon}</span>
              <span style={{fontSize:13, fontWeight:700, color:pm.color, letterSpacing:"-0.01em"}}>{pm.label}</span>
              <span style={{fontSize:12, color:"var(--text-3)"}}>
                {currentPhase==="eigen" && "– KI gesperrt · Eigenstaendiges Denken"}
                {currentPhase==="ki" && `– KI freigegeben · max. ${config.maxPrompts} Prompts`}
                {currentPhase==="fokus" && "– KI gesperrt · Eigenstaendige Weiterarbeit"}
                {currentPhase==="reflexion" && "– Transfer einreichen · Gruppenvergleich"}
              </span>
            </div>
            {currentPhase==="reflexion" && (
              <button onClick={handleGroupCompare} style={{
                padding:"6px 13px", borderRadius:9,
                border:"1.5px solid rgba(124,58,237,0.25)",
                background:"rgba(124,58,237,0.07)",
                color:"var(--purple)", fontSize:12, fontWeight:500, cursor:"pointer",
              }}>◇ Vergleich starten</button>
            )}
          </div>

          {/* Student tabs */}
          <div style={{ display:"flex", gap:7, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
            {students.map(ss => {
              const isActive = activeStudentId===ss.student.id;
              const done = !!ss.reflection;
              const count = ss.prompts.length;
              return (
                <button key={ss.student.id}
                  onClick={()=>setActiveStudent(ss.student.id)}
                  style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"7px 15px", borderRadius:11,
                    border:`1.5px solid ${isActive ? sc : "var(--border-2)"}`,
                    background: isActive ? `${sc}10` : "var(--bg1)",
                    color: isActive ? sc : "var(--text-2)",
                    fontSize:13, fontWeight:500, cursor:"pointer",
                    boxShadow: isActive ? `0 2px 8px ${sc}20` : "var(--shadow-sm)",
                    transition:"all 0.15s",
                  }}>
                  {ss.student.name}
                  {done && <span style={{fontSize:10, color:"var(--purple)"}}>◇</span>}
                  {count>0 && (
                    <span style={{
                      fontSize:10, padding:"1px 6px", borderRadius:6,
                      background: isActive ? `${sc}18` : "var(--bg2)",
                      color: isActive ? sc : "var(--text-3)",
                    }}>{count}</span>
                  )}
                </button>
              );
            })}

            {/* Add student input */}
            <div style={{ display:"flex", gap:6 }}>
              <input
                value={nameInput}
                onChange={e=>setNameInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleAddStudent()}
                placeholder="Schueler:in hinzufuegen..."
                style={{ width:180, fontSize:13, padding:"6px 12px", borderRadius:10 }}
              />
              <button onClick={handleAddStudent} disabled={!nameInput.trim()} style={{
                padding:"6px 14px", borderRadius:10, cursor:"pointer",
                border:"1.5px solid var(--border-2)",
                background: nameInput.trim() ? "var(--blue)" : "var(--bg2)",
                color: nameInput.trim() ? "#fff" : "var(--text-3)",
                fontSize:13, fontWeight:500,
              }}>+</button>
            </div>
          </div>

          {/* Content */}
          {activeStudentId ? (
            <StudentView studentId={activeStudentId} />
          ) : (
            <Card>
              <EmptyState icon="◈" title="Bereit." subtitle="Fueге eine Schueler:in hinzu oder waehle eine aus." />
            </Card>
          )}
        </div>
      </div>

      {showGroupCompare && (
        <GroupComparisonPanel
          comparison={groupComparison ?? null}
          entries={groupEntries}
          onClose={()=>setShowGroupCompare(false)}
        />
      )}
    </div>
  );
}
