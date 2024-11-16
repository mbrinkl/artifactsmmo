import { deposit, gather, move } from "../actions";
import { coords, MapLocation } from "../config";
import { PipelineConfig, PipelineContext, PipelineItem, runPipeline } from "../pipeline";
import { ActionResultData } from "../types";

interface Context extends PipelineContext {
  oreLocation: MapLocation;
}

const onExecuted = (res: ActionResultData | null, context: Context): PipelineItem[] => {
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
      { action: move, payload: coords[context.oreLocation], onExecuted },
    ];
  }

  // else keep mining it up
  else {
    return [{ action: gather, onExecuted }];
  }
};

export const mineAndBankScenario = async (context: Context) => {
  const config: PipelineConfig<Context> = {
    pipeline: [
      { action: move, payload: coords[context.oreLocation] },
      { action: gather, onExecuted },
    ],
    context,
  };

  await runPipeline(config);
};
