import { GatherLocation, gatherLocations } from "./locations";

export interface GatherContext {
  location: GatherLocation;
}

// placeholder for testing
const testings = ["a", "b"] as const;
export interface OtherContext {
  testing: (typeof testings)[number];
}

export type Activity = { name: "gather"; context: GatherContext } | { name: "other"; context: OtherContext };
export type ActivityName = Activity["name"];

type ExtractPropertyNames<T> = {
  [Key in keyof T]: unknown;
};
type ActivityMap = {
  [K in Activity as K["name"]]: ExtractPropertyNames<K["context"]>;
};

export const possibleContextsMap: ActivityMap = {
  gather: { location: gatherLocations },
  other: { testing: testings },
};
export const possibileActivityNames = Object.keys(possibleContextsMap);
