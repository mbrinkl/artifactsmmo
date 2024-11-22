import { fight, move, rest } from "../../api";
import { ActionResultData, FightContext, FightParams } from "@artifacts/shared";
import { QueueItem } from "../queue";
import { serverState } from "../..";
import { depositAll, getClosest, getInventoryNumItems } from "./loopUtil";

export const getFightContext = (params: FightParams): FightContext => {
  const monsterSquare = serverState.encyclopedia.squares.find((x) => x.content?.code === params.monsterCode);
  if (!monsterSquare) {
    throw new Error("Square not found: " + params.monsterCode);
  }
  return { monsterSquare };
};

export const fightLoop = ({ character }: ActionResultData, ctx: FightContext): QueueItem<FightContext>[] => {
  const inventoryNumItems = getInventoryNumItems(character);

  if (inventoryNumItems === character.inventory_max_items) {
    return [
      { action: move, payload: getClosest("bank", character) },
      ...depositAll(character),
      { action: move, payload: ctx.monsterSquare, onExecuted: fightLoop },
    ];
  } else if (character.x !== ctx.monsterSquare.x || character.y !== ctx.monsterSquare.y) {
    return [{ action: move, payload: ctx.monsterSquare, onExecuted: fightLoop }];
  } else if (character.hp < character.max_hp) {
    // TODO: better calculation for resting
    return [{ action: rest, onExecuted: fightLoop }];
  } else {
    return [{ action: fight, onExecuted: fightLoop }];
  }
};
