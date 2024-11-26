import { CharacterInfo } from "@artifacts/shared";
import { Queuey } from "./services/queue";

export interface CharacterContext extends CharacterInfo {
  q?: Queuey;
}
