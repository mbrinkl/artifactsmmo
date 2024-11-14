import createClient from "openapi-fetch";
import { paths } from "./schema";
import { gatherCopperScenario } from "./scenarios/gatherCopperScenario";

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

await gatherCopperScenario();
