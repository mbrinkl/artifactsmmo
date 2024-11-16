import createClient from "openapi-fetch";
import { paths } from "./schema";
import { gatherAndBankScenario } from "./scenarios/gatherAndBankScenario";

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

gatherAndBankScenario({ characterName: "Toby", location: "Iron_Rocks" });
gatherAndBankScenario({ characterName: "Carlos", location: "Copper_Rocks" });
gatherAndBankScenario({ characterName: "Rascal", location: "Gudgeon_Fishing" });
gatherAndBankScenario({ characterName: "Piper", location: "Sunflower" });
gatherAndBankScenario({ characterName: "Sadie", location: "Ash_Tree" });
