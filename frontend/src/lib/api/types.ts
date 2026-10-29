// Response shapes returned by the Express API (see backend/README.md).

export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser extends Required<User> {
  notesCount: number;
}

export interface NoteAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: NoteAuthor;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Weather {
  city: string;
  region: string;
  country: string;
  coordinates: { lat: number; lon: number };
  localTime: string;
  units: "metric" | "imperial";
  condition: { description: string; iconUrl: string; isDay: boolean };
  temperature: { current: number; feelsLike: number; unit: string };
  wind: { speed: number; unit: string };
  humidity: number;
  pressureMb: number;
  uvIndex: number;
  observedAt: string;
}

export interface ApiErrorDetail {
  field: string | null;
  message: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: ApiErrorDetail[] };
}
