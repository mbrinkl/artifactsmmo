import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { CharacterContext } from "./types";
import { Queuey } from "./services/queue";
import { CharacterActivityService } from "./services/characterActivity.service";
import { ArtifactsApiService } from "./services/ArtifactsApiService";

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name);
  ctxMap: Record<string, CharacterContext>;
  encyclopedia: Encyclopedia;

  constructor(
    private readonly characterActivityService: CharacterActivityService,
    private readonly client: ArtifactsApiService,
  ) {
    this.ctxMap = {};
    this.encyclopedia = {
      items: [],
      monsters: [],
      resources: [],
      squares: [],
    };
  }

  async update(info: CharacterInfo, updateDb: boolean = true): Promise<void> {
    const existing = this.ctxMap[info.characterName];
    if (existing?.q) {
      existing.q.abort();
    }

    this.ctxMap[info.characterName] = info;

    if (updateDb) {
      await this.characterActivityService.upsert(info);
    }

    if (this.ctxMap[info.characterName].activity === null) {
      return;
    }

    const q = new Queuey(info, this, this.client);
    q.initialize();
    this.ctxMap[info.characterName].q = q;
  }

  async onModuleInit() {
    const [characters, encyclopedia] = await this.client.getInitialData();
    this.encyclopedia = encyclopedia;

    const characterNames = characters.map((x) => x.name);
    const storedCharacterInfo = await this.characterActivityService.findAll();
    console.log("stored is", storedCharacterInfo);

    characterNames.forEach((characterName) => {
      const stored = storedCharacterInfo.find((x) => x.characterName === characterName);
      if (stored) {
        this.logger.log(`${characterName} Restored Activity - ${stored.activity?.name}`);
        this.update(stored, false);
      } else {
        this.update({ characterName, activity: null });
      }
    });
  }

  onQueueError(characterName: string): void {
    this.ctxMap[characterName].activity = null;
    this.ctxMap[characterName].q = undefined;
    // update db to null activity?
  }

  getInfo(): CharacterInfo[] {
    return Object.values(this.ctxMap).map((v) => ({ characterName: v.characterName, activity: v.activity }));
  }
}
