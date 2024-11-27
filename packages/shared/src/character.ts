import { Activity } from "./activity";

export interface CharacterInfo {
  characterName: string;
  activity: Activity | null;
  error?: string;
}
