"use client";
import { useState } from "react";
import { useLuneaStore } from "@/store/lunea";

export function StudentJoin() {
  const { joinSession, setView } = useLuneaStore();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) return;
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 300)); // small UX delay
    const result = joinSession(code.trim().toUpperCase(), name.trim());
    if (!result.success) {
      setError("Session-Code nicht gefunden. Bitte pruefen.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #FFF7ED 0%, #EFF6FF 100%)",
      padding:24,
    }}>
      <div style={{
        background:"var(--bg1)", border:"1.5px solid var(--border)",
        borderRadius:24, padding:"36px 32px",
        width:"100%", maxWidth:400,
        boxShadow:"var(--shadow-lg)",
        animation:"scaleIn 0.3s var(--ease-spring)",
      }}>
        <button
          onClick={() => setView("landing")}
          style={{ background:"none", border:"none", color:"var(--text-3)", fontSize:13, cursor:"pointer", marginBottom:20, padding:0 }}
        >← Zurueck</button>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🧑‍🎓</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", marginBottom:6 }}>
            Session beitreten
          </h2>
          <p style={{ fontSize:13.5, color:"var(--text-3)", lineHeight:1.6 }}>
            Gib den Code deiner Lehrkraft und deinen Namen ein.
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", letterSpacing:"0.03em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
              Session-Code
            </label>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={e => e.key === "Enter" && name.trim() && handleJoin()}
              placeholder="z.B. AB3XY7"
              maxLength={6}
              style={{
                textAlign:"center", fontSize:22, fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase",
                borderRadius:12, padding:"12px 16px",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", letterSpacing:"0.03em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
              Dein Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && code.trim().length === 6 && handleJoin()}
              placeholder="Vorname oder Spitzname"
              style={{ fontSize:14, borderRadius:12 }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              padding:"10px 14px", borderRadius:10,
              background:"rgba(220,38,38,0.06)", border:"1.5px solid rgba(220,38,38,0.15)",
              fontSize:13, color:"#DC2626",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={!code.trim() || !name.trim() || loading}
            style={{
              padding:"13px", borderRadius:12, border:"none",
              background: (!code.trim() || !name.trim()) ? "var(--bg3)" : "var(--orange)",
              color: (!code.trim() || !name.trim()) ? "var(--text-3)" : "#fff",
              fontSize:15, fontWeight:600, cursor:"pointer",
              boxShadow: code.trim() && name.trim() ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
              transition:"all 0.2s",
            }}
          >
            {loading ? "Verbinden..." : "Beitreten →"}
          </button>
        </div>
      </div>
    </div>
  );
}
