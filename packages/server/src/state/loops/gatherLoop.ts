import { gather, move } from "../../api";
import { ActionResultData, GatherContext, GatherParams } from "@artifacts/shared";
import { QueueItem } from "../queue";
import { serverState } from "../..";
import { depositAll, getClosest, getInventoryNumItems } from "./loopUtil";

export const getGatherContext = (params: GatherParams): GatherContext => {
  // should do a getClosest to a bank, not to current character
  // maybe also store bank location in context instead of recalculating?
  const gatherSquare = serverState.encyclopedia.squares.find((x) => x.content?.code === params.squareCode);
  if (!gatherSquare) {
    throw new Error("Square not found: " + params.squareCode);
  }
  return { gatherSquare };
};

export const gatherLoop = ({ character }: ActionResultData, ctx: GatherContext): QueueItem<GatherContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: move, payload: getClosest("bank", character) },
      ...depositAll(character),
      { action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop },
    ];
  } else if (character.x !== ctx.gatherSquare.x || character.y !== ctx.gatherSquare.y) {
    return [{ action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop }];
  } else {
    return [{ action: gather, onExecuted: gatherLoop }];
  }
};
