import { GatherLocation, gatherLocations } from "./locations";

export const craftSourceItems = ["copper_ore"] as const;
export const craftProductItems = ["copper"] as const;

export interface GatherContext {
  location: GatherLocation;
}
export interface CraftContext {
  sourceItem: (typeof craftSourceItems)[number];
  productItem: (typeof craftProductItems)[number];
}

export type Activity = { name: "gather"; context: GatherContext } | { name: "craft"; context: CraftContext };
export type ActivityName = Activity["name"];
export type ActivityContext = Activity["context"];

type ExtractPropertyNames<T> = {
  [Key in keyof T]: unknown;
};
type ActivityMap = {
  [K in Activity as K["name"]]: ExtractPropertyNames<K["context"]>;
};

export const possibleContextsMap: ActivityMap = {
  gather: { location: gatherLocations },
  craft: { sourceItem: craftSourceItems, productItem: craftProductItems },
};
export const possibileActivityNames = Object.keys(possibleContextsMap);
