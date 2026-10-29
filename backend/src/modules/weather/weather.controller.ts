import type { Request, Response } from "express";
import { weatherQuerySchema } from "./weather.schema";
import * as weatherService from "./weather.service";

export async function getCurrent(req: Request, res: Response) {
  const query = weatherQuerySchema.parse(req.query);
  const weather = await weatherService.getCurrentWeather(query);
  res.status(200).json({ data: weather });
}
