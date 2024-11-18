import { CharacterInfo } from "../types";
import { gatherAndBankScenario } from "./gatherAndBankScenario";

export const scenarioFactory = ({ characterName, activity }: CharacterInfo) => {
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
