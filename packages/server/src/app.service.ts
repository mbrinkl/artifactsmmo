import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Activity, CharacterInfo, CharacterInfoResponse } from "@artifacts/shared";
import { Queue } from "./queue/queue";
import { CharacterActivityRepository } from "./services/characterActivity.repository";
import { ArtifactsApiService, InitialData } from "./services/artifactsApi.service";

export interface CharacterContext extends CharacterInfo {
  q?: Queue;
}

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name);
  private ctxMap: Map<string, CharacterContext> = new Map();

  constructor(
    private readonly characterActivityRepository: CharacterActivityRepository,
    private readonly client: ArtifactsApiService,
    @Inject("INITIAL_DATA") private readonly data: InitialData,
  ) {}

  async onModuleInit() {
    const storedCharacterInfo = await this.characterActivityRepository.findAll();
    this.data.characterNames.forEach((characterName) => {
      const stored = storedCharacterInfo.find((x) => x.characterName === characterName);
      const characterInfo = stored ?? { characterName, activity: null, defaultActivity: null };
      this.ctxMap.set(characterInfo.characterName, {
        ...characterInfo,
        q: new Queue(characterInfo, this.data.encyclopedia, this.onQueueError.bind(this), this.client),
      });
    });
  }

  async getAllCharacterInfo(): Promise<CharacterInfoResponse> {
    // TODO should keep this updated using a queue callback
    const characters = await this.client.getCharacters();
    return [...this.ctxMap.values()].map(({ characterName, defaultActivity, activity, error }) => ({
      characterName,
      activity,
      defaultActivity,
      error,
      ...characters.find((x) => x.name === characterName),
    }));
  }

  async update(info: CharacterInfo, updateDb: boolean = true): Promise<void> {
    if (!this.ctxMap.has(info.characterName)) {
      this.logger.error("Invalid character name in update: " + info.characterName);
      return;
    }

    const ctx = this.ctxMap.get(info.characterName);
    if (ctx?.q) {
      ctx.q.abort();
    }

    ctx.activity = info.activity;
    ctx.error = undefined;

    if (updateDb) {
      await this.characterActivityRepository.upsert(info);
    }

    if (ctx.activity !== null) {
      ctx.q = new Queue(info, this.data.encyclopedia, this.onQueueError.bind(this), this.client);
    }
  }

  clearAll() {
    this.ctxMap.forEach(async (value, key, map) => {
      if (value.q) {
        value.q.abort();
      }
      const ctx = this.ctxMap.get(key);
      ctx.activity = null;
      ctx.error = undefined;
      map.set(key, ctx);
      await this.characterActivityRepository.upsert(ctx);
    });
  }

  async updateDefaultActivity(characterName: string, activity: Activity) {
    const ctx = this.ctxMap.get(characterName);
    ctx.defaultActivity = activity;
    await this.characterActivityRepository.upsert(ctx);
  }

  setAllDefault() {
    this.ctxMap.forEach(async (value, key, map) => {
      if (!value.defaultActivity) {
        return;
      }
      if (value.activity && JSON.stringify(value.defaultActivity) === JSON.stringify(value.activity)) {
        return;
      }

      if (value.q) {
        value.q.abort();
      }

      map.set(key, {
        characterName: value.characterName,
        activity: value.defaultActivity,
        defaultActivity: value.defaultActivity,
      });

      await this.characterActivityRepository.upsert({
        characterName: value.characterName,
        activity: value.defaultActivity,
        defaultActivity: value.defaultActivity,
      });
    });
  }

  private onQueueError(characterName: string, error: string): void {
    if (!this.ctxMap.has(characterName)) {
      this.logger.error("Invalid character name in onQueueError: " + characterName);
      return;
    }
    const ctx = this.ctxMap.get(characterName);
    ctx.error = error;
    ctx.activity = null;
    this.ctxMap.set(characterName, ctx);
    this.characterActivityRepository.upsert(ctx);
  }
}
