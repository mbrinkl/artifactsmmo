import { deposit, gather, move } from "../api";
import { coords, GatherLocation } from "../config";
import { PipelineItem, runPipeline } from "../pipeline";
import { ActionResultData, CharacterInfo } from "../types";

export interface GatherContext {
  location: GatherLocation;
}

const onExecuted = (res: ActionResultData | null, context: GatherContext): PipelineItem[] => {
  if (!res || !res.character.inventory) return [];

  const totalQuantity = res.character.inventory.reduce((a, b) => a + b.quantity, 0);

  // if invy full, bank
  if (totalQuantity === res.character.inventory_max_items) {
    const depositAllPipeline: PipelineItem[] = res.character.inventory
      .filter((x) => x.quantity > 0)
      .map(({ code, quantity }) => ({
        action: deposit,
        payload: { code, quantity },
      }));

    return [
      { action: move, payload: coords["Bank"] },
      ...depositAllPipeline,
      { action: move, payload: coords[context.location], onExecuted },
    ];
  }

  // else keep mining it up
  else {
    return [{ action: gather, onExecuted }];
  }
};

export const gatherAndBankScenario = async (characterInfo: CharacterInfo) => {
  console.log("in da scenario?", characterInfo);
  characterInfo.queue = [
    { action: move, payload: coords[characterInfo.activity!.context.location] },
    { action: gather, onExecuted },
  ];

  await runPipeline(characterInfo);
};
