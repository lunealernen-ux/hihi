"use client";
import { useLuneaStore } from "@/store/lunea";
import { StudentView } from "./StudentView";
import { PHASE_META } from "@/components/ui";

export function StudentSessionView() {
  const { session, activeStudentId } = useLuneaStore();

  if (!session || !activeStudentId) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ color:"var(--text-3)" }}>Keine aktive Session gefunden.</p>
      </div>
    );
  }

  const phase = session.currentPhase;
  const pm = PHASE_META[phase];
  const cfg = session.config;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Student topbar */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100, height:50,
        background:"rgba(250,250,250,0.92)",
        backdropFilter:"blur(24px)",
        borderBottom:"1.5px solid var(--border)",
        display:"flex", alignItems:"center", padding:"0 20px", gap:12,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, color:pm.color }}>{pm.icon}</span>
          <span style={{ fontSize:12.5, fontWeight:600, color:pm.color }}>{pm.label}</span>
        </div>
        <span style={{ color:"var(--text-4)" }}>·</span>
        <span style={{ fontSize:12, color:"var(--text-3)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {cfg.subject} · {cfg.topic}
        </span>
        <span style={{
          fontSize:10.5, fontWeight:600, color:"var(--text-3)",
          padding:"3px 9px", borderRadius:6,
          background:"var(--bg2)", border:"1.5px solid var(--border)",
        }}>
          {cfg.sessionCode}
        </span>
      </div>

      <div style={{ paddingTop:66, maxWidth:680, margin:"0 auto", padding:"66px 20px 80px" }}>
        <StudentView studentId={activeStudentId} />
      </div>
    </div>
  );
}
