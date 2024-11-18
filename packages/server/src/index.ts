import Fastify from "fastify";
import cors from "@fastify/cors";
import createClient from "openapi-fetch";
import { paths } from "@artifacts/shared";
import { gatherAndBankScenario, GatherContext } from "./scenarios";
import { getCharacters } from "./api";
import { hooks, routes } from "./routes";

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

const characterInfo: CharacterInfo[] = characterNames.map((characterName) => {
  // if name does not exist in db?
  if (characterName === "asdfadsf") {
    // activity = stored activity
    // factory(activity)
  }
  return { characterName, activity: null };
});

// gatherAndBankScenario({ characterName: "Toby", location: "Iron_Rocks" });
// gatherAndBankScenario({ characterName: "Carlos", location: "Copper_Rocks" });
// gatherAndBankScenario({ characterName: "Rascal", location: "Gudgeon_Fishing" });
// gatherAndBankScenario({ characterName: "Piper", location: "Sunflower" });
// gatherAndBankScenario({ characterName: "Sadie", location: "Ash_Tree" });

type Activity = { name: "gather"; context: Omit<GatherContext, "characterName"> };

interface CharacterInfo {
  characterName: string;
  activity: Activity | null;
  // currqueue ?
}

const factory = ({ characterName, activity }: CharacterInfo) => {
  // some graceful shutdown of character ...
  if (!activity) return;
  const context = { characterName, ...activity.context };

  switch (activity?.name) {
    case "gather":
      gatherAndBankScenario(context);
      break;
    default:
      console.log("Invalid activity:", activity.name);
      break;
  }
};

const fastify = Fastify();

await fastify.register(cors);
await fastify.register(hooks);
await fastify.register(routes);

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
