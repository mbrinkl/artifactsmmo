/* eslint-disable @typescript-eslint/no-explicit-any */
import pino, { Logger } from "pino";
import { ActionResultData, CharacterInfo } from "@artifacts/shared";
import { getCharacter } from "../api";
import { delayMs, delayUntil, initialQueueFactory } from "./util";
import { ActivityContext } from "@artifacts/shared";
import { AppService } from "src/app.service";

type ActionFn = (name: string, payload?: any) => Promise<ActionResultData | null>;

export interface QueueItem<TContext = any, T extends ActionFn = any> {
  action: T;
  payload?: any;
  onExecuted?: (res: ReturnType<T>, context: TContext) => QueueItem<TContext>[];
}

export class Queuey {
  private info: CharacterInfo;
  private activityCtx: ActivityContext | null;
  private queue: QueueItem[];
  private aborted: boolean;
  private logger: pino.Logger;

  constructor(
    ctx: CharacterInfo,
    private serverState: AppService,
    logger: Logger,
  ) {
    this.info = ctx;
    this.activityCtx = null;
    this.queue = [];
    this.aborted = false;
    this.logger = logger.child({ name: ctx.characterName });
  }

  // mark as aborted to prevent any actions happening before class instance is destroyed
  // TODO: can inject abortController into fetch calls?
  abort() {
    this.aborted = true;
  }

  async initialize() {
    if (!this.info.activity) return;

    const initialCharacterState = await getCharacter(this.info.characterName);

    if (initialCharacterState.cooldown_expiration) {
      this.logger.info("Awaiting existing cooldown");
      await delayUntil(initialCharacterState.cooldown_expiration);
    }

    try {
      this.concurrencyCheck();
      [this.queue, this.activityCtx] = initialQueueFactory(
        initialCharacterState,
        this.info.activity,
        this.serverState.encyclopedia,
      );
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
    this.logger.info(`[ ${this.queue.map((x) => x.action.name).join()} ]`);

    try {
      const nextItem = this.queue.shift();
      if (!nextItem) {
        throw new Error("Queue is empty");
      }

      this.concurrencyCheck();
      this.logger.info("executing", nextItem?.action.name, nextItem?.payload);
      const result = await nextItem.action(this.info.characterName, nextItem.payload);

      // TODO handle null result instead of passing null to onExecuted

      const next = nextItem.onExecuted?.(result, this.activityCtx);
      if (next) {
        this.concurrencyCheck();
        this.queue = this.queue.concat(next);
        this.logger.info(`Updated pipeline: [ ${this.queue.map((x) => x.action.name).join()} ]`);
      }

      this.logger.info("cooldown:", result?.character.cooldown || "none");

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
      this.logger.warn("Aborted");
      return;
    }
    this.logger.error(err);
    this.queue = [];
    this.serverState.onQueueError(this.info.characterName);
  }

  private concurrencyCheck() {
    if (this.aborted) {
      throw new Error("Aborted");
    }
  }
}
