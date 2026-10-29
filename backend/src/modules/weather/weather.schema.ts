import { z } from "zod";

export const weatherQuerySchema = z.object({
  city: z
    .string({ error: "city query parameter is required" })
    .trim()
    .min(1, "city query parameter is required")
    .max(100)
    .regex(/^[\p{L}\s,.'-]+$/u, "city contains invalid characters"),
  units: z.enum(["metric", "imperial"]).default("metric"),
});

/** Only the fields we use; validating the upstream payload guards against API changes. */
export const weatherApiResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    region: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    localtime: z.string(),
  }),
  current: z.object({
    last_updated_epoch: z.number(),
    temp_c: z.number(),
    temp_f: z.number(),
    feelslike_c: z.number(),
    feelslike_f: z.number(),
    condition: z.object({ text: z.string(), icon: z.string() }),
    wind_kph: z.number(),
    wind_mph: z.number(),
    humidity: z.number(),
    pressure_mb: z.number(),
    uv: z.number(),
    is_day: z.number(),
  }),
});

export const weatherApiErrorSchema = z.object({
  error: z.object({ code: z.number(), message: z.string() }),
});

export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
