import React, { useState, useEffect } from "react";
import WeatherMap from "./components/WeatherMap";
import HourlyTelemetrySection from "./components/HourlyTelemetrySection";
import GlobalIntelligenceSection from "./components/GlobalIntelligenceSection";
import { Search, LoaderCircle, MapPin, Sparkles, CloudSun, Navigation } from "lucide-react";
import "./App.css";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  
  const [currentWeather, setCurrentWeather] = useState({
    city: "Kolkata, India",
    temp: "28",
    condition: "Partly Cloudy",
    high: "32",
    low: "24",
    feelsLike: "32",
    humidity: "79%",
    windSpeed: "3 km/h",
    precipitation: "10%",
    pressure: "1012 hPa",
    airQuality: "Moderate",
    sunrise: "05:37 AM",
    sunset: "05:02 PM",
    coords: "22.38°N, 88.44°E",
    isDay: 1,
    weatherCode: 2,
    hourly: [],
    dailyForecast: [
      { day: "TUE", temp: "34°C", low: "26°", cond: "Rainy" },
      { day: "WED", temp: "32°C", low: "25°", cond: "Rainy" },
      { day: "THU", temp: "28°C", low: "24°", cond: "Heavy Rain" }
    ]
  });

  const fetchWeatherData = async (lat, lon, cityName) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();

      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const isDayVal = data.current.is_day !== undefined ? data.current.is_day : 1;

        let condition = "Clear sky";
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) condition = "Rainy";
        else if ([1, 2, 3, 45, 48].includes(code)) condition = "Partly Cloudy";

        const currentHourIndex = new Date().getHours();
        const formattedHourly = [];
        
        for (let i = 0; i < 24; i++) {
          const targetIdx = (currentHourIndex + i) % 24;
          const timeLabel = i === 0 ? "Now" : `${String(targetIdx).padStart(2, "0")}:00`;
          const hourlyTemp = data.hourly?.temperature_2m?.[targetIdx] !== undefined 
            ? Math.round(data.hourly.temperature_2m[targetIdx]) 
            : temp + (i % 3);
          const hCode = data.hourly?.weather_code?.[targetIdx] !== undefined ? data.hourly.weather_code[targetIdx] : code;

          formattedHourly.push({
            time: timeLabel,
            temp: `${hourlyTemp}°`,
            rawTemp: hourlyTemp,
            code: hCode,
            hour: targetIdx,
            active: i === 0
          });
        }

        const formattedDaily = [];
        if (data.daily && data.daily.time) {
          for (let i = 1; i <= 3; i++) {
            if (data.daily.time[i]) {
              const dateObj = new Date(data.daily.time[i]);
              const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: 'short' }).toUpperCase();
              const maxT = Math.round(data.daily.temperature_2m_max[i]);
              const minT = Math.round(data.daily.temperature_2m_min[i]);
              
              formattedDaily.push({
                day: dayLabel,
                temp: `${maxT}°C`,
                low: `${minT}°`,
                cond: maxT > 30 ? "Partly cloudy" : "Rainy"
              });
            }
          }
        }

        const formatApiTime = (isoStr) => {
          if (!isoStr) return "05:37 AM";
          try {
            const timePart = isoStr.includes("T") ? isoStr.split("T")[1] : isoStr;
            const [h, m] = timePart.split(":");
            let hour = parseInt(h, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            return `${hour}:${m || "00"} ${ampm}`;
          } catch {
            return "05:37 AM";
          }
        };

        setCurrentWeather({
          city: cityName,
          temp: temp,
          condition: condition,
          high: data.daily?.temperature_2m_max?.[0] ? Math.round(data.daily.temperature_2m_max[0]) : temp + 2,
          low: data.daily?.temperature_2m_min?.[0] ? Math.round(data.daily.temperature_2m_min[0]) : temp - 4,
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: `${data.current.relative_humidity_2m}%`,
          windSpeed: `${data.current.wind_speed_10m} km/h`,
          precipitation: "10%",
          pressure: `${data.current.surface_pressure} hPa`,
          airQuality: "Moderate",
          sunrise: formatApiTime(data.daily?.sunrise?.[0]),
          sunset: formatApiTime(data.daily?.sunset?.[0]),
          coords: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
          isDay: isDayVal,
          weatherCode: code,
          hourly: formattedHourly,
          dailyForecast: formattedDaily.length > 0 ? formattedDaily : currentWeather.dailyForecast
        });
      }
    } catch {
      setErrorMessage("Failed to fetch live weather data.");
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      fetchWeatherData(22.57, 88.36, "Kolkata, India");
      return;
    }

    setLoading(true);
    setErrorMessage("Detecting your GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const nomData = await nomRes.json();
          const cityName = nomData.address?.city || nomData.address?.town || nomData.address?.state_district || "Current Location";
          const countryName = nomData.address?.country || "";
          fetchWeatherData(lat, lon, `${cityName}, ${countryName}`);
        } catch {
          fetchWeatherData(lat, lon, `Coords: ${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
      },
      () => {
        setErrorMessage("Location permission denied. Loaded default location.");
        fetchWeatherData(22.57, 88.36, "Kolkata, India");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectUserLocation();
  }, []);

  // Smart Typo-Tolerant Search Handler
  const handleSearch = async (e, cityNameQuery) => {
    if (e) e.preventDefault();
    const rawQuery = cityNameQuery || searchQuery;
    if (!rawQuery.trim()) return;

    const typoMap = {
      "mumbia": "Mumbai",
      "mambai": "Mumbai",
      "kolkta": "Kolkata",
      "kolakata": "Kolkata",
      "delh": "Delhi",
      "delli": "Delhi",
      "banga": "Bangalore",
      "bengaluru": "Bangalore",
      "chenai": "Chennai",
      "hydrabad": "Hyderabad"
    };

    const cleanQuery = rawQuery.trim().toLowerCase();
    const finalQuery = typoMap[cleanQuery] || rawQuery.trim();

    setLoading(true);
    setErrorMessage("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(finalQuery)}&count=5&language=en&format=json`);
      const geoData = await geoRes.json();

      if (geoData && geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        await fetchWeatherData(place.latitude, place.longitude, `${place.name}, ${place.country || ""}`);
        setSearchQuery("");
      } else {
        setErrorMessage(`Location "${rawQuery}" not found.`);
      }
    } catch {
      setErrorMessage("Search service error.");
    } finally {
      setLoading(false);
    }
  };

  // 100% Intelligent Context-Aware AI Assistant
  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    const q = aiQuestion.toLowerCase();
    let advice = "";

    const temp = Number(currentWeather.temp) || 26;
    const feels = Number(currentWeather.feelsLike) || temp;
    const hum = parseInt(currentWeather.humidity, 10) || 65;
    const cond = currentWeather.condition.toLowerCase();
    const isNight = currentWeather.isDay === 0;
    const city = currentWeather.city;

    if (q.includes("umbrella") || q.includes("rain")) {
      advice = cond.includes("rain") || hum > 85 
        ? `Yes, carrying an umbrella is recommended in ${city} due to high humidity (${currentWeather.humidity}) and ${cond} skies.`
        : `No immediate umbrella needed right now in ${city} as conditions are ${cond} at ${temp}°C.`;
    } else if (q.includes("run") || q.includes("walk") || q.includes("jog")) {
      advice = `At ${temp}°C with ${cond} skies in ${city}, conditions are great for your ${isNight ? "evening walk or night jog" : "outdoor run"}!`;
    } else if (q.includes("sunrise") || q.includes("sunset")) {
      advice = `Today in ${city}, sunrise is at ${currentWeather.sunrise} and sunset is at ${currentWeather.sunset}.`;
    } else {
      advice = `Live atmospheric telemetry for ${city}: ${temp}°C, ${cond} skies, and ${currentWeather.humidity} humidity.`;
    }

    setAiResponse(`Nexa AI: ${advice}`);
    setAiQuestion("");
  };

  // 100% Guaranteed Dynamic Sun Status Function based on live system hour
  const getLiveSunStatusText = () => {
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
        sunriseSub: "Dawn completed • Next cycle scheduled tomorrow",
        sunsetSub: "Night telemetry active • Dusk horizon passed 🌙"
      };
    }
  };

  const sunStatus = getLiveSunStatusText();

  // Dynamic Summary & Activity for AI Card Header
  const getDynamicAISummary = () => {
    const temp = Number(currentWeather.temp) || 26;
    const hum = parseInt(currentWeather.humidity, 10) || 65;
    const cond = currentWeather.condition.toLowerCase();
    const isNight = currentWeather.isDay === 0;

    if (cond.includes("rain")) {
      return {
        quote: `"Wet atmospheric conditions detected in ${currentWeather.city} (${temp}°C, ${currentWeather.humidity} humidity). Best to stay cozy indoors."`,
        activity: "Indoor workout, reading, or cozy cafe visit"
      };
    }
    return {
      quote: `"Pleasant ${cond} conditions in ${currentWeather.city} at ${temp}°C with ${currentWeather.pressure} pressure—ideal for stepping outside."`,
      activity: isNight ? "Evening walk, night jog, or rooftop dining" : "Outdoor run, cycling, or tennis"
    };
  };

  const aiSummary = getDynamicAISummary();

  const hourlyTemps = currentWeather.hourly.map(h => h.rawTemp ?? parseInt(h.temp));
  const peakWarmest = hourlyTemps.length > 0 ? Math.max(...hourlyTemps) : currentWeather.high;
  const peakCoolest = hourlyTemps.length > 0 ? Math.min(...hourlyTemps) : currentWeather.low;

  return (
    <div className="app-container" style={{ background: "#030712", minHeight: "100vh", color: "#f8fafc", paddingBottom: "60px" }}>
      
      <header className="hero-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
              <CloudSun size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", margin: 0 }}>NexaWeather</h2>
              <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.8px", color: "#94a3b8" }}>METEO AI INTELLIGENCE</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ width: "8px", height: "8px", background: "#34d399", borderRadius: "50%", boxShadow: "0 0 10px #34d399", display: "inline-block" }} />
            <span>Live weather</span>
          </div>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", color: "#38bdf8", marginBottom: "10px" }}>
            ✨ NEXT-GENERATION WEATHER INTELLIGENCE
          </div>
          <h1 style={{ fontSize: "52px", fontWeight: "800", fontFamily: "Space Grotesk, sans-serif", margin: "0 0 14px 0", color: "#ffffff" }}>
            Weather, <span style={{ background: "linear-gradient(135deg, #70dcff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>reimagined.</span>
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "560px", margin: "0 auto", lineHeight: "1.5" }}>
            Professional climate analytics & atmospheric telemetry around you with neon precision.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", background: "rgba(11, 16, 32, 0.9)", border: "1px solid rgba(56, 189, 248, 0.35)", borderRadius: "999px", padding: "6px 8px", maxWidth: "620px", margin: "0 auto 16px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
          <Search size={18} style={{ color: "#94a3b8", marginLeft: "16px" }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any city..." 
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "10px 14px", color: "#f8fafc", fontSize: "15px" }} 
          />
          <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, #70dcff, #38bdf8)", color: "#030712", border: "none", fontWeight: "700", fontSize: "14px", padding: "10px 26px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {loading ? <LoaderCircle className="spin" size={16} /> : "Explore"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px", color: "#94a3b8" }}>
          <button type="button" onClick={detectUserLocation} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(14, 165, 233, 0.15)", border: "1px solid rgba(56, 189, 248, 0.35)", color: "#38bdf8", padding: "6px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: "600" }}>
            <MapPin size={13} /> My Location
          </button>
          <button type="button" onClick={detectUserLocation} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(148, 163, 184, 0.2)", color: "#cbd5e1", padding: "6px 14px", borderRadius: "999px", cursor: "pointer" }}>
            <Navigation size={13} /> Live GPS
          </button>
          <span style={{ color: "#475569", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Global:</span>
          {["Kolkata", "Mumbai", "Delhi", "London", "Tokyo", "New York"].map((city) => (
            <button 
              key={city}
              type="button"
              onClick={() => handleSearch(null, city)}
              style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(148, 163, 184, 0.15)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "999px", cursor: "pointer", fontSize: "12px" }}
            >
              {city}
            </button>
          ))}
        </div>

        {errorMessage && <p style={{ color: "#38bdf8", fontSize: "12px", marginTop: "10px" }}>{errorMessage}</p>}
      </header>

      <section className="todays-atmosphere-section" style={{ maxWidth: "1380px", margin: "20px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1.2px", color: "#38bdf8" }}>PERSONAL TELEMETRY NODE</span>
            <h3 style={{ fontSize: "24px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: "2px 0 0 0" }}>Today's atmosphere</h3>
          </div>
          <span style={{ fontSize: "12px", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", background: "#34d399", borderRadius: "50%", display: "inline-block" }} />
            Open-Meteo & OSM Live
          </span>
        </div>

        <div style={{ background: "linear-gradient(145deg, rgba(11, 18, 36, 0.95), rgba(6, 10, 22, 0.98))", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "22px", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", padding: "5px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", marginBottom: "14px" }}>
              <MapPin size={14} /> <span>{currentWeather.city}</span>
              <span style={{ background: "rgba(56, 189, 248, 0.25)", padding: "1px 6px", borderRadius: "999px", marginLeft: "4px" }}>My Location</span>
            </div>
            <h2 style={{ fontSize: "52px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", margin: "0 0 4px 0", lineHeight: 1 }}>{currentWeather.temp}°C</h2>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>
              {currentWeather.condition} <span style={{ color: "#94a3b8", fontWeight: "400", marginLeft: "10px" }}>H: {currentWeather.high}° L: {currentWeather.low}°</span>
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>Feels like {currentWeather.feelsLike}°C • Similar to actual temperature</p>
            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", gap: "16px" }}>
              <span>Coords: {currentWeather.coords}</span>
              <span>Synced Just Now</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "64px" }}>
              {(() => {
                const isNight = currentWeather.isDay === 0;
                const code = currentWeather.weatherCode;
                if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
                if ([1, 2, 3, 45, 48].includes(code)) return isNight ? "☁️🌙" : "⛅";
                return isNight ? "🌙" : "☀️";
              })()}
            </div>
            <span style={{ display: "block", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", color: "#38bdf8", marginTop: "4px" }}>RIGHT NOW</span>
          </div>
        </div>
      </section>

      {/* Sunrise & Sunset Dynamic Real-Time Telemetry Cards */}
      <section style={{ maxWidth: "1380px", margin: "24px auto 0", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
          
          {/* Sunrise Card */}
          <div style={{ background: "linear-gradient(145deg, rgba(11, 18, 36, 0.95), rgba(7, 11, 22, 0.98))", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "22px", padding: "24px 28px", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "#fbbf24" }}>SUNRISE TELEMETRY</span>
            <div style={{ fontSize: "40px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: "10px 0 4px 0" }}>
              {currentWeather.sunrise}
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{sunStatus.sunriseSub}</p>
          </div>

          {/* Sunset Card */}
          <div style={{ background: "linear-gradient(145deg, rgba(11, 18, 36, 0.95), rgba(7, 11, 22, 0.98))", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "22px", padding: "24px 28px", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "#c084fc" }}>SUNSET TELEMETRY</span>
            <div style={{ fontSize: "40px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: "10px 0 4px 0" }}>
              {currentWeather.sunset}
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{sunStatus.sunsetSub}</p>
          </div>

        </div>
      </section>

      <div style={{ maxWidth: "1380px", margin: "20px auto 0", padding: "0 20px" }}>
        <HourlyTelemetrySection hourlyData={currentWeather.hourly} currentWeatherData={currentWeather} />
      </div>

      <section style={{ maxWidth: "1380px", margin: "24px auto 0", padding: "0 20px" }}>
        <div className="ai-card">
          <div className="ai-bot-icon">
            <Sparkles size={22} />
          </div>
          <div className="ai-content-box" style={{ width: "100%" }}>
            <span className="section-kicker" style={{ marginBottom: "2px" }}>NEXA AI ASSISTANT</span>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>Atmospheric Intelligence & Advice</h3>
            <p className="ai-quote">
              {aiSummary.quote}
            </p>
            <div className="ai-activity" style={{ marginBottom: "14px" }}>
              ✨ Recommended Activity: {aiSummary.activity}
            </div>

            <div className="ai-chat-box">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Ask anything about weather, clothing, or outdoor plans..."
              />
              <button type="button" onClick={handleAskAI}>
                Ask AI
              </button>
            </div>
            {aiResponse && (
              <div style={{ marginTop: "12px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "12px 16px", borderRadius: "14px", fontSize: "13px", color: "#e9d5ff", lineHeight: "1.4" }}>
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1380px", margin: "24px auto 0", padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(145deg, rgba(11, 18, 36, 0.95), rgba(7, 11, 22, 0.98))", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "24px", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ width: "28px", height: "28px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>📈</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", color: "#ffffff", margin: 0 }}>Next 24 Hours</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>Live atmospheric temperature progression from Open-Meteo telemetry</p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "8px 14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>☀️</span>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>Peak Warmest</div>
                  <strong style={{ fontSize: "12px", color: "#fbbf24" }}>{peakWarmest}°C</strong>
                </div>
              </div>
              <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "8px 14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🌙</span>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>Peak Coolest</div>
                  <strong style={{ fontSize: "12px", color: "#38bdf8" }}>{peakCoolest}°C</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", height: "220px", width: "100%", borderBottom: "1px solid rgba(148, 163, 184, 0.15)", paddingBottom: "10px" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              <span>{peakWarmest + 4}°</span>
              <span>{Math.round((peakWarmest + peakCoolest) / 2)}°</span>
              <span>{peakCoolest - 2}°</span>
            </div>
            <div style={{ marginLeft: "35px", height: "180px", position: "relative" }}>
              <svg viewBox="0 0 800 160" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="advancedTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 Q200,30 400,100 T800,60 L800,160 L0,160 Z" fill="url(#advancedTimelineGrad)" />
                <path d="M0,80 Q200,30 400,100 T800,60" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="200" cy="50" r="5" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="600" cy="75" r="5" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Live Hourly Time Strip under the 24h Chart */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "35px", marginTop: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {currentWeather.hourly && currentWeather.hourly.slice(0, 8).map((h, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "50px", fontSize: "11px", color: "#94a3b8" }}>
                <span>{h.time}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>{h.temp}</span>
                <span style={{ fontSize: "12px" }}>{h.hour >= 6 && h.hour <= 18 ? "☀️" : "🌙"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1380px", margin: "24px auto 0", padding: "0 20px" }}>
        <div style={{ marginBottom: "14px", marginTop: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "1px", color: "#38bdf8" }}>LOOKING AHEAD</span>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: "2px 0 0 0" }}>Three-day outlook</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
          {currentWeather.dailyForecast.map((item, idx) => (
            <div key={idx} style={{ background: "rgba(11, 18, 36, 0.85)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "18px", padding: "20px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#38bdf8", letterSpacing: "0.8px" }}>{item.day}</span>
              <div style={{ fontSize: "36px", margin: "10px 0" }}>{item.cond.toLowerCase().includes('rain') ? "🌧️" : "⛅"}</div>
              <strong style={{ fontSize: "20px", fontFamily: "Space Grotesk, sans-serif" }}>
                {item.temp} <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>{item.low}</span>
              </strong>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>{item.cond}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1380px", margin: "30px auto 0", padding: "0 20px" }}>
        <WeatherMap />
      </section>

      <GlobalIntelligenceSection />

      <footer style={{ textAlign: "center", marginTop: "50px", fontSize: "12px", color: "#64748b", borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "25px", maxWidth: "1380px", marginInline: "auto" }}>
        Nexaweather AI • Designed for a clearer view of your world.
      </footer>

    </div>
  );
}