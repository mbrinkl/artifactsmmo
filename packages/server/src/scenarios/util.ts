import { CharacterContext } from "../types";
import { gatherAndBankScenario } from "./gatherAndBankScenario";

export const scenarioFactory = (ctx: CharacterContext) => {
  // some graceful shutdown of character ...
  if (!ctx.activity) return;

  switch (ctx.activity.name) {
    case "gather":
      console.log("doing scenario?");
      gatherAndBankScenario(ctx);
      break;
    default:
      console.log("Invalid activity:", ctx.activity.name);
      break;
  }
};
