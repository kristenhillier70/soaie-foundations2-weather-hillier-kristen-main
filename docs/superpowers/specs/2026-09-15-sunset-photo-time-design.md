# Best Time for a Sunset Photo — Design

**Date:** 2026-09-15
**Status:** Approved
**Scope:** Bounded — small addition to the existing WeatherWise forecast app

## Problem

WeatherWise shows a 7-day forecast for Seattle but gives no guidance on
when to actually go outside and photograph the sunset. Sunset time
alone isn't the best moment to shoot — the most photogenic light
typically happens shortly *before* sunset, and how good the shot will
look also depends on expected cloud cover for that day.

## Goals

- For each of the 7 forecast days, recommend a single timestamp that
  represents the best moment to shoot the sunset.
- Factor in both sun position (time relative to sunset) and forecast
  cloud cover (weather code) when picking that moment and describing
  the expected quality.
- Keep working when the network request fails, using the existing
  sample-data fallback path.

## Non-Goals

- No astronomical golden-hour/blue-hour calculation from
  latitude/sun-angle math — a fixed per-tier offset before sunset is
  sufficient for this app's purpose (Seattle-only, demo app).
- No timezone-of-viewer handling beyond what the app already does
  (times are displayed as returned by the API for
  `America/Los_Angeles`, consistent with how dates are already
  handled elsewhere in `app.js`).
- No push notifications, calendar integration, or persisted
  preferences.

## Data

Open-Meteo's `daily` forecast parameters already include
`weather_code`. Add `sunset` to that list. The API returns one ISO
8601 local timestamp per day, e.g. `2026-09-15T19:12`.

`fetchForecast()`'s per-day object gains a `sunset` field:

```js
{
  date, code, high, low, sunset // ISO local timestamp string
}
```

`sampleForecast()` (the offline fallback) gains matching sample
`sunset` timestamps for its 7 hardcoded sample days, so the
recommendation still renders when the live API is unreachable.

## Recommendation Logic

A lookup table maps each weather code to a photo-quality tier. Each
tier defines:
- `offsetMinutes` — how long before the reported sunset time to
  recommend heading out
- `quality` — a short label: `Great`, `Fair`, or `Poor`
- `note` — a one-line explanation shown under the badge

| Weather codes | Tier | Offset | Note |
|---|---|---|---|
| 0 (Clear) | Great | 20 min before sunset | Clear skies — soft golden light |
| 1, 2 (Mainly clear / Partly cloudy) | Great | 15 min before sunset | Clouds may catch vivid color |
| 3 (Overcast) | Fair | 10 min before sunset | Overcast — colors may be muted |
| 45, 48 (Fog) | Poor | 10 min before sunset | Fog may obscure the sunset |
| Anything else (rain, drizzle, snow, storms) | Poor | 10 min before sunset | Precipitation expected — sunset may not be visible |

A pure function, `getSunsetPhotoTime(day)`, takes a forecast-day
object and returns:

```js
{
  time: Date,      // sunset time minus the tier's offset
  label: string,   // formatted local time, e.g. "7:12 PM"
  quality: string, // "Great" | "Fair" | "Poor"
  note: string,
}
```

Any weather code not explicitly listed falls back to the "anything
else" tier, so the function always returns a result and never throws.

## UI

A new section, "🌇 Best Sunset Photo Times", is rendered between the
existing status bar and the 7-day forecast grid. It contains one
compact card per forecast day:

- Day name (reusing the existing `formatDayName` helper)
- Recommended time label (e.g. "7:12 PM")
- A colored quality badge: green for Great, yellow for Fair, gray/red
  for Poor
- The one-line note

Styling follows the existing `.day-card` visual language (translucent
background, rounded corners, backdrop blur) so the new section looks
native to the app rather than bolted on.

## Error Handling

- If a day's `sunset` field is missing or unparsable, `getSunsetPhotoTime`
  falls back to rendering "—" for the time and a "Poor" quality badge
  with the note "Sunset time unavailable" rather than throwing.
- The section always renders (using sample data) even when the live
  fetch fails, matching the existing fallback behavior for the
  forecast grid.

## Testing

Manual verification (no test framework currently exists in this
repo):
- Confirm each weather-code tier produces the expected offset,
  quality, and note.
- Confirm the section renders correctly on the sample-data fallback
  path (e.g. by temporarily breaking the fetch URL).
- Confirm layout holds up at mobile width (~375px).
