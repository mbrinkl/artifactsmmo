import { Activity } from "./activity";
import { Character } from "./derived";

export interface CharacterInfo {
  characterName: string;
  activity: Activity | null;
  error?: string;
}

export type CharacterInfoResponse = (CharacterInfo & Character)[];
