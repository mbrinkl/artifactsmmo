import { Destination, Drop, Encyclopedia, Item } from "./derived";

export interface BaseContext {
  encyclopedia: Encyclopedia;
}

export interface GatherContext extends BaseContext {
  gatherSquare: Destination;
}
export interface GatherParams {
  squareCode: string;
}

export interface FightParams {
  monsterCode: string;
}

export interface FightContext extends BaseContext {
  monsterSquare: Destination;
}

export interface CraftContext extends BaseContext {
  productItem: Item;
  sourceItems: Drop[];
  craftSquare: Destination;
}
export interface CraftParams {
  productCode: string;
}

export type Activity =
  | { name: "gather"; params: GatherParams }
  | { name: "craft"; params: CraftParams }
  | { name: "fight"; params: FightParams };

export type ActivityName = Activity["name"];
export type ActivityParams = Activity["params"];
export type ActivityContext = GatherContext | CraftContext | FightContext;

type ExtractProperties<T> = {
  [Key in keyof T]: unknown;
};
type ActivityMap = {
  [K in Activity as K["name"]]: ExtractProperties<K["params"]>;
};

export const initialParamsMap: ActivityMap = {
  gather: { squareCode: "" },
  craft: { productCode: "" },
  fight: { monsterCode: "" },
};
export const activityNames = Object.keys(initialParamsMap);
