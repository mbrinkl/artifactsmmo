import createClient from "openapi-fetch";
import { paths } from "./schema";
import { mineAndBankScenario } from "./scenarios/mineAndBankScenario";

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

mineAndBankScenario({ characterName: "Toby", oreLocation: "Iron_Rocks" });
mineAndBankScenario({ characterName: "Carlos", oreLocation: "Copper_Rocks" });
mineAndBankScenario({ characterName: "Rascal", oreLocation: "Copper_Rocks" });
