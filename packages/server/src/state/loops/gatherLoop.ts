import { deposit, gather, move } from "../../api";
import { coords, ActionResultData, GatherContext, GatherParams, Character, Inventory } from "@artifacts/shared";
import { QueueItem } from "../queue";
import { serverState } from "../..";

export const getGatherContext = (params: GatherParams): GatherContext => {
  const gatherSquare = serverState.encyclopedia.squares.find((x) => x.content?.code === params.squareCode);
  if (!gatherSquare) {
    throw new Error("invalid param - square not found");
  }
  return { gatherSquare };
};

const getInventoryNumItems = (inventory: Inventory): number => {
  return inventory.reduce((a, b) => a + b.quantity, 0);
};

// const getClosest = () => {};

const depositAll = (character: Character): QueueItem[] => {
  if (!character.inventory) return [];

  return character.inventory
    .filter((x) => x.quantity > 0)
    .map(({ code, quantity }) => ({
      action: deposit,
      payload: { code, quantity },
    }));
};

export const gatherLoop = ({ character }: ActionResultData, ctx: GatherContext): QueueItem<GatherContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character.inventory);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: move, payload: coords["Bank"] },
      ...depositAll(character),
      { action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop },
    ];
  } else if (character.x !== ctx.gatherSquare.x || character.y !== ctx.gatherSquare.y) {
    return [{ action: move, payload: ctx.gatherSquare, onExecuted: gatherLoop }];
  } else {
    return [{ action: gather, onExecuted: gatherLoop }];
  }
};
