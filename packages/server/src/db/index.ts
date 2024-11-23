import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";

export const initializeDb = async () => {
  let dbPath = process.env.db_path || "";
  if (dbPath && !dbPath.endsWith("/")) {
    dbPath += "/";
  }
  const dbFileName = `file:${dbPath}local.db`;
  const db = drizzle(dbFileName, { schema });
  await migrate(db, { migrationsFolder: path.join(__dirname, "./migrations") });
  return db;
};
