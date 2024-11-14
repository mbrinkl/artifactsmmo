import { deposit, gather, move } from "../actions";
import { LOCATION_COORDS } from "../config";
import { PipelineItem, ResultData, runPipeline } from "../pipeline";
import { Destination } from "../types";

const mineLocation: Destination = { x: 2, y: 0 };

const onExecuted = (res: ResultData | null): PipelineItem<any>[] => {
  if (!res || !res.character.inventory) return [];

  const totalQuantity = res.character.inventory.reduce((a, b) => a + b.quantity, 0);

  // if invy full, bank
  if (totalQuantity === res.character.inventory_max_items) {
    const depositAllPipeline: PipelineItem<any>[] = res.character.inventory
      .filter((x) => x.quantity > 0)
      .map(({ code, quantity }) => ({
        action: deposit,
        payload: { code, quantity },
      }));

    return [
      { action: move, payload: LOCATION_COORDS["Bank"] },
      ...depositAllPipeline,
      { action: move, payload: mineLocation, onExecuted },
    ];
  }

  // else keep mining it up
  else {
    return [{ action: gather, onExecuted }];
  }
};

export const gatherCopperScenario = async () => {
  const pipeline: PipelineItem<any>[] = [
    { action: move, payload: mineLocation },
    { action: gather, onExecuted },
  ];

  await runPipeline(pipeline);
};
