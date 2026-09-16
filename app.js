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
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunset",
    temperature_unit: "fahrenheit",
    timezone: "America/Los_Angeles",
    forecast_days: "7",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

// Photo-quality tiers by weather code: how long before sunset to shoot,
// the expected quality of the shot, and why.
const SUNSET_PHOTO_TIERS = {
  0: { offsetMinutes: 20, quality: "Great", note: "Clear skies — soft golden light" },
  1: { offsetMinutes: 15, quality: "Great", note: "Clouds may catch vivid color" },
  2: { offsetMinutes: 15, quality: "Great", note: "Clouds may catch vivid color" },
  3: { offsetMinutes: 10, quality: "Fair", note: "Overcast — colors may be muted" },
  45: { offsetMinutes: 10, quality: "Poor", note: "Fog may obscure the sunset" },
  48: { offsetMinutes: 10, quality: "Poor", note: "Fog may obscure the sunset" },
};
const DEFAULT_SUNSET_PHOTO_TIER = {
  offsetMinutes: 10,
  quality: "Poor",
  note: "Precipitation expected — sunset may not be visible",
};

// Best moment to shoot the sunset: a bit before actual sunset, adjusted
// for expected cloud cover.
function getSunsetPhotoTime(day) {
  const sunset = day.sunset ? new Date(day.sunset) : null;
  if (!sunset || Number.isNaN(sunset.getTime())) {
    return { time: null, label: "—", quality: "Poor", note: "Sunset time unavailable" };
  }
  const tier = SUNSET_PHOTO_TIERS[day.code] || DEFAULT_SUNSET_PHOTO_TIER;
  const time = new Date(sunset.getTime() - tier.offsetMinutes * 60 * 1000);
  const label = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { time, label, quality: tier.quality, note: tier.note };
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
    sunset: daily.sunset[i],
  }));
}

// Sample fallback so the page always shows a 7-day forecast for the demo.
function sampleForecast() {
  const codes = [3, 61, 2, 1, 0, 2, 63];
  const highs = [64, 59, 66, 71, 74, 68, 61];
  const lows = [52, 49, 51, 54, 56, 53, 50];
  const sunsetTimes = ["19:05", "19:03", "19:01", "18:59", "18:57", "18:55", "18:53"];
  const today = new Date();
  return codes.map((code, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return {
      date: dateStr,
      code,
      high: highs[i],
      low: lows[i],
      sunset: `${dateStr}T${sunsetTimes[i]}`,
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

function renderSunsetTimes(days) {
  const container = document.getElementById("sunset-times");
  container.innerHTML = "";

  days.forEach((day, index) => {
    const photoTime = getSunsetPhotoTime(day);
    const card = document.createElement("article");
    card.className = "sunset-card";
    card.innerHTML = `
      <div class="sunset-day">${formatDayName(day.date, index)}</div>
      <div class="sunset-time">${photoTime.label}</div>
      <span class="sunset-badge quality-${photoTime.quality.toLowerCase()}">${photoTime.quality}</span>
      <div class="sunset-note">${photoTime.note}</div>
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
    renderSunsetTimes(days);
    setStatus("");
    setUpdatedLabel(false);
  } catch (err) {
    console.warn("Falling back to sample forecast:", err);
    const days = sampleForecast();
    renderForecast(days);
    renderSunsetTimes(days);
    setStatus("Showing sample data — live forecast is unavailable.", true);
    setUpdatedLabel(true);
  }
}

document.addEventListener("DOMContentLoaded", init);
