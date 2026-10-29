import type { Metadata } from "next";
import { WeatherView } from "@/components/weather/weather-view";

export const metadata: Metadata = { title: "Weather" };

export default function WeatherPage() {
  return <WeatherView />;
}
