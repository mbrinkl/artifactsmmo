import { craft, deposit, move, withdraw } from "../../api";
import { ActionResultData, coords, CraftContext, CraftParams } from "@artifacts/shared";
import { QueueItem } from "../queue";
import { serverState } from "../..";

export const getCraftContext = (params: CraftParams): CraftContext => {
  const productItem = serverState.encyclopedia.items.find((x) => x.code === params.productCode);
  if (!productItem) {
    throw new Error("Invalid product code.");
  }
  const sourceItems = productItem.craft?.items;
  if (!sourceItems || sourceItems.length === 0) {
    throw new Error("Item is not craftable.");
  }
  const craftSquare = serverState.encyclopedia.squares.find(
    (x) => x.content?.type === "workshop" && x.content.code === productItem.craft?.skill,
  );
  if (!craftSquare) {
    throw new Error("Craft square not found.");
  }

  return {
    productItem,
    sourceItems,
    craftSquare,
  };
};

export const craftLoop = (res: ActionResultData | null, ctx: CraftContext): QueueItem<CraftContext>[] => {
  if (!res || !res.character.inventory) return [];

  const max = res.character.inventory_max_items;
  const total = res.character.inventory.reduce((a, b) => a + b.quantity, 0);
  const space = max - total;

  // if sufficient materials in inv to craft product, craft
  // TODO: just assuming single source items for now
  const sourceItemInInv = res.character.inventory.find((x) => x.code === ctx.sourceItems[0].code);

  if (!sourceItemInInv || sourceItemInInv.quantity < ctx.sourceItems[0].quantity) {
    const depositNonSourceItems: QueueItem[] = res.character.inventory
      .filter((x) => x.quantity > 0 && x.code !== ctx.sourceItems[0].code)
      .map(({ code, quantity }) => ({
        action: deposit,
        payload: { code, quantity },
      }));

    return [
      { action: move, payload: coords["Bank"] } satisfies QueueItem<typeof move>,
      ...depositNonSourceItems,

      // TODO: only withdraws the amount of space before deposit
      { action: withdraw, payload: { code: ctx.sourceItems[0].code, quantity: space }, onExecuted: craftLoop },
    ];
  }

  if (res.character.x !== ctx.craftSquare.x || res.character.y !== ctx.craftSquare.y) {
    return [{ action: move, payload: ctx.craftSquare, onExecuted: craftLoop }];
  }

  const craftQuantity = Math.floor(sourceItemInInv.quantity / ctx.sourceItems[0].quantity);

  return [{ action: craft, payload: { code: ctx.productItem.code, quantity: craftQuantity }, onExecuted: craftLoop }];
};
