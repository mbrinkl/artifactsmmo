import { ActionResultData, CharacterInfo } from "@artifacts/shared";
import { getCharacter } from "../api";
import { delayMs, delayUntil, initialQueueFactory } from "./util";
import { ActivityContext } from "@artifacts/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface QueueItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => QueueItem<TContext>[];
}

export class Queuey {
  private info: CharacterInfo;
  private activityCtx: ActivityContext | null;
  private queue: QueueItem[];
  private aborted: boolean;

  constructor(ctx: CharacterInfo) {
    this.info = ctx;
    this.activityCtx = null;
    this.queue = [];
    this.aborted = false;
  }

  // mark as aborted to prevent any actions happening before class instance is destroyed
  // TODO: can inject abortController into fetch calls?
  abort() {
    this.aborted = true;
  }

  log(...message: (string | number)[]) {
    console.log(`${this.info.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  }

  async initialize() {
    if (!this.info.activity) return;

    const initialCharacterState = await getCharacter(this.info.characterName);

    if (initialCharacterState.cooldown_expiration) {
      this.log("Awaiting existing cooldown");
      await delayUntil(initialCharacterState.cooldown_expiration);
    }

    try {
      this.concurrencyCheck();
      [this.queue, this.activityCtx] = initialQueueFactory(initialCharacterState, this.info.activity);
      if (!this.queue || !this.activityCtx) {
        throw new Error("Failed to create initial queue");
      }
    } catch (err) {
      this.handleError(err as Error);
      return;
    }

    await this.execute();
  }

  private async execute() {
    this.log(`[ ${this.queue.map((x) => x.action.name).join()} ]`);

    try {
      const nextItem = this.queue.shift();
      if (!nextItem) {
        throw new Error("Queue is empty");
      }

      this.concurrencyCheck();
      this.log("executing", nextItem?.action.name, nextItem?.payload);
      const result = await nextItem.action(this.info.characterName, nextItem.payload);

      // TODO handle null result instead of passing null to onExecuted

      const next = nextItem.onExecuted?.(result, this.activityCtx);
      if (next) {
        this.concurrencyCheck();
        this.queue = this.queue.concat(next);
        this.log(`Updated pipeline: [ ${this.queue.map((x) => x.action.name).join()} ]`);
      }

      this.log("cooldown:", result?.character.cooldown || "none");

      if (result?.character.cooldown) {
        await delayMs(result.character.cooldown * 1000);
      }

      this.concurrencyCheck();
    } catch (err) {
      this.handleError(err as Error);
      return;
    }

    await this.execute();
  }

  private handleError(err: Error) {
    if (err.message === "Aborted") {
      this.log("Aborted");
      return;
    }
    // TODO: this.log error
    this.log("Execution error -", err.message);
    this.queue = [];
  }

  private concurrencyCheck() {
    if (this.aborted) {
      throw new Error("Aborted");
    }
  }
}
