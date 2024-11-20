import { Activity, ActivityName } from "@artifacts/shared";
import { db } from "..";
import { getCharacters } from "../api";
import { characterActivityTable } from "../db/schema";
import { Queuey } from "./queue";
import { CharacterContext } from "../types";

export class ServerState {
  characterContext: Record<string, CharacterContext>;
  activeQ: Record<string, Queuey>;

  constructor() {
    this.characterContext = {};
    this.activeQ = {};
  }

  async initialize() {
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

  update(ctx: CharacterContext) {
    this.characterContext[ctx.characterName] = ctx;
    const existingQ = this.activeQ[ctx.characterName];
    if (existingQ) {
      existingQ.abort();
    }

    if (ctx.activity === null) {
      return;
    }

    const queuey = new Queuey(ctx);
    this.activeQ[ctx.characterName] = queuey;
    queuey.initialize();
  }
}
