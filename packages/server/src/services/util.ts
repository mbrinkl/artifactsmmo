import { Activity, ActivityContext, Character, Encyclopedia } from "@artifacts/shared";
import { craftLoop, getCraftContext } from "../loops/craftLoop";
import { gatherLoop, getGatherContext } from "../loops/gatherLoop";
import { QueueItem } from "./queue";
import { fightLoop, getFightContext } from "../loops/fightLoop";

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
      return [gatherLoop(res, ctx), ctx];
    case "craft":
      ctx = getCraftContext(encyclopedia, params);
      return [craftLoop(res, ctx), ctx];
    case "fight":
      ctx = getFightContext(encyclopedia, params);
      return [fightLoop(res, ctx), ctx];
  }
};
