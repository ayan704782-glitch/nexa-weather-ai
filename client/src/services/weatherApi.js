const API_BASE_URL = "http://localhost:5000/api";
const REQUEST_TIMEOUT_MS = 15000;

async function executeWeatherRequest(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response. Please try again.");
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Weather request failed (Status: ${response.status}).`
      );
    }

    const payload = data?.current && data?.location ? data : data?.data || data;

    if (!payload || !payload.current || !payload.location) {
      throw new Error("Weather data is incomplete. Please try again.");
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Weather request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the weather server. Make sure your backend is running on port 5000."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 1. Fetch live weather data by city, town, or village name.
 */
export async function getWeather(city) {
  const trimmedCity = typeof city === "string" ? city.trim() : "";

  if (!trimmedCity) {
    throw new Error("Please enter a city or village name.");
  }

  if (trimmedCity.length > 100) {
    throw new Error("Place name must be 100 characters or fewer.");
  }

  const url = new URL(`${API_BASE_URL}/weather`);
  url.searchParams.set("city", trimmedCity);

  return executeWeatherRequest(url);
}

/**
 * 2. Fetch live weather data by GPS Coordinates (Latitude & Longitude).
 */
export async function getWeatherByCoords(lat, lon, customLabel = "") {
  const url = new URL(`${API_BASE_URL}/weather`);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  if (customLabel) {
    url.searchParams.set("label", customLabel);
  }

  return executeWeatherRequest(url);
}