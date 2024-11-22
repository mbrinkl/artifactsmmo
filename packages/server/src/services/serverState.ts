import { Activity, ActivityName, CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { getCharacters, getItems, getMaps, getMonsters, getResources } from "../api";
import { Queuey } from "./queue";
import { CharacterContext } from "../types";
import { Logger } from "pino";
import { DbAccessor } from "./dbAccessor";

export class ServerState {
  ctxMap: Record<string, CharacterContext>;
  encyclopedia: Encyclopedia;

  constructor(
    private dbAccessor: DbAccessor,
    private logger: Logger,
  ) {
    this.logger = logger.child({ name: ServerState.name });
    this.ctxMap = {};
    this.encyclopedia = {
      squares: [],
      items: [],
      resources: [],
      monsters: [],
    };
  }

  async initialize(): Promise<void> {
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
    const storedCharacterActivities = await this.dbAccessor.getCharacters();

    characterNames.forEach((characterName) => {
      const stored = storedCharacterActivities.find((x) => x.name === characterName);
      if (stored && stored.activityName !== null && stored.activityParams !== null) {
        this.logger.info(`${characterName} Restored Activity - ${stored.activityName}, ${stored.activityParams}`);
        const storedParams = stored.activityParams ? JSON.parse(stored.activityParams) : null;
        const storedActivity: Activity = { name: stored.activityName as ActivityName, params: storedParams };
        this.update({ characterName, activity: storedActivity });
      } else {
        this.update({ characterName, activity: null });
      }
    });
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

  onQueueError(characterName: string): void {
    this.ctxMap[characterName].activity = null;
    this.ctxMap[characterName].q = undefined;
    // update db to null activity?
  }

  getInfo(): CharacterInfo[] {
    return Object.values(this.ctxMap).map((v) => ({ characterName: v.characterName, activity: v.activity }));
  }
}
