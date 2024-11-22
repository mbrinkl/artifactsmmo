import { fight, move, rest } from "../api";
import { ActionResultData, Encyclopedia, FightContext, FightParams } from "@artifacts/shared";
import { QueueItem } from "../services/queue";
import { depositAll, getClosest, getInventoryNumItems } from "./loopUtil";

export const getFightContext = (encyclopedia: Encyclopedia, params: FightParams): FightContext => {
  const monsterSquare = encyclopedia.squares.find((x) => x.content?.code === params.monsterCode);
  if (!monsterSquare) {
    throw new Error("Square not found: " + params.monsterCode);
  }
  return { encyclopedia, monsterSquare };
};

export const fightQueueBuilder = ({ character }: ActionResultData, ctx: FightContext): QueueItem<FightContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: move, payload: getClosest("bank", character, ctx.encyclopedia) },
      ...depositAll(character),
      { action: move, payload: ctx.monsterSquare, onExecuted: fightQueueBuilder },
    ];
  } else if (character.x !== ctx.monsterSquare.x || character.y !== ctx.monsterSquare.y) {
    return [{ action: move, payload: ctx.monsterSquare, onExecuted: fightQueueBuilder }];
  } else if (character.hp < character.max_hp) {
    // TODO: better calculation for resting
    return [{ action: rest, onExecuted: fightQueueBuilder }];
  } else {
    return [{ action: fight, onExecuted: fightQueueBuilder }];
  }
};
