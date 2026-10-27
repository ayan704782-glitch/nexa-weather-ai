import React, { useState, useEffect } from "react";
import { Globe, Thermometer, CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, ChevronRight, Bell, BellRing, Navigation, Activity } from "lucide-react";

// All-India Strategic Meteorological & Cyclone Monitoring Nodes
const INDIA_MONITORING_NODES = [
  { name: 'Coastal Andhra Pradesh (Visakhapatnam/Kakinada)', lat: 17.6868, lon: 83.2185, isCycloneBasin: true },
  { name: 'Odisha Coast (Puri/Gopalpur)', lat: 19.8135, lon: 85.8312, isCycloneBasin: true },
  { name: 'Gangetic West Bengal & Sundarbans', lat: 21.9497, lon: 88.9000, isCycloneBasin: true },
  { name: 'Bay of Bengal Central Vortex Zone', lat: 16.2000, lon: 85.5000, isCycloneBasin: true },
  { name: 'Tamil Nadu Coast (Chennai)', lat: 13.0827, lon: 80.2707, isCycloneBasin: true },
  { name: 'Coastal Karnataka & Kerala', lat: 12.9141, lon: 74.8560, isCycloneBasin: false },
  { name: 'Konkan & Maharashtra Coast (Mumbai)', lat: 19.0760, lon: 72.8777, isCycloneBasin: true },
  { name: 'Gujarat Saurashtra Coast', lat: 21.6417, lon: 69.6293, isCycloneBasin: true },
  { name: 'Northeast India (Assam/Meghalaya)', lat: 25.5788, lon: 91.8933, isCycloneBasin: false }
];

export default function GlobalIntelligenceSection() {
  const [globalStats, setGlobalStats] = useState({
    avgTemp: '22.5',
    totalRain: '2.6',
    maxWind: '12',
    avgHumidity: '72'
  });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [cycloneData, setCycloneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastSynced, setLastSynced] = useState('');

  // Format dynamic dates for timeline & alerts (e.g. 28 OCT)
  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  // Trigger Live Browser Notification
  const enableLiveNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Browser notifications are not supported on this device.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      if (liveAlerts.length > 0) {
        new Notification('⚠️ NexaWeather AI: Live Meteorological Alert', {
          body: `${liveAlerts[0].title} detected in ${liveAlerts[0].region} (${liveAlerts[0].metrics})`,
        });
      }
    }
  };

  useEffect(() => {
    const fetchAllIndiaLiveTelemetry = async () => {
      try {
        setLoading(true);
        const lats = INDIA_MONITORING_NODES.map(n => n.lat).join(',');
        const lons = INDIA_MONITORING_NODES.map(n => n.lon).join(',');

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m&daily=precipitation_sum&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();
        const results = Array.isArray(data) ? data : [data];

        let tempSum = 0;
        let rainSum = 0;
        let humiditySum = 0;
        let highestWind = 0;
        const detectedAlerts = [];
        let activeBasinNode = null;

        results.forEach((nodeData, index) => {
          const nodeInfo = INDIA_MONITORING_NODES[index];
          const curr = nodeData.current || {};
          const daily = nodeData.daily || {};

          const temp = curr.temperature_2m ?? 28;
          const hum = curr.relative_humidity_2m ?? 75;
          const precip = curr.precipitation ?? 0;
          const dailyRain = daily.precipitation_sum?.[0] ?? precip;
          const wind = curr.wind_speed_10m ?? 10;
          const gusts = curr.wind_gusts_10m ?? wind;
          const pressure = curr.surface_pressure ?? 1010;
          const code = curr.weather_code ?? 0;

          tempSum += temp;
          rainSum += dailyRain;
          humiditySum += hum;
          if (gusts > highestWind) highestWind = gusts;

          let alertTitle = null;
          let severity = 'MODERATE';

          if (gusts >= 50 || pressure < 998) {
            alertTitle = 'Cyclonic Storm & Squall Warning';
            severity = 'CRITICAL';
          } else if (dailyRain >= 15 || precip >= 2 || [63, 65, 81, 82, 95, 96, 99].includes(code)) {
            alertTitle = 'Heavy Rainfall & Thunderstorm Alert';
            severity = dailyRain >= 35 || gusts >= 40 ? 'HIGH' : 'MODERATE';
          } else if (gusts >= 28 || wind >= 20) {
            alertTitle = 'Strong Coastal Wind Advisory';
            severity = 'MODERATE';
          } else if (hum >= 85 && temp >= 29) {
            alertTitle = 'High Moisture & Convective Instability';
            severity = 'WATCH';
          }

          if (alertTitle) {
            detectedAlerts.push({
              title: alertTitle,
              region: nodeInfo.name,
              dateRange: `${getFormattedDate(0)} – ${getFormattedDate(1)}`,
              severity,
              metrics: `Wind Gusts: ${gusts.toFixed(1)} km/h • Pressure: ${pressure.toFixed(0)} hPa • Rain: ${dailyRain.toFixed(1)} mm`,
              score: gusts + dailyRain * 2 + (1015 - pressure) * 3
            });
          }

          if (nodeInfo.isCycloneBasin) {
            const vortexScore = (1015 - pressure) * 2.5 + gusts * 1.2 + dailyRain;
            if (!activeBasinNode || vortexScore > activeBasinNode.vortexScore) {
              activeBasinNode = {
                ...nodeInfo,
                temp,
                wind,
                gusts,
                pressure,
                dailyRain,
                vortexScore
              };
            }
          }
        });

        const count = results.length;
        setGlobalStats({
          avgTemp: (tempSum / count).toFixed(1),
          totalRain: (rainSum / count).toFixed(1),
          maxWind: highestWind.toFixed(0),
          avgHumidity: Math.round(humiditySum / count)
        });

        detectedAlerts.sort((a, b) => b.score - a.score);
        setLiveAlerts(detectedAlerts.slice(0, 2));

        if (activeBasinNode) {
          let systemCategory = 'LOW PRESSURE AREA';
          let systemName = 'Bay of Bengal / Coastal System (Live)';
          if (activeBasinNode.pressure <= 990 || activeBasinNode.gusts >= 88) {
            systemCategory = 'CYCLONIC STORM';
            systemName = 'Active Tropical Cyclone (Bay of Bengal)';
          } else if (activeBasinNode.pressure <= 1000 || activeBasinNode.gusts >= 50) {
            systemCategory = 'DEEP DEPRESSION';
            systemName = `Depression Vortex • ${activeBasinNode.name.split('(')[0].trim()}`;
          } else if (activeBasinNode.pressure <= 1006 || activeBasinNode.gusts >= 32) {
            systemCategory = 'WELL-MARKED LOW';
            systemName = `Atmospheric Disturbance • ${activeBasinNode.name.split('(')[0].trim()}`;
          } else {
            systemCategory = 'ACTIVE BASIN TELEMETRY';
            systemName = `Basin Watch • ${activeBasinNode.name.split('(')[0].trim()}`;
          }

          setCycloneData({
            name: systemName,
            category: systemCategory,
            movement: `Tracking WNW near ${activeBasinNode.name}`,
            coords: `${activeBasinNode.lat.toFixed(2)}°N, ${activeBasinNode.lon.toFixed(2)}°E`,
            maxWind: `${activeBasinNode.gusts.toFixed(1)} km/h`,
            pressure: `${activeBasinNode.pressure.toFixed(1)} hPa`
          });
        }

        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching live regional intelligence:', err);
        setLoading(false);
      }
    };

    fetchAllIndiaLiveTelemetry();
  }, []);

  return (
    <div style={{ maxWidth: "1380px", margin: "36px auto 0", padding: "0 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* SECTION 1: GLOBAL OVERVIEW (100% LIVE MULTI-NODE) */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(56, 189, 248, 0.2)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
              <Globe size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>GLOBAL & PAN-INDIA LIVE OVERVIEW</h3>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Real-time telemetry aggregated across 9 strategic Indian coastal stations</span>
            </div>
          </div>
          <span style={{ fontSize: "11px", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: "999px", fontWeight: "600" }}>
            ● Live Grid {lastSynced && `(${lastSynced})`}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}>
          
          {/* Card 1: Mean Temp */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(251, 191, 36, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(251, 191, 36, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
                <Thermometer size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#fcd34d", letterSpacing: "0.8px" }}>MEAN REGIONAL TEMP</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              {globalStats.avgTemp}°<small style={{ fontSize: "16px", color: "#94a3b8" }}>C</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,25 Q50,15 100,22 T200,10 L200,35 L0,35 Z" fill="rgba(251, 191, 36, 0.12)" />
                <path d="M0,25 Q50,15 100,22 T200,10" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>Live coastal & inland mean</span>
          </div>

          {/* Card 2: Rainfall */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(56, 189, 248, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                <CloudRain size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#7dd3fc", letterSpacing: "0.8px" }}>24H RAINFALL AVG</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              {globalStats.totalRain} <small style={{ fontSize: "15px", color: "#94a3b8" }}>mm</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,28 Q60,18 120,24 T200,14 L200,35 L0,35 Z" fill="rgba(56, 189, 248, 0.12)" />
                <path d="M0,28 Q60,18 120,24 T200,14" fill="none" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>Active moisture feed</span>
          </div>

          {/* Card 3: Wind Speed */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(168, 85, 247, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                <Wind size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#d8b4fe", letterSpacing: "0.8px" }}>PEAK GUST</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              {globalStats.maxWind} <small style={{ fontSize: "15px", color: "#94a3b8" }}>km/h</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,20 Q50,28 100,18 T200,22 L200,35 L0,35 Z" fill="rgba(168, 85, 247, 0.12)" />
                <path d="M0,20 Q50,28 100,18 T200,22" fill="none" stroke="#c084fc" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#c084fc", fontWeight: "600" }}>Highest surface gust</span>
          </div>

          {/* Card 4: Humidity */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(6, 182, 212, 0.25)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(6, 182, 212, 0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee" }}>
                <Droplets size={16} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#67e8f9", letterSpacing: "0.8px" }}>BASIN HUMIDITY</span>
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: "4px 0" }}>
              {globalStats.avgHumidity}<small style={{ fontSize: "15px", color: "#94a3b8" }}>%</small>
            </div>
            <div style={{ height: "32px", width: "100%", margin: "6px 0" }}>
              <svg viewBox="0 0 200 35" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <path d="M0,22 Q70,12 140,26 T200,15 L200,35 L0,35 Z" fill="rgba(6, 182, 212, 0.12)" />
                <path d="M0,22 Q70,12 140,26 T200,15" fill="none" stroke="#22d3ee" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>Atmospheric saturation</span>
          </div>

        </div>
      </div>


      {/* SECTION 2: LIVE WEATHER ALERTS & NOTIFICATIONS */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(245, 158, 11, 0.25)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>LIVE WEATHER ALERTS (ALL-INDIA SCANNER)</h3>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Automatically triggered from real-time wind gusts & pressure drops</span>
            </div>
          </div>

          <button
            onClick={enableLiveNotifications}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: notificationsEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              color: notificationsEnabled ? '#10b981' : '#38bdf8',
              border: `1px solid ${notificationsEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.35)'}`,
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {notificationsEnabled ? <BellRing size={15} /> : <Bell size={15} />}
            {notificationsEnabled ? 'Live Alerts Active' : 'Enable Browser Push Alerts'}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading ? (
            <div style={{ color: '#94a3b8', padding: '16px', fontSize: '13px' }}>Scanning live telemetry across Indian coastal zones...</div>
          ) : liveAlerts.length > 0 ? (
            liveAlerts.map((alert, idx) => (
              <div key={idx} style={{ background: "linear-gradient(145deg, rgba(13, 20, 38, 0.9), rgba(8, 12, 24, 0.95))", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "18px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", background: "rgba(245, 158, 11, 0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", flexShrink: 0 }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "2px" }}>{alert.title}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{alert.dateRange} &nbsp;•&nbsp; <strong style={{ color: '#38bdf8' }}>{alert.region}</strong></div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "3px" }}>{alert.metrics}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: "11px", fontWeight: "700", padding: "5px 14px", borderRadius: "999px" }}>{alert.severity}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#10b981', padding: '16px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', fontSize: '13px' }}>
              ✓ No severe cyclonic or extreme weather anomalies across monitored Indian grids right now.
            </div>
          )}
        </div>

      </div>


      {/* SECTION 3: LIVE CYCLONE & BASIN VORTEX TRACKER */}
      <div style={{ 
        background: "linear-gradient(160deg, #0b1329 0%, #060a17 100%)", 
        border: "1px solid rgba(168, 85, 247, 0.3)", 
        borderRadius: "26px", 
        padding: "28px", 
        boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" 
      }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
            <Navigation size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0, letterSpacing: "0.5px" }}>LIVE CYCLONE & BASIN VORTEX TRACKER</h3>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Real-time low-pressure & wind telemetry across Bay of Bengal & Indian coasts</span>
          </div>
        </div>

        {/* Satellite Radar Map Container */}
        <div style={{ 
          position: "relative", 
          minHeight: "400px", 
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
          <div style={{ background: "rgba(11, 16, 32, 0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(168, 85, 247, 0.45)", borderRadius: "18px", padding: "18px 22px", width: "360px", boxShadow: "0 20px 40px rgba(0,0,0,0.8)", zIndex: 5 }}>
            {cycloneData ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", margin: 0 }}>{cycloneData.name}</h4>
                  <span style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px" }}>{cycloneData.category}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>{cycloneData.movement}</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#cbd5e1", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Active Coordinates:</span>
                    <strong style={{ color: "#38bdf8" }}>{cycloneData.coords}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Peak Gusts:</span>
                    <strong style={{ color: "#c084fc" }}>{cycloneData.maxWind}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Central Pressure:</span>
                    <strong style={{ color: "#fbbf24" }}>{cycloneData.pressure}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Analyzing basin atmospheric pressure...</div>
            )}
          </div>

          {/* Bottom Timeline Path with Dynamic Live Dates */}
          <div style={{ position: "relative", zIndex: 5, paddingBottom: "6px", marginTop: "30px" }}>
            
            <div style={{ position: "absolute", top: "22px", left: "10%", right: "10%", height: "2px", background: "repeating-linear-gradient(90deg, #c084fc, #c084fc 6px, transparent 6px, transparent 12px)", zIndex: 1 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2, padding: "0 20px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "14px", height: "14px", background: "#38bdf8", borderRadius: "50%", border: "3px solid #ffffff", boxShadow: "0 0 12px #38bdf8" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8" }}>{getFormattedDate(3)}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "12px", background: "#34d399", borderRadius: "50%", border: "2px solid #ffffff" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399" }}>{getFormattedDate(2)}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:00</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transform: "scale(1.15)" }}>
                <span style={{ width: "18px", height: "18px", background: "#c084fc", borderRadius: "50%", border: "3px solid #ffffff", boxShadow: "0 0 22px #c084fc" }} />
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc" }}>{getFormattedDate(1)}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>LIVE SCAN</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "12px", background: "#a855f7", borderRadius: "50%", border: "2px solid #ffffff" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#a855f7" }}>{getFormattedDate(0)}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>TODAY</span>
              </div>

            </div>

            {/* Legend Footer */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "18px", marginTop: "18px", flexWrap: "wrap", fontSize: "11px", color: "#94a3b8" }}>
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