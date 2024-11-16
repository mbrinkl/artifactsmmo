import { components } from "./schema";

export interface ActionResultData {
  character: Character;
  cooldown: Cooldown;
}

export type Destination = components["schemas"]["DestinationSchema"];
export type Cooldown = components["schemas"]["CooldownSchema"];
export type Character = components["schemas"]["CharacterSchema"];
export type Drop = components["schemas"]["DropSchema"];
