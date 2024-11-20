import { Activity, Character } from "@artifacts/shared";
import { craftLoop } from "./craftLoop";
import { gatherLoop } from "./gatherLoop";

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

export const initialQueueFactory = (character: Character, activity: Activity) => {
  const res = { character };
  const { name, context } = activity;

  switch (name) {
    case "gather":
      return gatherLoop(res, context);
    case "craft":
      return craftLoop(res, context);
  }
};
