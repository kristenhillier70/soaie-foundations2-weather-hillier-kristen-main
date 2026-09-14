// WeatherWise — 7-day forecast for Seattle
// Uses the free Open-Meteo API (no API key required). Falls back to sample
// data if the network request fails, so the training demo always renders.

const SEATTLE = {
  name: "Seattle, WA",
  latitude: 47.6062,
  longitude: -122.3321,
};

// Maps Open-Meteo WMO weather codes to an emoji icon and description.
const WEATHER_CODES = {
  0: { icon: "☀️", desc: "Clear sky" },
  1: { icon: "🌤️", desc: "Mainly clear" },
  2: { icon: "⛅", desc: "Partly cloudy" },
  3: { icon: "☁️", desc: "Overcast" },
  45: { icon: "🌫️", desc: "Fog" },
  48: { icon: "🌫️", desc: "Rime fog" },
  51: { icon: "🌦️", desc: "Light drizzle" },
  53: { icon: "🌦️", desc: "Drizzle" },
  55: { icon: "🌧️", desc: "Heavy drizzle" },
  61: { icon: "🌦️", desc: "Light rain" },
  63: { icon: "🌧️", desc: "Rain" },
  65: { icon: "🌧️", desc: "Heavy rain" },
  71: { icon: "🌨️", desc: "Light snow" },
  73: { icon: "🌨️", desc: "Snow" },
  75: { icon: "❄️", desc: "Heavy snow" },
  80: { icon: "🌦️", desc: "Rain showers" },
  81: { icon: "🌧️", desc: "Rain showers" },
  82: { icon: "⛈️", desc: "Violent showers" },
  95: { icon: "⛈️", desc: "Thunderstorm" },
};

function codeInfo(code) {
  return WEATHER_CODES[code] || { icon: "🌡️", desc: "—" };
}

function buildApiUrl() {
  const params = new URLSearchParams({
    latitude: SEATTLE.latitude,
    longitude: SEATTLE.longitude,
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    temperature_unit: "fahrenheit",
    timezone: "America/Los_Angeles",
    forecast_days: "7",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchForecast() {
  const response = await fetch(buildApiUrl());
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }
  const data = await response.json();
  const daily = data.daily;
  return daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    high: Math.round(daily.temperature_2m_max[i]),
    low: Math.round(daily.temperature_2m_min[i]),
  }));
}

// Sample fallback so the page always shows a 7-day forecast for the demo.
function sampleForecast() {
  const codes = [3, 61, 2, 1, 0, 2, 63];
  const highs = [64, 59, 66, 71, 74, 68, 61];
  const lows = [52, 49, 51, 54, 56, 53, 50];
  const today = new Date();
  return codes.map((code, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      code,
      high: highs[i],
      low: lows[i],
    };
  });
}

function formatDayName(dateStr, index) {
  if (index === 0) return "Today";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderForecast(days) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";

  days.forEach((day, index) => {
    const info = codeInfo(day.code);
    const card = document.createElement("article");
    card.className = "day-card" + (index === 0 ? " is-today" : "");
    card.innerHTML = `
      <div class="day-name">${formatDayName(day.date, index)}</div>
      <div class="day-date">${formatDate(day.date)}</div>
      <div class="day-icon" aria-hidden="true">${info.icon}</div>
      <div class="day-desc">${info.desc}</div>
      <div class="day-temps">
        <span class="temp-high">${day.high}°</span>
        <span class="temp-low">${day.low}°</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function setStatus(message, isError = false) {
  const status = document.getElementById("status");
  if (!message) {
    status.classList.add("hidden");
    return;
  }
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.classList.remove("hidden");
}

function setUpdatedLabel(usingSample) {
  const now = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const source = usingSample ? "sample data" : "live data";
  document.getElementById("updated").textContent =
    `Updated ${now} · ${source}`;
}

async function init() {
  try {
    const days = await fetchForecast();
    renderForecast(days);
    setStatus("");
    setUpdatedLabel(false);
  } catch (err) {
    console.warn("Falling back to sample forecast:", err);
    renderForecast(sampleForecast());
    setStatus("Showing sample data — live forecast is unavailable.", true);
    setUpdatedLabel(true);
  }
}

document.addEventListener("DOMContentLoaded", init);
