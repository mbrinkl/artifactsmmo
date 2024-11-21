export interface GatherContext {
  squareCode: string;
}
export interface CraftContext {
  productCode: string;
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
  gather: { squareCode: "" },
  craft: { productCode: "" },
};
export const possibileActivityNames = Object.keys(possibleContextsMap);
