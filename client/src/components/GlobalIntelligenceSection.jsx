import React from "react";
import { Globe, Thermometer, CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";

export default function GlobalIntelligenceSection() {
  return (
    <div style={{ maxWidth: "1380px", margin: "36px auto 0", padding: "0 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* SECTION 1: GLOBAL OVERVIEW */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(56, 189, 248, 0.2)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <div style={{ width: "36px", height: "36px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
            <Globe size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>GLOBAL OVERVIEW</h3>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Key atmospheric conditions at a glance</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}>
          
          {/* Card 1 */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(251, 191, 36, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(251, 191, 36, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
                <Thermometer size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#fcd34d", letterSpacing: "0.8px" }}>AVERAGE TEMPERATURE</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              22.5°<small style={{ fontSize: "16px", color: "#94a3b8" }}>C</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,25 Q50,15 100,22 T200,10 L200,35 L0,35 Z" fill="rgba(251, 191, 36, 0.12)" />
                <path d="M0,25 Q50,15 100,22 T200,10" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>↑ 1.3°C from yesterday</span>
          </div>

          {/* Card 2 */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(56, 189, 248, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                <CloudRain size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#7dd3fc", letterSpacing: "0.8px" }}>RAINFALL</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              2.6 <small style={{ fontSize: "15px", color: "#94a3b8" }}>mm</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,28 Q60,18 120,24 T200,14 L200,35 L0,35 Z" fill="rgba(56, 189, 248, 0.12)" />
                <path d="M0,28 Q60,18 120,24 T200,14" fill="none" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>↑ 0.8 mm from yesterday</span>
          </div>

          {/* Card 3 */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(168, 85, 247, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                <Wind size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#d8b4fe", letterSpacing: "0.8px" }}>WIND SPEED</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              12 <small style={{ fontSize: "15px", color: "#94a3b8" }}>km/h</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,20 Q50,28 100,18 T200,22 L200,35 L0,35 Z" fill="rgba(168, 85, 247, 0.12)" />
                <path d="M0,20 Q50,28 100,18 T200,22" fill="none" stroke="#c084fc" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>→ Steady</span>
          </div>

          {/* Card 4 */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(6, 182, 212, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(6, 182, 212, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee" }}>
                <Droplets size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#67e8f9", letterSpacing: "0.8px" }}>HUMIDITY</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              72<small style={{ fontSize: "15px", color: "#94a3b8" }}>%</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,22 Q70,12 140,26 T200,15 L200,35 L0,35 Z" fill="rgba(6, 182, 212, 0.12)" />
                <path d="M0,22 Q70,12 140,26 T200,15" fill="none" stroke="#22d3ee" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>↑ 5% from yesterday</span>
          </div>

        </div>
      </div>


      {/* SECTION 2: WEATHER ALERTS */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(245, 158, 11, 0.25)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>WEATHER ALERTS</h3>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Stay informed about significant weather events</span>
            </div>
          </div>
          <button style={{ background: "transparent", border: "none", color: "#38bdf8", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            View all alerts <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "18px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(245, 158, 11, 0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "2px" }}>Heavy Rainfall Warning</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>17 May – 20 May &nbsp;•&nbsp; Northeast India</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: "11px", fontWeight: "700", padding: "5px 14px", borderRadius: "999px" }}>MODERATE</span>
            <ChevronRight size={18} style={{ color: "#94a3b8" }} />
          </div>
        </div>

        <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "18px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(245, 158, 11, 0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "2px" }}>Thunderstorm Alert</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>18 May – 19 May &nbsp;•&nbsp; Coastal Karnataka</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: "11px", fontWeight: "700", padding: "5px 14px", borderRadius: "999px" }}>MODERATE</span>
            <ChevronRight size={18} style={{ color: "#94a3b8" }} />
          </div>
        </div>

      </div>


      {/* SECTION 3: CYCLONE TRACKER (3RD IMAGE EXACT SATELLITE RADAR MAP BACKGROUND) */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(168, 85, 247, 0.3)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
            <Wind size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>CYCLONE TRACKER</h3>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Track and monitor tropical cyclone activity</span>
          </div>
        </div>

        {/* Exact Satellite Radar Map Container matching 3rd image */}
        <div style={{ 
          position: "relative", 
          height: "380px", 
          borderRadius: "20px", 
          overflow: "hidden", 
          background: "radial-gradient(circle at 62% 45%, #23124a 0%, #0d0c24 50%, #040712 100%)", 
          border: "1px solid rgba(168, 85, 247, 0.35)", 
          padding: "22px", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between",
          boxShadow: "inset 0 0 100px rgba(107, 33, 168, 0.35)"
        }}>
          
          {/* Satellite Radar Glowing Vortices */}
          <div style={{ position: "absolute", top: "15%", right: "15%", width: "260px", height: "260px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(56, 189, 248, 0.2) 45%, transparent 75%)", borderRadius: "50%", filter: "blur(24px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "38%", right: "30%", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(18px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "28%", right: "22%", width: "60px", height: "60px", background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.4) 40%, transparent 70%)", borderRadius: "50%", filter: "blur(8px)", pointerEvents: "none" }} />

          {/* Top Cyclone Info Card */}
          <div style={{ background: "rgba(11, 16, 32, 0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(168, 85, 247, 0.45)", borderRadius: "18px", padding: "18px 22px", width: "350px", boxShadow: "0 20px 40px rgba(0,0,0,0.8)", zIndex: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>Cyclone 01B</h4>
              <span style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px" }}>CATEGORY 2</span>
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>Moving WNW at 12 km/h</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#cbd5e1", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Current Location:</span>
                <strong style={{ color: "#38bdf8" }}>16.2°N, 86.4°E</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Max Sustained Wind:</span>
                <strong style={{ color: "#c084fc" }}>105 km/h</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Central Pressure:</span>
                <strong style={{ color: "#fbbf24" }}>980 hPa</strong>
              </div>
            </div>
          </div>

          {/* Bottom Timeline Path */}
          <div style={{ position: "relative", zIndex: 5, paddingBottom: "6px" }}>
            
            <div style={{ position: "absolute", top: "22px", left: "10%", right: "10%", height: "2px", background: "repeating-linear-gradient(90deg, #c084fc, #c084fc 6px, transparent 6px, transparent 12px)", zIndex: 1 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2, padding: "0 20px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "14px", height: "14px", background: "#38bdf8", borderRadius: "50%", border: "3px solid #ffffff", boxShadow: "0 0 12px #38bdf8" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8" }}>22 MAY</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "12px", background: "#34d399", borderRadius: "50%", border: "2px solid #ffffff" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399" }}>21 MAY</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transform: "scale(1.15)" }}>
                <span style={{ width: "18px", height: "18px", background: "#c084fc", borderRadius: "50%", border: "3px solid #ffffff", boxShadow: "0 0 22px #c084fc" }} />
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc" }}>20 MAY</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "12px", background: "#a855f7", borderRadius: "50%", border: "2px solid #ffffff" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#a855f7" }}>19 MAY</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

            </div>

            {/* Legend Footer */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "18px", marginTop: "16px", flexWrap: "wrap", fontSize: "11px", color: "#94a3b8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", background: "#38bdf8", borderRadius: "50%" }} /> Tropical Depression</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", background: "#34d399", borderRadius: "50%" }} /> Tropical Storm</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", background: "#fbbf24", borderRadius: "50%" }} /> Category 1</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }} /> Category 2</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", background: "#a855f7", borderRadius: "50%" }} /> Category 3+</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}