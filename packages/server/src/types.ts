import { CharacterInfo } from "@artifacts/shared";
import { PipelineItem } from "./pipeline";

export interface CharacterContext extends CharacterInfo {
  queue: PipelineItem[];
}
