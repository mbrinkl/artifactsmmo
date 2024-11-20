import { ActionResultData } from "@artifacts/shared";
import { CharacterContext } from "../types";
import { getCharacter } from "../api";
import { delayMs, delayUntil, initialQueueFactory } from "./util";

export interface QueueItem<TContext = any, T = any> {
  action: (name: string, payload?: T) => Promise<ActionResultData | null>;
  payload?: T;
  onExecuted?: (result: ActionResultData | null, context: TContext) => QueueItem<TContext>[];
}

export class Queuey {
  private ctx: CharacterContext;
  private queue: QueueItem[];
  private aborted: boolean;

  constructor(ctx: CharacterContext) {
    this.ctx = ctx;
    this.queue = [];
    this.aborted = false;
  }

  // mark as aborted to prevent any actions happening before class instance is destroyed
  // TODO: can inject abortController into fetch calls?
  abort() {
    this.aborted = true;
  }

  log(...message: (string | number)[]) {
    console.log(`${this.ctx.characterName.padEnd(7)}: ${message.map((x) => JSON.stringify(x)).join(" ")}`);
  }

  async initialize() {
    if (!this.ctx.activity) return;

    const initialCharacterState = await getCharacter(this.ctx.characterName);

    if (initialCharacterState.cooldown_expiration) {
      this.log("Awaiting existing cooldown");
      await delayUntil(initialCharacterState.cooldown_expiration);
    }

    try {
      this.concurrencyCheck();
    } catch (err) {
      this.handleError(err as Error);
      return;
    }

    this.queue = initialQueueFactory(initialCharacterState, this.ctx.activity);
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
      const result = await nextItem.action(this.ctx.characterName, nextItem.payload);

      // TODO handle null result instead of passing null to onExecuted

      // ew non-null assertion
      const next = nextItem.onExecuted?.(result, this.ctx.activity!.context);
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
