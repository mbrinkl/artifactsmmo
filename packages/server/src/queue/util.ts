import { Activity, ActivityContext, Character, Encyclopedia } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { craftQueueBuilder, getCraftContext } from "./craftQueueBuilder";
import { gatherQueueBuilder, getGatherContext } from "./gatherQueueBuilder";
import { fightQueueBuilder, getFightContext } from "./fightQueueBuilder";

export const delayMs = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const delayUntil = (inputDate: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetTime = new Date(inputDate).getTime();
    if (isNaN(targetTime)) return reject(new Error("Invalid date format."));

    const now = Date.now();
    if (now >= targetTime) return resolve();

    setTimeout(resolve, targetTime - now);
  });
};

export const initialQueueFactory = (
  character: Character,
  activity: Activity,
  encyclopedia: Encyclopedia,
): [QueueItem[], ActivityContext] => {
  const res = { character };
  const { name, params } = activity;
  let ctx: ActivityContext;

  switch (name) {
    case "gather":
      ctx = getGatherContext(encyclopedia, params);
      return [gatherQueueBuilder(res, ctx), ctx];
    case "craft":
      ctx = getCraftContext(encyclopedia, params);
      return [craftQueueBuilder(res, ctx), ctx];
    case "fight":
      ctx = getFightContext(encyclopedia, params);
      return [fightQueueBuilder(res, ctx), ctx];
  }
};
