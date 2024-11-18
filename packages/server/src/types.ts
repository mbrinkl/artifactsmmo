import { CharacterInfo } from "@artifacts/shared";
import { QueueItem } from "./queue";

export interface CharacterContext extends CharacterInfo {
  queue: QueueItem[];
}
