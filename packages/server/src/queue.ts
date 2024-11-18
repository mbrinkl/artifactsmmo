import { ActionResultData } from "@artifacts/shared";
import { CharacterContext } from "./types";

export interface QueueItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => QueueItem<unknown>[];
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const runQueue = async (ctx: CharacterContext) => {
  const log = (...message: (string | number)[]) => {
    console.log(`${ctx.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  };

  log(`[ ${ctx.queue.map((x) => x.action.name).join()} ]`);

  const nextItem = ctx.queue.shift();
  if (!nextItem) {
    return;
  }

  log("executing", nextItem?.action.name, nextItem?.payload);

  const result = await nextItem.action(ctx.characterName, nextItem.payload);

  const next = nextItem.onExecuted?.(result, ctx.activity?.context);
  if (next) {
    ctx.queue = ctx.queue.concat(next);
    log(`Updated pipeline: [ ${ctx.queue.map((x) => x.action.name).join()} ]`);
  }

  log("cooldown:", result?.cooldown.remaining_seconds || "none");

  if (result?.cooldown?.remaining_seconds) {
    await delay(result?.cooldown.remaining_seconds * 1000);
  }
  await runQueue(ctx);
};
