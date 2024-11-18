import { deposit, gather, getCharacter, move } from "../api";
import { coords, GatherLocation, ActionResultData } from "@artifacts/shared";
import { delay, QueueItem, runQueue } from "../queue";
import { CharacterContext } from "../types";

export interface GatherContext {
  location: GatherLocation;
}

const onExecuted = (res: ActionResultData | null, context: GatherContext): QueueItem[] => {
  if (!res || !res.character.inventory) return [];

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
      { action: move, payload: coords[context.location], onExecuted },
    ];
  }

  // else keep mining it up
  else {
    return [{ action: gather, onExecuted }];
  }
};

export const gatherAndBankScenario = async (ctx: CharacterContext) => {
  const initialCharacterState = await getCharacter(ctx.characterName);
  if (initialCharacterState.cooldown) {
    console.log(ctx.characterName, "Awaiting existing cooldown:", initialCharacterState.cooldown);
    await delay(initialCharacterState.cooldown * 1000);
  }
  ctx.queue = onExecuted({ character: initialCharacterState }, ctx.activity?.context as GatherContext);
  await runQueue(ctx);
};
