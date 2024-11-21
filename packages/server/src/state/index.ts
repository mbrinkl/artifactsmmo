import { Activity, ActivityName, CharacterInfo, Item, Resource, Square } from "@artifacts/shared";
import { db } from "..";
import { getCharacters, getItems, getMaps, getResources } from "../api";
import { characterActivityTable } from "../db/schema";
import { Queuey } from "./queue";
import { CharacterContext } from "../types";

interface DataCache {
  squares: Square[];
  items: Item[];
  resources: Resource[];
}

export class ServerState {
  ctxMap: Record<string, CharacterContext>;
  cache: DataCache;

  constructor() {
    this.ctxMap = {};
    this.cache = {
      squares: [],
      items: [],
      resources: [],
    };
  }

  async initialize(): Promise<void> {
    console.log("fetching assets");
    const start = Date.now();
    const [squares, items, resources, characters] = await Promise.all([
      getMaps(),
      getItems(),
      getResources(),
      getCharacters(),
    ]);
    console.log("fetching assets in ms:", Date.now() - start);

    this.cache.squares = squares;
    this.cache.items = items;
    this.cache.resources = resources;

    const characterNames = characters.map((x) => x.name);
    const storedCharacterActivities = await db.select().from(characterActivityTable);

    characterNames.forEach((characterName) => {
      const stored = storedCharacterActivities.find((x) => x.name === characterName);
      if (stored && stored.activityName !== null && stored.activityParams !== null) {
        console.log(characterName, "Restored Activity - ", stored.activityName, stored.activityParams);
        const storedParams = stored.activityParams ? JSON.parse(stored.activityParams) : null;
        const storedActivity: Activity = { name: stored.activityName as ActivityName, params: storedParams };
        this.update({ characterName, activity: storedActivity });
      } else {
        this.update({ characterName, activity: null });
      }
    });
  }

  update(info: CharacterInfo): void {
    const existing = this.ctxMap[info.characterName];
    if (existing?.q) {
      existing.q.abort();
    }

    this.ctxMap[info.characterName] = info;
    if (this.ctxMap[info.characterName].activity === null) {
      return;
    }

    const q = new Queuey(info);
    q.initialize();
    this.ctxMap[info.characterName].q = q;
  }

  getInfo(): CharacterInfo[] {
    return Object.values(this.ctxMap).map((v) => ({ characterName: v.characterName, activity: v.activity }));
  }
}
