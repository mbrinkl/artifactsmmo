import { Character, Cooldown } from "./types";

export interface ResultData {
  character: Character;
  cooldown: Cooldown;
}

export interface PipelineItem<T> {
  action: (payload?: T) => Promise<ResultData | null>;
  payload?: T;
  onExecuted?: (result: ResultData | null) => PipelineItem<unknown>[];
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const runPipeline = async (pipeline: PipelineItem<unknown>[]) => {
  console.log(`[ ${pipeline.map((x) => x.action.name).join()} ]`);

  const nextItem = pipeline.shift();
  if (!nextItem) {
    return;
  }

  console.log("executing", nextItem?.action.name, nextItem?.payload);

  const result = await nextItem.action(nextItem.payload);

  const next = nextItem.onExecuted?.(result);
  if (next) {
    pipeline = pipeline.concat(next);
    console.log(`Updated pipeline: [ ${pipeline.map((x) => x.action.name).join()} ]`);
  }

  console.log("cooldown: ", result?.cooldown.remaining_seconds || "none");
  console.log("\n");

  if (result?.cooldown?.remaining_seconds) {
    await delay(result?.cooldown.remaining_seconds * 1000);
  }
  await runPipeline(pipeline);
};
