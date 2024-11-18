import { ActionResultData } from "./types";

export interface PipelineContext {
  characterName: string;
}

export interface PipelineItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => PipelineItem<unknown>[];
}

export interface PipelineConfig<T extends PipelineContext> {
  context: T;
  pipeline: PipelineItem[];
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const runPipeline = async ({ pipeline, context }: PipelineConfig<PipelineContext>) => {
  const log = (...message: (string | number)[]) => {
    console.log(`${context.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  };

  log(`[ ${pipeline.map((x) => x.action.name).join()} ]`);

  const nextItem = pipeline.shift();
  if (!nextItem) {
    return;
  }

  log("executing", nextItem?.action.name, nextItem?.payload);

  const result = await nextItem.action(context.characterName, nextItem.payload);

  const next = nextItem.onExecuted?.(result, context);
  if (next) {
    pipeline = pipeline.concat(next);
    log(`Updated pipeline: [ ${pipeline.map((x) => x.action.name).join()} ]`);
  }

  log("cooldown:", result?.cooldown.remaining_seconds || "none");

  if (result?.cooldown?.remaining_seconds) {
    await delay(result?.cooldown.remaining_seconds * 1000);
  }
  await runPipeline({ pipeline, context });
};
