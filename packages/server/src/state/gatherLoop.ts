import { deposit, gather, move } from "../api";
import { coords, ActionResultData, GatherContext, GatherParams } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { serverState } from "..";

export const getGatherContext = (params: GatherParams): GatherContext => {
  const gatherSquare = serverState.encyclopedia.squares.find((x) => x.content?.code === params.squareCode);
  if (!gatherSquare) {
    throw new Error("invalid param - square not found");
  }
  return { gatherSquare };
};

export const gatherLoop = (res: ActionResultData | null, ctx: GatherContext): QueueItem<GatherContext>[] => {
  if (!res || !res.character.inventory) return [];

  const totalQuantity = res.character.inventory.reduce((a, b) => a + b.quantity, 0);

  // if invy full, bank
  if (totalQuantity === res.character.inventory_max_items) {
    const depositAllPipeline: QueueItem[] = res.character.inventory
      .filter((x) => x.quantity > 0)
      .map(({ code, quantity }) => ({
        action: deposit,
        payload: { code, quantity },
      }));

    return [
      { action: move, payload: coords["Bank"] },
      ...depositAllPipeline,
      { action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop },
    ];
  } else if (res.character.x !== ctx.gatherSquare.x || res.character.y !== ctx.gatherSquare.y) {
    return [{ action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop }];
  } else {
    return [{ action: gather, onExecuted: gatherLoop }];
  }
};
