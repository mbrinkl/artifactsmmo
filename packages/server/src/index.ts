import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import createClient from "openapi-fetch";
import { DEFAULT_PORT, paths } from "@artifacts/shared";
import { routes } from "./routes";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/libsql";
import * as dbSchema from "./db/schema";
import { ServerState } from "./state";

const authToken = process.env.auth_token;
if (!authToken) {
  throw new Error("Auth token not set in environment variables");
}

export const db = drizzle("file:local.db", { schema: dbSchema });

export const client = createClient<paths>({
  baseUrl: "https://api.artifactsmmo.com",
  headers: {
    Authorization: "Bearer " + authToken,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const serverState = new ServerState();
await serverState.initialize();

const fastify = Fastify();

if (process.env.NODE_ENV === "development") {
  await fastify.register(fastifyCors);
} else {
  await fastify.register(fastifyStatic, {
    root: path.join(dirname(fileURLToPath(import.meta.url)), "../../client/dist"),
  });
  fastify.get("/", (req, res) => {
    res.sendFile("index.html");
  });
}

await fastify.register(routes);

fastify.listen({ port: DEFAULT_PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
