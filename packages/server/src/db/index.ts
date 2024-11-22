import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";

export const initializeDb = async () => {
  const db = drizzle("file:local.db", { schema });
  await migrate(db, { migrationsFolder: path.join(__dirname, "./migrations") });
  return db;
};
