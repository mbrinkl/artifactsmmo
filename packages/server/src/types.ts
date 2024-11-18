import { components } from "@artifacts/shared";
import { GatherContext } from "./scenarios";

export interface ActionResultData {
  character: Character;
  cooldown: Cooldown;
}

export type Destination = components["schemas"]["DestinationSchema"];
export type Cooldown = components["schemas"]["CooldownSchema"];
export type Character = components["schemas"]["CharacterSchema"];
export type Drop = components["schemas"]["DropSchema"];

export type Activity = { name: "gather"; context: Omit<GatherContext, "characterName"> };

export interface CharacterInfo {
  characterName: string;
  activity: Activity | null;
  // currqueue ?
}
