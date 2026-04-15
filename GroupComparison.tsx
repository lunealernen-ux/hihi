"use client";
import { Lbl, LoadingDots, Divider } from "@/components/ui";
import { GroupComparison } from "@/types";

export function GroupComparisonPanel({
  comparison, entries, onClose,
}: {
  comparison: GroupComparison | null;
  entries: Array<{ name: string; answer: string }>;
  onClose: () => void;
}) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:400,
        background:"rgba(0,0,0,0.45)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
      }}
    >
      <div className="scale-in" style={{
        background:"var(--bg1)", border:"1.5px solid var(--border-2)",
        borderRadius:24, width:"100%", maxWidth:580, maxHeight:"88vh",
        overflowY:"auto", boxShadow:"var(--shadow-lg)",
      }}>
        <div style={{ padding:"22px 26px" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:"var(--text)", letterSpacing:"-0.025em" }}>
                Gruppenvergleich
              </div>
              <div style={{ fontSize:12.5, color:"var(--text-3)", marginTop:3 }}>
                Transfer-Saetze · {entries.length} Schueler:innen
              </div>
            </div>
            <button onClick={onClose} style={{
              width:32, height:32, borderRadius:9,
              background:"var(--bg2)", border:"1.5px solid var(--border)",
              color:"var(--text-2)", fontSize:16, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>×</button>
          </div>

          {/* All answers */}
          <div style={{ marginBottom:20 }}>
            <Lbl style={{marginBottom:10}}>Antworten ({entries.length})</Lbl>
            {entries.length===0 ? (
              <div style={{fontSize:13, color:"var(--text-4)", fontStyle:"italic"}}>
                Noch keine Transfer-Saetze vorhanden.
              </div>
            ) : entries.map((e,i) => {
              const isStrongest = comparison?.starksteAntwort===e.name && !comparison?.loading;
              return (
                <div key={i} style={{
                  display:"flex", gap:12, alignItems:"flex-start",
                  padding:"10px 13px", marginBottom:7,
                  background: isStrongest ? "rgba(124,58,237,0.06)" : "var(--bg)",
                  border:`1.5px solid ${isStrongest ? "rgba(124,58,237,0.2)" : "var(--border)"}`,
                  borderRadius:11,
                }}>
                  <div style={{ width:80, flexShrink:0 }}>
                    <div style={{
                      fontSize:12, fontWeight:600,
                      color: isStrongest ? "var(--purple)" : "var(--text-3)",
                    }}>{e.name}</div>
                    {isStrongest && (
                      <div style={{fontSize:9.5, color:"var(--purple)", marginTop:2, fontWeight:600}}>★ Staerkste</div>
                    )}
                  </div>
                  <div style={{fontSize:13.5, color:"var(--text)", lineHeight:1.65, flex:1, letterSpacing:"-0.01em"}}>
                    „{e.answer}"
                  </div>
                </div>
              );
            })}
          </div>

          <Divider margin={0} />

          {/* Analysis */}
          {comparison?.loading ? (
            <div style={{ textAlign:"center", padding:"28px 0" }}>
              <LoadingDots />
              <div style={{fontSize:12.5, color:"var(--text-3)", marginTop:12}}>
                KI vergleicht die Transfer-Saetze...
              </div>
            </div>
          ) : !comparison ? (
            <div style={{textAlign:"center", fontSize:13, color:"var(--text-4)", padding:"16px 0"}}>
              Analyse wird gestartet...
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:18 }}>
              {comparison.gemeinsames && (
                <div style={{
                  padding:"12px 15px", borderRadius:12,
                  background:"rgba(37,99,235,0.05)", border:"1.5px solid rgba(37,99,235,0.14)",
                }}>
                  <Lbl color="var(--blue)" style={{marginBottom:6}}>Gemeinsam verstanden</Lbl>
                  <div style={{fontSize:13.5, color:"var(--text)", lineHeight:1.7}}>{comparison.gemeinsames}</div>
                </div>
              )}
              {comparison.unterschiede && (
                <div style={{
                  padding:"12px 15px", borderRadius:12,
                  background:"rgba(249,115,22,0.05)", border:"1.5px solid rgba(249,115,22,0.14)",
                }}>
                  <Lbl color="var(--orange)" style={{marginBottom:6}}>Unterschiede</Lbl>
                  <div style={{fontSize:13.5, color:"var(--text)", lineHeight:1.7}}>{comparison.unterschiede}</div>
                </div>
              )}
              {comparison.starksteAntwort && (
                <div style={{
                  padding:"12px 15px", borderRadius:12,
                  background:"rgba(124,58,237,0.05)", border:"1.5px solid rgba(124,58,237,0.18)",
                }}>
                  <Lbl color="var(--purple)" style={{marginBottom:6}}>Staerkste Antwort</Lbl>
                  <div style={{fontSize:16, fontWeight:700, color:"var(--purple)", letterSpacing:"-0.02em", marginBottom:6}}>
                    {comparison.starksteAntwort}
                  </div>
                  <div style={{fontSize:13.5, color:"var(--text)", lineHeight:1.7}}>{comparison.begruendung}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
