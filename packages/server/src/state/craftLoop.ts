import { craft, deposit, move, withdraw } from "../api";
import { coords, ActionResultData, CraftContext } from "@artifacts/shared";
import { QueueItem } from "../state/queue";

export const craftLoop = (res: ActionResultData | null, context: CraftContext): QueueItem<CraftContext>[] => {
  if (!res || !res.character.inventory) return [];

  // need to infer...
  // crafting destination
  // num items to craft
  const loc = { x: 1, y: 5 };
  const num = 8;

  const max = res.character.inventory_max_items;
  const total = res.character.inventory.reduce((a, b) => a + b.quantity, 0);
  const space = max - total;

  // if sufficient materials in inv to craft product, craft
  const sourceItemInInv = res.character.inventory.find((x) => x.code === context.sourceItem);

  if (!sourceItemInInv || sourceItemInInv.quantity < num) {
    const depositNonSourceItems: QueueItem[] = res.character.inventory
      .filter((x) => x.quantity > 0 && x.code !== context.sourceItem)
      .map(({ code, quantity }) => ({
        action: deposit,
        payload: { code, quantity },
      }));

    return [
      { action: move, payload: coords["Bank"] } satisfies QueueItem<typeof move>,
      ...depositNonSourceItems,

      // TODO: only withdraws the amount of space before deposit
      { action: withdraw, payload: { code: context.sourceItem, quantity: space }, onExecuted: craftLoop },
    ];
  }

  if (res.character.x !== loc.x || res.character.y !== loc.y) {
    return [{ action: move, payload: loc, onExecuted: craftLoop }];
  }

  const craftQuantity = Math.floor(sourceItemInInv.quantity / num);

  return [{ action: craft, payload: { code: context.productItem, quantity: craftQuantity }, onExecuted: craftLoop }];
};
