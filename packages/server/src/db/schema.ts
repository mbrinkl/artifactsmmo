import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const characterActivityTable = sqliteTable("character_activity", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  activityName: text(),
  activityParams: text(),
});
