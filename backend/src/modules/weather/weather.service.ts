import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { weatherApiErrorSchema, weatherApiResponseSchema, type WeatherQuery } from "./weather.schema";

const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
const TIMEOUT_MS = 5_000;

// https://www.weatherapi.com/docs/#intro-error-codes
const LOCATION_NOT_FOUND = 1006;

export async function getCurrentWeather({ city, units }: WeatherQuery) {
  const url = new URL(WEATHER_API_URL);
  url.searchParams.set("key", env.WEATHER_API_KEY); // key stays server-side only
  url.searchParams.set("q", city);
  url.searchParams.set("aqi", "no");

  let response: globalThis.Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") throw AppError.gatewayTimeout();
    throw AppError.badGateway("Could not reach the weather service");
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const upstream = weatherApiErrorSchema.safeParse(body);
    if (upstream.success && upstream.data.error.code === LOCATION_NOT_FOUND) {
      throw AppError.notFound(`City "${city}" not found`);
    }
    // Log the real reason (e.g. invalid key / quota exceeded) but never forward upstream details.
    console.error(
      `WeatherAPI responded with ${response.status}`,
      upstream.success ? `(code ${upstream.data.error.code})` : "",
    );
    throw AppError.badGateway("Weather service is currently unavailable");
  }

  const parsed = weatherApiResponseSchema.safeParse(body);
  if (!parsed.success) throw AppError.badGateway("Unexpected response from weather service");

  const { location, current } = parsed.data;
  const metric = units === "metric";
  return {
    city: location.name,
    region: location.region,
    country: location.country,
    coordinates: { lat: location.lat, lon: location.lon },
    localTime: location.localtime,
    units,
    condition: {
      description: current.condition.text,
      iconUrl: current.condition.icon.startsWith("//") ? `https:${current.condition.icon}` : current.condition.icon,
      isDay: current.is_day === 1,
    },
    temperature: {
      current: metric ? current.temp_c : current.temp_f,
      feelsLike: metric ? current.feelslike_c : current.feelslike_f,
      unit: metric ? "°C" : "°F",
    },
    wind: { speed: metric ? current.wind_kph : current.wind_mph, unit: metric ? "km/h" : "mph" },
    humidity: current.humidity,
    pressureMb: current.pressure_mb,
    uvIndex: current.uv,
    observedAt: new Date(current.last_updated_epoch * 1000).toISOString(),
  };
}
