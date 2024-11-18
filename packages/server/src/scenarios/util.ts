import { CharacterInfo } from "../types";
import { gatherAndBankScenario } from "./gatherAndBankScenario";

export const scenarioFactory = (info: CharacterInfo) => {
  // some graceful shutdown of character ...
  if (!info.activity) return;

  switch (info.activity.name) {
    case "gather":
      console.log("doing scenario?");
      gatherAndBankScenario(info);
      break;
    default:
      console.log("Invalid activity:", info.activity.name);
      break;
  }
};
