import { CharacterInfo } from "@artifacts/shared";
import { Queuey } from "./services/queue";
import { initializeDb } from "./db";

export type Database = Awaited<ReturnType<typeof initializeDb>>;

export interface CharacterContext extends CharacterInfo {
  q?: Queuey;
}
