import createClient from "openapi-fetch";
import { paths } from "@artifacts/shared";
import { initFastify } from "./services/fastify";
import { ServerState } from "./services/serverState";
import { initializeLogger } from "./services/logger";
import { initializeDb } from "./db";
import { DbAccessor } from "./services/dbAccessor";

const authToken = process.env.auth_token;
if (!authToken) {
  throw new Error("Auth token not set in environment variables");
}

export const client = createClient<paths>({
  baseUrl: "https://api.artifactsmmo.com",
  headers: {
    Authorization: "Bearer " + authToken,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const startup = async () => {
  const logger = initializeLogger();
  const db = await initializeDb();
  const dbAccessor = new DbAccessor(db);
  const serverState = new ServerState(dbAccessor, logger);
  await serverState.initialize();
  await initFastify(serverState, dbAccessor, logger);
};

startup();
