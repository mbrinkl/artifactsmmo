import { ActionResultData, CraftContext, CraftParams, Encyclopedia } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { depositAll, getClosestToCharacter } from "./loopUtil";

export const getCraftContext = (encyclopedia: Encyclopedia, params: CraftParams): CraftContext => {
  const productItem = encyclopedia.items.find((x) => x.code === params.productCode);
  if (!productItem) {
    throw new Error("Invalid product code.");
  }
  const sourceItems = productItem.craft?.items;
  if (!sourceItems || sourceItems.length === 0) {
    throw new Error("Item is not craftable.");
  }
  const craftSquare = encyclopedia.squares.find(
    (x) => x.content?.type === "workshop" && x.content.code === productItem.craft?.skill,
  );
  if (!craftSquare) {
    throw new Error("Craft square not found.");
  }

  return {
    encyclopedia,
    productItem,
    sourceItems,
    craftSquare,
  };
};

export const craftQueueBuilder = (res: ActionResultData | null, ctx: CraftContext): QueueItem<CraftContext>[] => {
  const max = res.character.inventory_max_items;
  const totalQuantityPerCraft = ctx.sourceItems.reduce((sum, item) => sum + item.quantity, 0);
  const sourceItemsInInv = res.character.inventory.filter((x) => ctx.sourceItems.map((y) => y.code).includes(x.code));
  const craftQuantityPerSourceItem = sourceItemsInInv.map((x) => {
    const sourceItem = ctx.sourceItems.find((y) => y.code === x.code);
    return Math.floor(x.quantity / sourceItem.quantity);
  });
  const craftQuantity = craftQuantityPerSourceItem.length > 0 ? Math.min(...craftQuantityPerSourceItem) : 0;

  if (craftQuantity === 0) {
    const withdrawSourceItems: QueueItem[] = ctx.sourceItems.map((item, index) => {
      const quantity = Math.floor(max / totalQuantityPerCraft) * item.quantity;
      return {
        action: { type: "withdraw", payload: { code: item.code, quantity } },
        onExecuted: index === ctx.sourceItems.length - 1 ? craftQueueBuilder : undefined,
      };
    });

    return [
      { action: { type: "move", payload: getClosestToCharacter("bank", res.character, ctx.encyclopedia) } },
      ...depositAll(res.character),
      ...withdrawSourceItems,
    ];
  }

  if (res.character.x !== ctx.craftSquare.x || res.character.y !== ctx.craftSquare.y) {
    return [{ action: { type: "move", payload: ctx.craftSquare }, onExecuted: craftQueueBuilder }];
  }

  return [
    {
      action: { type: "craft", payload: { code: ctx.productItem.code, quantity: craftQuantity } },
      onExecuted: craftQueueBuilder,
    },
  ];
};
