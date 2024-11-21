import { deposit, gather, move } from "../api";
import { coords, ActionResultData, GatherContext, Destination } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { serverState } from "..";

export const gatherLoop = (res: ActionResultData | null, context: GatherContext): QueueItem<GatherContext>[] => {
  if (!res || !res.character.inventory) return [];

  // todo,
  // - there can be multiple squares with same resource
  // - shouldn't have to call this every loop
  const square = serverState.cache.squares.find((x) => x.content?.code === context.squareCode);
  if (!square) {
    return [];
  }
  const dest: Destination = { x: square.x, y: square.y };

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
      { action: move, payload: dest, onExecuted: gatherLoop },
    ];
  } else if (res.character.x !== dest.x || res.character.y !== dest.y) {
    return [{ action: move, payload: dest, onExecuted: gatherLoop }];
  } else {
    return [{ action: gather, onExecuted: gatherLoop }];
  }
};
