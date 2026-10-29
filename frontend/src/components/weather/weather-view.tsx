"use client";

import { useQuery } from "@tanstack/react-query";
import { CloudSun, Loader2, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { weatherApi } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";
import { WeatherCard } from "./weather-card";

type Units = "metric" | "imperial";

export function WeatherView() {
  const [input, setInput] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [units, setUnits] = useState<Units>("metric");

  const weather = useQuery({
    queryKey: ["weather", city, units],
    queryFn: ({ signal }) => weatherApi.current({ city: city!, units }, signal),
    enabled: city !== null,
    staleTime: 5 * 60_000, // upstream data refreshes every ~15 min; avoid burning the API quota
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed) setCity(trimmed);
  };

  return (
    <>
      <PageHeader title="Weather" description="Current conditions, fetched securely through our API." />

      <form onSubmit={onSubmit} className="mb-6 flex flex-wrap gap-2" role="search">
        <label htmlFor="city" className="sr-only">
          City
        </label>
        <Input
          id="city"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search a city, e.g. Cairo"
          maxLength={100}
          className="h-9 min-w-0 flex-1"
        />
        <UnitsToggle value={units} onChange={setUnits} />
        <Button type="submit" size="lg" disabled={!input.trim() || weather.isFetching}>
          {weather.isFetching ? <Loader2 className="animate-spin" /> : <Search />}
          Search
        </Button>
      </form>

      {city === null ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <CloudSun className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Search for a city to see its current weather.</p>
        </div>
      ) : weather.isPending ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : weather.isError ? (
        <ErrorState
          title={weather.error instanceof ApiError && weather.error.status === 404 ? "City not found" : undefined}
          message={getErrorMessage(weather.error)}
          onRetry={() => weather.refetch()}
        />
      ) : (
        <WeatherCard weather={weather.data.data} />
      )}
    </>
  );
}

function UnitsToggle({ value, onChange }: { value: Units; onChange: (units: Units) => void }) {
  return (
    <div role="radiogroup" aria-label="Units" className="flex h-9 rounded-lg border p-0.5">
      {(["metric", "imperial"] as const).map((unit) => (
        <button
          key={unit}
          type="button"
          role="radio"
          aria-checked={value === unit}
          onClick={() => onChange(unit)}
          className={cn(
            "rounded-md px-3 text-sm text-muted-foreground transition-colors",
            value === unit && "bg-muted font-medium text-foreground",
          )}
        >
          {unit === "metric" ? "°C" : "°F"}
        </button>
      ))}
    </div>
  );
}
