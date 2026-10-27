import React from "react";
import {
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Gauge,
  Leaf,
  Sunrise,
  Sunset,
  Clock
} from "lucide-react";
import "./HourlyTelemetrySection.css";

export default function HourlyTelemetrySection({ hourlyData = [], currentWeatherData = {} }) {
  
  // Helper to render realistic icon based on weather condition code & hour
  const renderWeatherIcon = (code, hourNum) => {
    const isNight = hourNum < 6 || hourNum >= 18;
    
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return <CloudRain size={26} style={{ color: "#38bdf8" }} />;
    }
    if ([1, 2, 3, 45, 48].includes(code)) {
      return <Cloud size={26} style={{ color: "#94a3b8" }} />;
    }
    if (isNight) {
      return <Moon size={24} style={{ color: "#818cf8" }} />;
    }
    return <Sun size={26} style={{ color: "#fbbf24" }} />;
  };

  const displayHourly = hourlyData.length > 0 ? hourlyData : [
    { time: "Now", temp: "25°", code: 0, hour: 17, active: true },
    { time: "18:00", temp: "25°", code: 0, hour: 18, active: false },
    { time: "19:00", temp: "25°", code: 1, hour: 19, active: false },
    { time: "20:00", temp: "25°", code: 2, hour: 20, active: false },
    { time: "21:00", temp: "24°", code: 61, hour: 21, active: false },
    { time: "22:00", temp: "24°", code: 61, hour: 22, active: false },
    { time: "23:00", temp: "24°", code: 3, hour: 23, active: false },
  ];

  const humidity = currentWeatherData?.humidity ?? "67%";
  const windSpeed = currentWeatherData?.windSpeed ?? "4.9 km/h";
  const precipitation = currentWeatherData?.precipitation ?? "0 mm";
  const pressure = currentWeatherData?.pressure ?? "1008.7 hPa";
  const airQuality = currentWeatherData?.airQuality ?? "Good";

  const formatLiveTime = (timeInput) => {
    if (!timeInput) return "05:42 AM";
    if (timeInput.includes("AM") || timeInput.includes("PM")) return timeInput;
    try {
      let tPart = timeInput.includes("T") ? timeInput.split("T")[1] : timeInput;
      let [hStr, mStr] = tPart.split(":");
      let hour = parseInt(hStr, 10);
      const minute = mStr || "00";
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${ampm}`;
    } catch {
      return "05:42 AM";
    }
  };

  const sunrise = formatLiveTime(currentWeatherData?.sunrise || "05:42 AM");
  const sunset = formatLiveTime(currentWeatherData?.sunset || "05:14 PM");

  // Real-Time Dynamic Sun Telemetry Status inside the component
  const getLiveSunTelemetry = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 4 && currentHour < 12) {
      return {
        sunriseSub: "Morning twilight active • Dawn live 🌅",
        sunsetSub: "Evening twilight pending • Dusk horizon"
      };
    } else if (currentHour >= 12 && currentHour < 18) {
      return {
        sunriseSub: "Dawn completed • Solar zenith active ✓",
        sunsetSub: "Approaching dusk • Sunset telemetry armed ⏳"
      };
    } else {
      return {
        sunriseSub: "Dawn completed • Next cycle tomorrow",
        sunsetSub: "Night telemetry active • Dusk horizon passed 🌙"
      };
    }
  };

  const sunStatus = getLiveSunTelemetry();

  return (
    <div className="nexa-telemetry-wrapper">
      
      {/* 1. 24-HOUR TELEMETRY PROGRESSION */}
      <div className="hourly-progression-block">
        <div className="hourly-strip-panel">
          <div className="hourly-strip-header">
            <div className="hourly-head-left">
              <span className="cyan-dot-pulse" />
              <span className="hourly-eyebrow">NEXT 24 HOURS</span>
            </div>
            <div className="hourly-head-right">
              <span className="hourly-label-right">24-HOUR TELEMETRY PROGRESSION</span>
              <span className="hourly-unit-badge">
                <Clock size={11} /> Hourly forecast strip
              </span>
            </div>
          </div>

          <div className="hourly-slots-row">
            {displayHourly.map((item, idx) => {
              const hourNum = item.hour !== undefined ? item.hour : new Date().getHours() + idx;
              const weatherCode = item.code !== undefined ? item.code : 0;
              return (
                <div
                  key={idx}
                  className={`hourly-slot-item ${item.active || idx === 0 ? "active-now" : ""}`}
                >
                  <span className="slot-time">{item.time}</span>
                  <div className="slot-icon-wrap">
                    {renderWeatherIcon(weatherCode, hourNum)}
                  </div>
                  <strong className="slot-temp">{item.temp}</strong>
                </div>
              );
            })}
          </div>

          <div className="hourly-progress-track">
            <div className="hourly-progress-thumb" />
          </div>
        </div>
      </div>

      {/* 2. 6 WEATHER METRIC CARDS */}
      <div className="telemetry-six-grid">
        
        {/* HUMIDITY */}
        <div className="t-card card-humidity">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box cyan-box"><Droplets size={18} /></div>
              <span className="t-title cyan-title">Humidity</span>
            </div>
            <span className="t-badge cyan-badge">MOISTURE</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val">{humidity}</strong></div>
          <div className="t-visual-graph">
            <svg viewBox="0 0 300 42" preserveAspectRatio="none">
              <path d="M0,30 Q35,28 65,22 T125,24 T185,12 T245,20 T300,26 L300,42 L0,42 Z" fill="rgba(14, 165, 233, 0.2)" />
              <path d="M0,30 Q35,28 65,22 T125,24 T185,12 T245,20 T300,26" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
          <div className="t-bar-track"><div className="t-bar-fill cyan-fill" style={{ width: "67%" }} /></div>
          <p className="t-footer-caption">Dew point & relative moisture</p>
        </div>

        {/* WIND SPEED */}
        <div className="t-card card-wind">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box purple-box"><Wind size={18} /></div>
              <span className="t-title purple-title">Wind speed</span>
            </div>
            <span className="t-badge purple-badge">VECTOR</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val">{windSpeed}</strong></div>
          <div className="t-visual-graph">
            <svg viewBox="0 0 300 42" preserveAspectRatio="none">
              <path d="M0,32 Q45,24 90,30 T175,18 T245,25 T300,24 L300,42 L0,42 Z" fill="rgba(168, 85, 247, 0.2)" />
              <path d="M0,32 Q45,24 90,30 T175,18 T245,25 T300,24" fill="none" stroke="#a855f7" strokeWidth="2" />
            </svg>
          </div>
          <div className="t-bar-track"><div className="t-bar-fill purple-fill" style={{ width: "42%" }} /></div>
          <p className="t-footer-caption">Surface velocity at 10m</p>
        </div>

        {/* PRECIPITATION */}
        <div className="t-card card-precip">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box amber-box"><CloudRain size={18} /></div>
              <span className="t-title amber-title">Precipitation</span>
            </div>
            <span className="t-badge amber-badge">RAINFALL</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val">{precipitation}</strong></div>
          <div className="t-visual-graph">
            <svg viewBox="0 0 300 42" preserveAspectRatio="none">
              <line x1="0" y1="28" x2="300" y2="28" stroke="rgba(245, 158, 11, 0.55)" strokeWidth="2" strokeDasharray="3 6" />
              <circle cx="45" cy="28" r="2" fill="#fbbf24" />
              <circle cx="135" cy="28" r="2" fill="#fbbf24" />
              <circle cx="225" cy="28" r="2" fill="#fbbf24" />
            </svg>
          </div>
          <div className="t-bar-track"><div className="t-bar-fill amber-fill" style={{ width: "15%" }} /></div>
          <p className="t-footer-caption">In last hour accumulation</p>
        </div>

        {/* DAYLIGHT */}
        <div className="t-card card-daylight">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box pink-box"><Sun size={18} /></div>
              <span className="t-title pink-title">Daylight</span>
            </div>
            <span className="t-badge pink-badge">SOLAR CYCLE</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val">Daylight</strong></div>
          <div className="t-visual-graph">
            <svg viewBox="0 0 300 48" preserveAspectRatio="none">
              <path d="M 85,40 C 125,40 145,6 185,6 C 225,6 245,40 285,40 L 285,48 L 85,48 Z" fill="rgba(236, 72, 153, 0.2)" />
              <path d="M 85,40 C 125,40 145,6 185,6 C 225,6 245,40 285,40" fill="none" stroke="#f43f5e" strokeWidth="2.2" />
              <circle cx="185" cy="6" r="3.5" fill="#fda4af" />
            </svg>
          </div>
          <div className="t-bar-track"><div className="t-bar-fill pink-fill" style={{ width: "65%" }} /></div>
          <p className="t-footer-caption">Active solar radiation</p>
        </div>

        {/* PRESSURE */}
        <div className="t-card card-pressure">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box teal-box"><Gauge size={18} /></div>
              <span className="t-title teal-title">Pressure</span>
            </div>
            <span className="t-badge teal-badge">BAROMETER</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val">{pressure}</strong></div>
          <div className="t-visual-graph">
            <svg viewBox="0 0 300 42" preserveAspectRatio="none">
              <path d="M0,30 Q40,26 80,28 T165,16 T235,22 T300,24 L300,42 L0,42 Z" fill="rgba(6, 182, 212, 0.2)" />
              <path d="M0,30 Q40,26 80,28 T165,16 T235,22 T300,24" fill="none" stroke="#22d3ee" strokeWidth="2" />
            </svg>
          </div>
          <div className="t-bar-track"><div className="t-bar-fill teal-fill" style={{ width: "60%" }} /></div>
          <p className="t-footer-caption">Steady atmospheric pressure</p>
        </div>

        {/* AIR QUALITY */}
        <div className="t-card card-aqi">
          <div className="t-card-header">
            <div className="t-head-left">
              <div className="t-icon-box green-box"><Leaf size={18} /></div>
              <span className="t-title green-title">Air Quality</span>
            </div>
            <span className="t-badge green-badge">AQI 42</span>
          </div>
          <div className="t-value-row"><strong className="t-main-val green-val">{airQuality}</strong></div>
          <div className="t-visual-graph aqi-bars-container">
            {[25, 35, 30, 45, 60, 50, 40, 35, 30, 28, 32, 38, 42, 40, 35, 30, 38, 48, 65, 78, 85].map((h, i) => (
              <span key={i} className="aqi-v-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="t-bar-track"><div className="t-bar-fill green-fill" style={{ width: "30%" }} /></div>
          <p className="t-footer-caption">PM2.5 12 µg/m³ (Clean air)</p>
        </div>

      </div>

      {/* 3. DYNAMIC SUNRISE AND SUNSET HORIZON CARDS */}
      <div className="horizon-cards-row">
        
        <div className="horizon-card sunrise-card">
          <div className="horizon-art-layer" aria-hidden="true">
            <svg viewBox="0 0 600 170" preserveAspectRatio="none">
              <defs>
                <radialGradient id="sunriseSunGlow" cx="67%" cy="78%" r="42%">
                  <stop offset="0%" stopColor="rgba(251, 191, 36, 0.85)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="600" height="170" fill="url(#sunriseSunGlow)" />
              <circle cx="402" cy="132" r="14" fill="#fde047" />
              <path d="M220,170 L285,122 L345,148 L402,132 L465,112 L535,142 L600,118 L600,170 Z" fill="rgba(18, 16, 26, 0.85)" />
            </svg>
          </div>
          <div className="horizon-content-left">
            <div className="horizon-icon-circle amber-horizon-icon"><Sunrise size={24} /></div>
            <div className="horizon-text-block">
              <span className="horizon-eyebrow amber-eyebrow">Sunrise</span>
              <strong className="horizon-time">{sunrise}</strong>
              <p className="horizon-sub">{sunStatus.sunriseSub}</p>
            </div>
          </div>
        </div>

        <div className="horizon-card sunset-card">
          <div className="horizon-art-layer" aria-hidden="true">
            <svg viewBox="0 0 600 170" preserveAspectRatio="none">
              <defs>
                <radialGradient id="sunsetSunGlow" cx="67%" cy="78%" r="42%">
                  <stop offset="0%" stopColor="rgba(236, 72, 153, 0.8)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="600" height="170" fill="url(#sunsetSunGlow)" />
              <circle cx="402" cy="133" r="13" fill="#fbbf24" />
              <path d="M220,170 L290,124 L350,146 L402,133 L468,110 L535,140 L600,116 L600,170 Z" fill="rgba(20, 12, 34, 0.85)" />
            </svg>
          </div>
          <div className="horizon-content-left">
            <div className="horizon-icon-circle purple-horizon-icon"><Sunset size={24} /></div>
            <div className="horizon-text-block">
              <span className="horizon-eyebrow purple-eyebrow">Sunset</span>
              <strong className="horizon-time">{sunset}</strong>
              <p className="horizon-sub">{sunStatus.sunsetSub}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}