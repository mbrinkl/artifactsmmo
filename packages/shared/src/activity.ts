import { Destination, Drop, Item } from "./derived";

export interface GatherContext {
  gatherSquare: Destination;
}
export interface GatherParams {
  squareCode: string;
}

export interface CraftContext {
  productItem: Item;
  sourceItems: Drop[];
  craftSquare: Destination;
}
export interface CraftParams {
  productCode: string;
}

export type Activity = { name: "gather"; params: GatherParams } | { name: "craft"; params: CraftParams };
export type ActivityName = Activity["name"];
export type ActivityParams = Activity["params"];
export type ActivityContext = GatherContext | CraftContext;

type ExtractPropertyNames<T> = {
  [Key in keyof T]: unknown;
};
type ActivityMap = {
  [K in Activity as K["name"]]: ExtractPropertyNames<K["params"]>;
};

export const possibleContextsMap: ActivityMap = {
  gather: { squareCode: "" },
  craft: { productCode: "" },
};
export const possibileActivityNames = Object.keys(possibleContextsMap);
