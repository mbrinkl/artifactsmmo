import { components } from "./schema";

export type Destination = components["schemas"]["DestinationSchema"];
export type Cooldown = components["schemas"]["CooldownSchema"];
export type Character = components["schemas"]["CharacterSchema"];
export type Drop = components["schemas"]["DropSchema"];
export type Square = components["schemas"]["MapSchema"];
export type Item = components["schemas"]["ItemSchema"];
export type Resource = components["schemas"]["ResourceSchema"];
export type Monster = components["schemas"]["MonsterSchema"];

export interface ActionResultData {
  character: Character;
}

export interface Encyclopedia {
  squares: Square[];
  items: Item[];
  resources: Resource[];
  monsters: Monster[];
}
