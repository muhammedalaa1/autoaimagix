import type { Request, Response } from "express";
import { weatherQuerySchema } from "./weather.schema.js";
import * as weatherService from "./weather.service.js";

export async function getCurrent(req: Request, res: Response) {
  const query = weatherQuerySchema.parse(req.query);
  const weather = await weatherService.getCurrentWeather(query);
  res.status(200).json({ data: weather });
}
