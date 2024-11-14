import { Destination } from "./types";

export const CHARACTER_NAME = "Toby";

export type Location = "Bank" | "GE";

export const LOCATION_COORDS: Record<Location, Destination> = {
  Bank: { x: 4, y: 1 },
  GE: { x: 5, y: 1 },
};
