"use client";
import { useState, useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";

export function LandingScreen() {
  const { setView } = useLuneaStore();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 50%, #F5F3FF 100%)",
      padding:"48px 24px", position:"relative", overflow:"hidden",
    }}>
      {/* Decorative orbs */}
      <div style={{ position:"fixed", top:"-15%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-15%", left:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)", pointerEvents:"none" }} />

      <div style={{
        textAlign:"center", maxWidth:560, position:"relative", zIndex:1,
        opacity:vis?1:0, transform:vis?"none":"translateY(16px)",
        transition:"opacity 0.6s, transform 0.6s",
      }}>
        {/* Eyebrow */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7,
          padding:"5px 14px", borderRadius:100,
          background:"rgba(37,99,235,0.08)", border:"1.5px solid rgba(37,99,235,0.15)",
          fontSize:11.5, color:"var(--blue)", fontWeight:600, marginBottom:28,
        }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--blue)", display:"inline-block" }} />
          Paedagogische KI-Lernumgebung
        </div>

        {/* Logo */}
        <h1 style={{
          fontSize:76, fontWeight:700, letterSpacing:"-0.05em",
          background:"linear-gradient(135deg, #1D4ED8 0%, #F97316 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text", lineHeight:0.95, marginBottom:22,
        }}>
          LUNEA
        </h1>

        <p style={{ fontSize:16.5, color:"var(--text-2)", lineHeight:1.75, marginBottom:44, letterSpacing:"-0.01em" }}>
          Kein freier KI-Chat.<br />
          Ein gefuehrtes Lernsystem mit Phasenlogik,<br />
          Eigenanteil und Gruppenvergleich.
        </p>

        {/* Role selection */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:40 }}>
          <button
            onClick={() => setView("teacher-setup")}
            style={{
              padding:"20px 16px", borderRadius:18,
              background:"var(--bg1)", border:"1.5px solid var(--border-2)",
              boxShadow:"var(--shadow)",
              display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              cursor:"pointer", transition:"all 0.2s var(--ease)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(37,99,235,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
            }}
          >
            <div style={{ fontSize:28 }}>👩‍🏫</div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:4 }}>Lehrkraft</div>
              <div style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.5 }}>Session erstellen,<br />Phasen steuern</div>
            </div>
            <div style={{
              padding:"6px 16px", borderRadius:100,
              background:"var(--blue)", color:"#fff",
              fontSize:12, fontWeight:600,
            }}>Dashboard oeffnen</div>
          </button>

          <button
            onClick={() => setView("student-join")}
            style={{
              padding:"20px 16px", borderRadius:18,
              background:"var(--bg1)", border:"1.5px solid var(--border-2)",
              boxShadow:"var(--shadow)",
              display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              cursor:"pointer", transition:"all 0.2s var(--ease)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--orange)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(249,115,22,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
            }}
          >
            <div style={{ fontSize:28 }}>🧑‍🎓</div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:4 }}>Schueler:in</div>
              <div style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.5 }}>Session beitreten,<br />lernen und denken</div>
            </div>
            <div style={{
              padding:"6px 16px", borderRadius:100,
              background:"var(--orange)", color:"#fff",
              fontSize:12, fontWeight:600,
            }}>Mit Code eintreten</div>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap" }}>
          {[["17","Faecher"],["5–13","Jahrgaenge"],["4","Lernphasen"],["3","KI-Modi"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em" }}>{n}</div>
              <div style={{ fontSize:10.5, color:"var(--text-3)", letterSpacing:"0.04em", textTransform:"uppercase", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
