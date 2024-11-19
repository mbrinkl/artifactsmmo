import { ActionResultData } from "@artifacts/shared";
import { CharacterContext } from "./types";
import { characterContext } from ".";

export interface QueueItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => QueueItem<unknown>[];
}

export const delayMs = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const delayUntil = (inputDate: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetTime = new Date(inputDate).getTime();
    if (isNaN(targetTime)) return reject(new Error("Invalid date format."));

    const now = Date.now();
    if (now >= targetTime) return resolve();

    const interval = setInterval(
      () => {
        if (Date.now() >= targetTime) {
          clearInterval(interval);
          resolve();
        }
      },
      Math.min(targetTime - now, 1000),
    );
  });
};

export const runQueue = async (ctx: CharacterContext) => {
  const log = (...message: (string | number)[]) => {
    console.log(`${ctx.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  };
  log(`[ ${ctx.queue.map((x) => x.action.name).join()} ]`);

  try {
    const nextItem = ctx.queue.shift();
    if (!nextItem) {
      throw new Error("Queue is empty");
    }

    concurrencyCheck(ctx.characterName, ctx.version);
    log("executing", nextItem?.action.name, nextItem?.payload);
    const result = await nextItem.action(ctx.characterName, nextItem.payload);

    const next = nextItem.onExecuted?.(result, ctx.activity?.context);
    if (next) {
      concurrencyCheck(ctx.characterName, ctx.version);
      ctx.queue = ctx.queue.concat(next);
      log(`Updated pipeline: [ ${ctx.queue.map((x) => x.action.name).join()} ]`);
    }

    log("cooldown:", result?.character.cooldown || "none");

    if (result?.character.cooldown) {
      await delayMs(result.character.cooldown * 1000);
    }

    concurrencyCheck(ctx.characterName, ctx.version);
  } catch (err) {
    handleError(ctx.characterName, err as Error);
    return;
  }

  await runQueue(ctx);
};

const handleError = (characterName: string, err: Error) => {
  console.error("Queue run ended - ", characterName, " - ", err.message);
  if (err.message === "Version Mismatch") {
    return;
  }
  characterContext[characterName].activity = null;
  characterContext[characterName].queue = [];
};

const concurrencyCheck = (characterName: string, version: number) => {
  if (characterContext[characterName].version !== version) {
    throw new Error("Version Mismatch");
  }
};
