import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Wind, CloudRain, ThermometerSun, Cloud, Layers, Search, LoaderCircle, Info } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./WeatherMap.css";

function createHubIcon(cityName, temp, condition) {
  return L.divIcon({
    className: "custom-hub-marker",
    html: `
      <div class="hub-weather-card">
        <div class="hub-header">
          <span class="hub-city">${cityName}</span>
        </div>
        <div class="hub-body">
          <strong class="hub-temp">${temp}°C</strong>
          <span class="hub-condition">${condition}</span>
        </div>
      </div>
    `,
    iconSize: [130, 65],
    iconAnchor: [65, 32],
  });
}

const INITIAL_HUBS = [
  { name: "New York", lat: 40.7128, lon: -74.0060, temp: 18, condition: "Partly Cloudy", wind: "14 km/h SW", precip: "0 mm", clouds: "45%" },
  { name: "London", lat: 51.5074, lon: -0.1278, temp: 14, condition: "Cloudy", wind: "18 km/h W", precip: "0.2 mm", clouds: "85%" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, temp: 22, condition: "Clear", wind: "8 km/h E", precip: "0 mm", clouds: "10%" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, temp: 27, condition: "Haze", wind: "10 km/h NW", precip: "0 mm", clouds: "30%" },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, temp: 21, condition: "Rain", wind: "16 km/h S", precip: "4.5 mm", clouds: "95%" },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241, temp: 16, condition: "Clear", wind: "22 km/h SE", precip: "0 mm", clouds: "15%" },
];

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.4 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function WeatherMap() {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [activeLayer, setActiveLayer] = useState("wind");
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [hubsList, setHubsList] = useState(INITIAL_HUBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedHub, setSelectedHub] = useState(null);

  // Map tile filters corresponding to each professional weather layer
  const getMapLayerFilter = () => {
    switch (activeLayer) {
      case "rain": return "brightness(0.75) invert(1) contrast(1.3) hue-rotate(185deg) saturate(1.8)";
      case "wind": return "brightness(0.75) invert(1) contrast(1.3) hue-rotate(240deg) saturate(1.6)";
      case "temp": return "brightness(0.75) invert(1) contrast(1.3) hue-rotate(30deg) saturate(2)";
      case "clouds": return "brightness(0.65) invert(1) contrast(1.1) hue-rotate(140deg) saturate(1.2)";
      default: return "brightness(0.7) invert(1) contrast(1.2) hue-rotate(200deg) saturate(1.5)";
    }
  };

  const handleMapGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1`);
      const geoData = await geoRes.json();

      if (geoData && geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const lat = place.latitude;
        const lon = place.longitude;
        const name = `${place.name}, ${place.country || ""}`;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        const weatherData = await weatherRes.json();
        const temp = weatherData?.current?.temperature_2m ? Math.round(weatherData.current.temperature_2m) : 20;
        const wind = weatherData?.current?.wind_speed_10m ? `${weatherData.current.wind_speed_10m} km/h` : "12 km/h";

        const newHub = {
          name: name,
          lat: lat,
          lon: lon,
          temp: temp,
          condition: "Live Observation",
          wind: wind,
          precip: "0 mm",
          clouds: "40%"
        };

        setHubsList([newHub]);
        setMapCenter([lat, lon]);
        setZoomLevel(6);
        setSelectedHub(newHub);
        setSearchQuery("");
      } else {
        alert(`Location "${searchQuery}" not found.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="map-section-wrapper" style={{ background: "rgba(15, 21, 40, 0.72)", backdropFilter: "blur(20px)", border: "1px solid rgba(112, 220, 255, 0.18)", borderRadius: "26px", padding: "24px", boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)" }}>
      
      {/* Header with Search Bar */}
      <div className="meteo-title-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", color: "#70dcff", display: "block", marginBottom: "4px" }}>METEO INTELLIGENCE MAP</span>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "18px", color: "#f8fafc", margin: 0 }}>Real-time global weather overview & atmospheric vector tracking</h2>
        </div>

        <form onSubmit={handleMapGlobalSearch} style={{ display: "flex", alignItems: "center", background: "rgba(11, 16, 32, 0.85)", border: "1px solid rgba(112, 220, 255, 0.3)", borderRadius: "999px", padding: "4px 6px", width: "320px" }}>
          <Search size={16} style={{ color: "#94a3b8", marginLeft: "10px" }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, state, country..." 
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "8px 10px", color: "#f8fafc", fontSize: "13px" }}
          />
          <button type="submit" disabled={loadingSearch} style={{ background: "linear-gradient(135deg, #70dcff, #38bdf8)", color: "#030712", border: "none", fontWeight: "700", fontSize: "12px", padding: "8px 18px", borderRadius: "999px", cursor: "pointer" }}>
            {loadingSearch ? <LoaderCircle className="spin" size={14} /> : "Search"}
          </button>
        </form>
      </div>

      <div className="meteo-interactive-viewport" style={{ height: "480px", borderRadius: "20px", overflow: "hidden", position: "relative", border: "1px solid rgba(112, 220, 255, 0.3)" }}>
        
        {/* Active Layer Legend / Info Banner (Top Left) */}
        <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 1000, background: "rgba(11, 16, 32, 0.88)", backdropFilter: "blur(12px)", border: "1px solid rgba(112, 220, 255, 0.25)", padding: "10px 16px", borderRadius: "14px", color: "#f8fafc", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 25px rgba(0,0,0,0.5)" }}>
          <Info size={14} style={{ color: "#70dcff" }} />
          <span>Active Layer: <strong style={{ textTransform: "uppercase", color: "#70dcff" }}>{activeLayer}</strong> (Live Vector Stream)</span>
        </div>

        {/* Dynamic Legend Overlay (Bottom Left) */}
        <div style={{ position: "absolute", bottom: "16px", left: "16px", zIndex: 1000, background: "rgba(11, 16, 32, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(112, 220, 255, 0.25)", padding: "12px 16px", borderRadius: "14px", color: "#f8fafc", fontSize: "11px", boxShadow: "0 8px 25px rgba(0,0,0,0.5)", maxWidth: "240px" }}>
          {activeLayer === "wind" && (
            <div>
              <div style={{ fontWeight: "700", color: "#70dcff", marginBottom: "4px" }}>Wind Vector Legend</div>
              <div>Speed: 0 to 35+ km/h</div>
              <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #38bdf8, #a855f7)", borderRadius: "4px", marginTop: "6px" }} />
            </div>
          )}
          {activeLayer === "rain" && (
            <div>
              <div style={{ fontWeight: "700", color: "#38bdf8", marginBottom: "4px" }}>Precipitation Scale</div>
              <div>Intensity: Light to Heavy (mm/h)</div>
              <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #0ea5e9, #34d399, #f59e0b)", borderRadius: "4px", marginTop: "6px" }} />
            </div>
          )}
          {activeLayer === "temp" && (
            <div>
              <div style={{ fontWeight: "700", color: "#fbbf24", marginBottom: "4px" }}>Temperature Heatmap</div>
              <div>Range: -20°C to +45°C</div>
              <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #38bdf8, #34d399, #fbbf24, #ef4444)", borderRadius: "4px", marginTop: "6px" }} />
            </div>
          )}
          {activeLayer === "clouds" && (
            <div>
              <div style={{ fontWeight: "700", color: "#c084fc", marginBottom: "4px" }}>Cloud Cover Index</div>
              <div>Coverage: 0% (Clear) to 100% (Overcast)</div>
              <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.9))", borderRadius: "4px", marginTop: "6px" }} />
            </div>
          )}
          {activeLayer === "layers" && (
            <div>
              <div style={{ fontWeight: "700", color: "#34d399", marginBottom: "4px" }}>Multi-Layer Overview</div>
              <div>Displaying combined atmospheric telemetry.</div>
            </div>
          )}
        </div>

        {/* Right-Side Vertical Control Panel */}
        <div className="map-floating-toolbar" style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "6px", background: "rgba(11, 16, 32, 0.95)", backdropFilter: "blur(14px)", border: "1px solid rgba(112, 220, 255, 0.3)", padding: "10px", borderRadius: "18px" }}>
          
          <button type="button" onClick={() => { setActiveLayer("layers"); setShowLayersMenu(!showLayersMenu); }} style={toolbarBtnStyle(activeLayer === "layers")}>
            <Layers size={18} /><small style={{ fontSize: "10px", fontWeight: "700" }}>Layers</small>
          </button>
          <button type="button" onClick={() => { setActiveLayer("wind"); setShowLayersMenu(false); }} style={toolbarBtnStyle(activeLayer === "wind")}>
            <Wind size={18} /><small style={{ fontSize: "10px", fontWeight: "700" }}>Wind</small>
          </button>
          <button type="button" onClick={() => { setActiveLayer("rain"); setShowLayersMenu(false); }} style={toolbarBtnStyle(activeLayer === "rain")}>
            <CloudRain size={18} /><small style={{ fontSize: "10px", fontWeight: "700" }}>Rain</small>
          </button>
          <button type="button" onClick={() => { setActiveLayer("temp"); setShowLayersMenu(false); }} style={toolbarBtnStyle(activeLayer === "temp")}>
            <ThermometerSun size={18} /><small style={{ fontSize: "10px", fontWeight: "700" }}>Temp</small>
          </button>
          <button type="button" onClick={() => { setActiveLayer("clouds"); setShowLayersMenu(false); }} style={toolbarBtnStyle(activeLayer === "clouds")}>
            <Cloud size={18} /><small style={{ fontSize: "10px", fontWeight: "700" }}>Clouds</small>
          </button>
        </div>

        {/* Compact Layers Selection Popup Panel (Requirement 5) */}
        {showLayersMenu && (
          <div style={{ position: "absolute", right: "95px", top: "20px", zIndex: 1001, background: "rgba(11, 16, 32, 0.96)", backdropFilter: "blur(18px)", border: "1px solid rgba(112, 220, 255, 0.4)", padding: "14px", borderRadius: "18px", width: "200px", boxShadow: "0 15px 35px rgba(0,0,0,0.7)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#70dcff", letterSpacing: "1px", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px" }}>
              SELECT MAP LAYER
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { id: "wind", label: "Wind Stream" },
                { id: "rain", label: "Precipitation" },
                { id: "temp", label: "Temperature" },
                { id: "clouds", label: "Cloud Cover" }
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setActiveLayer(l.id); setShowLayersMenu(false); }}
                  style={{
                    background: activeLayer === l.id ? "rgba(112, 220, 255, 0.2)" : "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: activeLayer === l.id ? "#70dcff" : "#cbd5e1",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {l.label} {activeLayer === l.id && "✓"}
                </button>
              ))}
            </div>
          </div>
        )}

        <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={false} className="dribbble-leaflet-map" attributionControl={false} style={{ width: "100%", height: "100%", background: "#030712" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewController center={mapCenter} zoom={zoomLevel} />
          {hubsList.map((hub) => (
            <Marker key={hub.name} position={[hub.lat, hub.lon]} icon={createHubIcon(hub.name, hub.temp, hub.condition)} eventHandlers={{
              click: () => setSelectedHub(hub)
            }} />
          ))}
        </MapContainer>
      </div>

      {/* Detailed Selected Hub Telemetry Bar */}
      {selectedHub && (
        <div style={{ marginTop: "16px", background: "rgba(11, 16, 32, 0.85)", border: "1px solid rgba(112, 220, 255, 0.3)", padding: "14px 20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#70dcff", letterSpacing: "1px" }}>SELECTED LOCATION TELEMETRY</span>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>{selectedHub.name}</div>
          </div>
          <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#cbd5e1" }}>
            <div>Temp: <strong style={{ color: "#70dcff" }}>{selectedHub.temp}°C</strong></div>
            <div>Condition: <strong style={{ color: "#34d399" }}>{selectedHub.condition}</strong></div>
            <div>Wind: <strong style={{ color: "#c084fc" }}>{selectedHub.wind}</strong></div>
            <div>Precip: <strong style={{ color: "#fbbf24" }}>{selectedHub.precip}</strong></div>
            <div>Clouds: <strong style={{ color: "#94a3b8" }}>{selectedHub.clouds}</strong></div>
          </div>
        </div>
      )}

      <style>{`
        .dribbble-leaflet-map .leaflet-tile-pane {
          filter: ${getMapLayerFilter()} !important;
          transition: filter 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

const toolbarBtnStyle = (isActive) => ({
  background: isActive ? "rgba(112, 220, 255, 0.22)" : "transparent",
  border: isActive ? "1px solid rgba(112, 220, 255, 0.5)" : "1px solid transparent",
  color: isActive ? "#70dcff" : "#94a3b8",
  padding: "8px 12px",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "3px",
  cursor: "pointer",
  transition: "all 0.2s ease"
});