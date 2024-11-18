import { Destination } from "./types";

export type GatherLocation =
  | "Copper_Rocks"
  | "Iron_Rocks"
  | "Sunflower"
  | "Gudgeon_Fishing"
  | "Shrimp_Fishing"
  | "Ash_Tree";
export type MapLocation = "Bank" | "GE" | GatherLocation;

export const coords: Record<MapLocation, Destination> = {
  Bank: { x: 4, y: 1 },
  GE: { x: 5, y: 1 },
  Copper_Rocks: { x: 2, y: 0 },
  Iron_Rocks: { x: 1, y: 7 },
  Sunflower: { x: 2, y: 2 },
  Gudgeon_Fishing: { x: 4, y: 2 },
  Shrimp_Fishing: { x: 5, y: 2 },
  Ash_Tree: { x: 6, y: 1 },
};
