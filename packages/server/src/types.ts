import { CharacterInfo } from "@artifacts/shared";
import { QueueItem } from "./queue";

export interface CharacterContext extends CharacterInfo {
  version: number; // version set at 0 on server initialize, increment on activity updated
  queue: QueueItem[];
}
