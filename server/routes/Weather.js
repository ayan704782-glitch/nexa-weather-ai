import express from "express";

const router = express.Router();

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const REQUEST_TIMEOUT_MS = 12000;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": "NexaWeatherAI/4.0",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Weather provider returned HTTP ${response.status}`);
  }

  return response.json();
}

// Helper to clean up duplicate names like "Kolkata, Kolkata"
function cleanLocationName(name, country) {
  if (!name) return "Current Location";
  let parts = name.split(",").map((p) => p.trim());
  // Remove duplicates
  parts = [...new Set(parts)];
  let cleanName = parts[0];
  if (country && cleanName.toLowerCase() === country.toLowerCase()) {
    cleanName = parts[1] || cleanName;
  }
  return cleanName;
}

router.get("/", async (req, res) => {
  try {
    const rawCity =
      typeof req.query.city === "string" ? req.query.city.trim() : "";
    const customLabel =
      typeof req.query.label === "string" ? req.query.label.trim() : "";
    const latParam =
      req.query.lat !== undefined && req.query.lat !== ""
        ? Number(req.query.lat)
        : null;
    const lonParam =
      req.query.lon !== undefined && req.query.lon !== ""
        ? Number(req.query.lon)
        : null;

    let place = null;

    if (
      latParam !== null &&
      lonParam !== null &&
      Number.isFinite(latParam) &&
      Number.isFinite(lonParam)
    ) {
      let locationName = customLabel || "Current Location";
      let countryName = "";
      let countryCode = "";

      try {
        const revUrl = new URL(NOMINATIM_REVERSE_URL);
        revUrl.searchParams.set("format", "jsonv2");
        revUrl.searchParams.set("lat", latParam);
        revUrl.searchParams.set("lon", lonParam);
        revUrl.searchParams.set("zoom", "18");
        revUrl.searchParams.set("addressdetails", "1");

        const revData = await fetchJson(revUrl);
        const addr = revData.address || {};

        if (!customLabel) {
          const rawLoc =
            addr.village ||
            addr.hamlet ||
            addr.neighbourhood ||
            addr.suburb ||
            addr.town ||
            addr.city ||
            addr.county ||
            revData.name ||
            "Current Location";

          countryName = addr.country || "";
          locationName = cleanLocationName(rawLoc, countryName);
        }

        countryCode = addr.country_code ? addr.country_code.toUpperCase() : "";
      } catch (err) {
        console.error("Reverse geocoding warning:", err.message);
      }

      place = {
        name: locationName,
        country: countryName,
        country_code: countryCode,
        latitude: latParam,
        longitude: lonParam,
      };
    } else {
      if (!rawCity || rawCity.length > 100) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid city or village name.",
        });
      }

      try {
        const nomUrl = new URL(NOMINATIM_SEARCH_URL);
        nomUrl.searchParams.set("q", rawCity);
        nomUrl.searchParams.set("format", "jsonv2");
        nomUrl.searchParams.set("addressdetails", "1");
        nomUrl.searchParams.set("limit", "1");

        const nomResults = await fetchJson(nomUrl);

        if (Array.isArray(nomResults) && nomResults.length > 0) {
          const best = nomResults[0];
          const addr = best.address || {};

          const rawDetected =
            addr.village ||
            addr.hamlet ||
            addr.town ||
            addr.suburb ||
            addr.city ||
            best.name ||
            rawCity;

          const countryPart = addr.country || "";
          const finalName = cleanLocationName(rawDetected, countryPart);

          place = {
            name: finalName,
            country: countryPart,
            country_code: addr.country_code
              ? addr.country_code.toUpperCase()
              : "",
            latitude: Number(best.lat),
            longitude: Number(best.lon),
          };
        }
      } catch (nomErr) {
        console.error("Nominatim search fallback notice:", nomErr.message);
      }

      if (!place) {
        const geoUrl = new URL(GEOCODING_URL);
        geoUrl.searchParams.set("name", rawCity);
        geoUrl.searchParams.set("count", "1");
        geoUrl.searchParams.set("language", "en");
        geoUrl.searchParams.set("format", "json");

        const geoData = await fetchJson(geoUrl);
        const geoPlace = geoData.results?.[0];

        if (geoPlace) {
          place = {
            name: cleanLocationName(geoPlace.name, geoPlace.country),
            country: geoPlace.country ?? "",
            country_code: geoPlace.country_code ?? "",
            latitude: Number(geoPlace.latitude),
            longitude: Number(geoPlace.longitude),
          };
        }
      }

      if (!place) {
        return res.status(404).json({
          success: false,
          error: `Place "${rawCity}" was not found. Try adding your state name (e.g., "${rawCity}, West Bengal").`,
        });
      }
    }

    const forecastUrl = new URL(FORECAST_URL);
    forecastUrl.searchParams.set("latitude", place.latitude);
    forecastUrl.searchParams.set("longitude", place.longitude);

    // Added surface_pressure to current parameters for the pressure metric card
    forecastUrl.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "surface_pressure",
      ].join(",")
    );

    forecastUrl.searchParams.set(
      "hourly",
      [
        "temperature_2m",
        "precipitation_probability",
        "relative_humidity_2m",
        "weather_code",
      ].join(",")
    );

    forecastUrl.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "precipitation_probability_max",
      ].join(",")
    );

    forecastUrl.searchParams.set("forecast_days", "3");
    forecastUrl.searchParams.set("timezone", "auto");

    const weatherData = await fetchJson(forecastUrl);

    if (!weatherData.current) {
      throw new Error("Current weather data is missing.");
    }

    return res.status(200).json({
      success: true,
      source: "Open-Meteo & OpenStreetMap",
      retrievedAt: new Date().toISOString(),

      location: {
        name: place.name,
        country: place.country ?? null,
        countryCode: place.country_code ?? null,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: weatherData.timezone,
      },

      current: weatherData.current,
      hourly: weatherData.hourly ?? null,
      daily: weatherData.daily ?? null,

      units: {
        current: weatherData.current_units ?? {},
        hourly: weatherData.hourly_units ?? {},
        daily: weatherData.daily_units ?? {},
      },
    });
  } catch (error) {
    console.error("Weather API error:", error.message);

    if (res.headersSent) return;

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Weather request timed out. Please try again.",
      });
    }

    return res.status(502).json({
      success: false,
      error: "Unable to retrieve weather data right now.",
    });
  }
});

export default router;