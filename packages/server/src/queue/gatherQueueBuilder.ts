import { ActionResultData, Encyclopedia, GatherContext, GatherParams } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { depositAll, getClosestPair, getInventoryNumItems } from "./loopUtil";

export const getGatherContext = (encyclopedia: Encyclopedia, params: GatherParams): GatherContext => {
  const [gatherSquare, bankSquare] = getClosestPair(params.squareCode, "bank", encyclopedia);
  return { encyclopedia, gatherSquare, bankSquare };
};

export const gatherQueueBuilder = ({ character }: ActionResultData, ctx: GatherContext): QueueItem<GatherContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: { type: "move", payload: ctx.bankSquare } },
      ...depositAll(character),
      { action: { type: "move", payload: ctx.gatherSquare }, onExecuted: gatherQueueBuilder },
    ];
  } else if (character.x !== ctx.gatherSquare.x || character.y !== ctx.gatherSquare.y) {
    return [{ action: { type: "move", payload: ctx.gatherSquare }, onExecuted: gatherQueueBuilder }];
  } else {
    return [{ action: { type: "gather" }, onExecuted: gatherQueueBuilder }];
  }
};
