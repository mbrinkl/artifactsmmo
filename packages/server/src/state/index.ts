import { Activity, ActivityName, CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { db } from "..";
import { getCharacters, getItems, getMaps, getMonsters, getResources } from "../api";
import { characterActivityTable } from "../db/schema";
import { Queuey } from "./queue";
import { CharacterContext } from "../types";

export class ServerState {
  ctxMap: Record<string, CharacterContext>;
  encyclopedia: Encyclopedia;

  constructor() {
    this.ctxMap = {};
    this.encyclopedia = {
      squares: [],
      items: [],
      resources: [],
      monsters: [],
    };
  }

  async initialize(): Promise<void> {
    console.log("fetching assets");
    const start = Date.now();
    const [characters, squares, items, resources, monsters] = await Promise.all([
      getCharacters(),
      getMaps(),
      getItems(),
      getResources(),
      getMonsters(),
    ]);
    console.log("fetched assets in ms:", Date.now() - start);

    this.encyclopedia.squares = squares;
    this.encyclopedia.items = items;
    this.encyclopedia.resources = resources;
    this.encyclopedia.monsters = monsters;

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
