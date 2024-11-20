import { Activity, ActivityName, CharacterInfo } from "@artifacts/shared";
import { db } from "..";
import { getCharacters } from "../api";
import { characterActivityTable } from "../db/schema";
import { Queuey } from "./queue";
import { CharacterContext } from "../types";

export class ServerState {
  ctxMap: Record<string, CharacterContext>;

  constructor() {
    this.ctxMap = {};
  }

  async initialize(): Promise<void> {
    const characters = await getCharacters();
    if (!characters) {
      throw new Error("No characters found");
    }
    const characterNames = characters.map((x) => x.name);
    const storedCharacterActivities = await db.select().from(characterActivityTable);

    characterNames.forEach((characterName) => {
      const stored = storedCharacterActivities.find((x) => x.name === characterName);
      if (stored) {
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
