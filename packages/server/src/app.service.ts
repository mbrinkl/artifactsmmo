import { Injectable, OnModuleInit } from "@nestjs/common";
import { getLogger } from "./services/logger";
import { CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { CharacterContext } from "./types";
import { Queuey } from "./services/queue";
import { getCharacters, getItems, getMaps, getMonsters, getResources } from "./api";
import { UserService } from "./services/dbCharInfoRepository";

@Injectable()
export class AppService implements OnModuleInit {
  private logger = getLogger(AppService.name);
  ctxMap: Record<string, CharacterContext>;
  encyclopedia: Encyclopedia;

  constructor(private readonly userService: UserService) {
    this.ctxMap = {};
    this.encyclopedia = {
      items: [],
      monsters: [],
      resources: [],
      squares: [],
    };
  }

  async update(info: CharacterInfo): Promise<void> {
    const existing = this.ctxMap[info.characterName];
    if (existing?.q) {
      existing.q.abort();
    }

    this.ctxMap[info.characterName] = info;

    if (this.ctxMap[info.characterName].activity === null) {
      return;
    }

    const q = new Queuey(info, this, this.logger);
    q.initialize();
    this.ctxMap[info.characterName].q = q;
  }

  async initty(info: CharacterInfo) {
    this.ctxMap[info.characterName] = info;

    if (this.ctxMap[info.characterName].activity === null) {
      return;
    }

    const q = new Queuey(info, this, this.logger);
    q.initialize();
    this.ctxMap[info.characterName].q = q;
  }

  async onModuleInit() {
    this.logger.info("fetching assets");
    const start = Date.now();
    const [characters, squares, items, resources, monsters] = await Promise.all([
      getCharacters(),
      getMaps(),
      getItems(),
      getResources(),
      getMonsters(),
    ]);
    this.logger.info(`fetched assets in ${Date.now() - start}ms`);

    this.encyclopedia.squares = squares;
    this.encyclopedia.items = items;
    this.encyclopedia.resources = resources;
    this.encyclopedia.monsters = monsters;

    const characterNames = characters.map((x) => x.name);
    const storedCharacterInfo = await this.userService.findAll();

    characterNames.forEach((characterName) => {
      const stored = storedCharacterInfo.find((x) => x.characterName === characterName);
      if (stored) {
        this.logger.info(`${characterName} Restored Activity - ${stored.activity.name}`);
        this.update(stored);
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
