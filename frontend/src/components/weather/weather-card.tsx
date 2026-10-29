import { Droplets, Gauge, MapPin, Sun, Thermometer, Wind } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Weather } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

export function WeatherCard({ weather }: { weather: Weather }) {
  const location = [weather.region, weather.country].filter(Boolean).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="size-5 text-muted-foreground" />
          {weather.city}
        </CardTitle>
        <CardDescription>
          {location} · Local time {weather.localTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Image
            src={weather.condition.iconUrl}
            alt={weather.condition.description}
            width={80}
            height={80}
            className="size-20"
          />
          <div>
            <p className="text-5xl font-semibold tracking-tight">
              {Math.round(weather.temperature.current)}
              {weather.temperature.unit}
            </p>
            <p className="text-muted-foreground">{weather.condition.description}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Thermometer />} label="Feels like">
            {Math.round(weather.temperature.feelsLike)}
            {weather.temperature.unit}
          </Stat>
          <Stat icon={<Droplets />} label="Humidity">
            {weather.humidity}%
          </Stat>
          <Stat icon={<Wind />} label="Wind">
            {weather.wind.speed} {weather.wind.unit}
          </Stat>
          <Stat icon={<Gauge />} label="Pressure">
            {weather.pressureMb} mb
          </Stat>
          <Stat icon={<Sun />} label="UV index">
            {weather.uvIndex}
          </Stat>
        </dl>

        <p className="text-xs text-muted-foreground">Updated {formatDateTime(weather.observedAt)}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border p-3 [&_svg]:size-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
