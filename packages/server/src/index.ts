import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import createClient from "openapi-fetch";
import { paths } from "@artifacts/shared";
import { getCharacters } from "./api";
import { hooks, routes } from "./routes";
import { CharacterContext } from "./types";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

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
  redirect: "follow",
});

const characters = await getCharacters();
if (!characters) {
  throw new Error("No characters found");
}
const characterNames = characters.map((x) => x.name);

export const characterContext: Record<string, CharacterContext> = {};

characterNames.forEach((characterName) => {
  // if name is in db
  // activity = stored activity
  // factory(activity)
  // return charactername with stored activity
  // else
  characterContext[characterName] = { characterName, activity: null, queue: [] };
});

// gatherAndBankScenario({ characterName: "Toby", location: "Iron_Rocks" });
// gatherAndBankScenario({ characterName: "Carlos", location: "Copper_Rocks" });
// gatherAndBankScenario({ characterName: "Rascal", location: "Gudgeon_Fishing" });
// gatherAndBankScenario({ characterName: "Piper", location: "Sunflower" });
// gatherAndBankScenario({ characterName: "Sadie", location: "Ash_Tree" });

const fastify = Fastify();

console.log("env is", process.env.NODE_ENV);

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

await fastify.register(hooks);
await fastify.register(routes);

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
