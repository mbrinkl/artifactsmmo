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
    // todo parallelize
    console.log("fetching assets");
    const start = Date.now();
    this.cache.squares = await getMaps();
    this.cache.items = await getItems();
    this.cache.resources = await getResources();
    console.log("fetching assets in ms:", Date.now() - start);

    const characters = await getCharacters();
    const characterNames = characters.map((x) => x.name);

    const storedCharacterActivities = await db.select().from(characterActivityTable);

    characterNames.forEach((characterName) => {
      const stored = storedCharacterActivities.find((x) => x.name === characterName);
      if (stored && stored.activityName !== null && stored.activityContext !== null) {
        console.log(characterName, "Restored Activity - ", stored.activityName, stored.activityContext);
        const storedContext = stored.activityContext ? JSON.parse(stored.activityContext) : null;
        const storedActivity: Activity = { name: stored.activityName as ActivityName, context: storedContext };
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
