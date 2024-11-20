import { CharacterInfo } from "@artifacts/shared";
import { Queuey } from "./state/queue";

export interface CharacterContext extends CharacterInfo {
  q?: Queuey;
}
