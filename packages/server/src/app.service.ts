import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CharacterInfo } from "@artifacts/shared";
import { Queue } from "./queue/queue";
import { CharacterActivityService } from "./services/characterActivity.service";
import { ArtifactsApiService, InitialData } from "./services/artifactsApi.service";

export interface CharacterContext extends CharacterInfo {
  q?: Queue;
}

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name);
  private ctxMap: Map<string, CharacterContext> = new Map();

  constructor(
    private readonly characterActivityService: CharacterActivityService,
    private readonly client: ArtifactsApiService,
    @Inject("INITIAL_DATA") private readonly data: InitialData,
  ) {}

  async onModuleInit() {
    const storedCharacterInfo = await this.characterActivityService.findAll();
    this.data.characterNames.forEach((characterName) => {
      const stored = storedCharacterInfo.find((x) => x.characterName === characterName);
      const characterInfo = stored ?? { characterName, activity: null };
      this.ctxMap.set(characterInfo.characterName, {
        ...characterInfo,
        q: new Queue(characterInfo, this.data.encyclopedia, this.onQueueError.bind(this), this.client),
      });
    });
  }

  hasCharacter(characterName: string): boolean {
    return this.ctxMap.has(characterName);
  }

  getAllCharacterInfo(): CharacterInfo[] {
    return [...this.ctxMap.values()].map(({ characterName, activity }) => ({ characterName, activity }));
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

    if (updateDb) {
      await this.characterActivityService.upsert(info);
    }

    if (ctx.activity !== null) {
      ctx.q = new Queue(info, this.data.encyclopedia, this.onQueueError.bind(this), this.client);
    }
  }

  private onQueueError(characterName: string): void {
    if (!this.ctxMap.has(characterName)) {
      this.logger.error("Invalid character name in onQueueError: " + characterName);
      return;
    }
    this.ctxMap.set(characterName, { characterName, activity: null });
    this.characterActivityService.upsert({ characterName, activity: null });
  }
}
