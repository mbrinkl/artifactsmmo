import { ActionResultData, Encyclopedia, FightContext, FightParams } from "@artifacts/shared";
import { QueueItem } from "./queue";
import { depositAll, getClosestPair, getInventoryNumItems } from "./loopUtil";

export const getFightContext = (encyclopedia: Encyclopedia, params: FightParams): FightContext => {
  const [monsterSquare, bankSquare] = getClosestPair(params.monsterCode, "bank", encyclopedia);
  return { encyclopedia, monsterSquare, bankSquare };
};

export const fightQueueBuilder = ({ character }: ActionResultData, ctx: FightContext): QueueItem<FightContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: { type: "move", payload: ctx.bankSquare } },
      ...depositAll(character),
      { action: { type: "move", payload: ctx.monsterSquare }, onExecuted: fightQueueBuilder },
    ];
  } else if (character.x !== ctx.monsterSquare.x || character.y !== ctx.monsterSquare.y) {
    return [{ action: { type: "move", payload: ctx.monsterSquare }, onExecuted: fightQueueBuilder }];
  } else if (character.hp < character.max_hp) {
    // TODO: better calculation for resting
    return [{ action: { type: "rest" }, onExecuted: fightQueueBuilder }];
  } else {
    return [{ action: { type: "fight" }, onExecuted: fightQueueBuilder }];
  }
};
