import { CharacterInfo } from "@artifacts/shared";
import { characterActivityTable } from "../db/schema";
import { Database } from "../types";

export class DbAccessor {
  constructor(private db: Database) {}

  async getCharacters() {
    return await this.db.select().from(characterActivityTable);
  }

  async upsertCharacter(characterInfo: CharacterInfo) {
    const storeData: typeof characterActivityTable.$inferInsert = {
      name: characterInfo.characterName,
      activityName: characterInfo.activity?.name || null,
      activityParams: characterInfo.activity?.params ? JSON.stringify(characterInfo.activity.params) : null,
    };

    await this.db.insert(characterActivityTable).values(storeData).onConflictDoUpdate({
      target: characterActivityTable.name,
      set: storeData,
    });
  }
}
