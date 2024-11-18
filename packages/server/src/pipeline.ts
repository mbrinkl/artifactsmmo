import { ActionResultData, CharacterInfo } from "./types";

export interface PipelineItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => PipelineItem<unknown>[];
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const runPipeline = async (info: CharacterInfo) => {
  const log = (...message: (string | number)[]) => {
    console.log(`${info.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  };

  log(`[ ${info.queue.map((x) => x.action.name).join()} ]`);

  const nextItem = info.queue.shift();
  if (!nextItem) {
    return;
  }

  log("executing", nextItem?.action.name, nextItem?.payload);

  const result = await nextItem.action(info.characterName, nextItem.payload);

  const next = nextItem.onExecuted?.(result, info.activity?.context);
  if (next) {
    info.queue = info.queue.concat(next);
    log(`Updated pipeline: [ ${info.queue.map((x) => x.action.name).join()} ]`);
  }

  log("cooldown:", result?.cooldown.remaining_seconds || "none");

  if (result?.cooldown?.remaining_seconds) {
    await delay(result?.cooldown.remaining_seconds * 1000);
  }
  await runPipeline(info);
};
