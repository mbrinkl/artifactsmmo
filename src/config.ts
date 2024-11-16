import { Destination } from "./types";

export type MapLocation = "Bank" | "GE" | "Copper_Rocks" | "Iron_Rocks";

export const coords: Record<MapLocation, Destination> = {
  Bank: { x: 4, y: 1 },
  GE: { x: 5, y: 1 },
  Copper_Rocks: { x: 2, y: 0 },
  Iron_Rocks: { x: 1, y: 7 },
};
