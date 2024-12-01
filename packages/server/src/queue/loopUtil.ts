import { Character, Destination, Encyclopedia, Square } from "@artifacts/shared";
import { QueueItem } from "./queue";

export const getInventoryNumItems = ({ inventory }: Character): number => {
  return inventory.reduce((a, b) => a + b.quantity, 0);
};

export const getClosestPair = (
  squareCodeFrom: string,
  squareCodeTo: string,
  encyclopedia: Encyclopedia,
): [Square, Square] | null => {
  const squaresFrom = encyclopedia.squares.filter((x) => x.content?.code === squareCodeFrom);
  const squaresTo = encyclopedia.squares.filter((x) => x.content?.code === squareCodeTo);

  if (squaresFrom.length === 0 || squaresTo.length === 0) {
    throw new Error("Invalid code: " + squareCodeFrom + ", " + squareCodeTo);
  }

  let minDistance = Infinity;
  let closestPair: [Square, Square];

  // Compare each point in points1 with each point in points2
  for (const p1 of squaresFrom) {
    for (const p2 of squaresTo) {
      const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPair = [p1, p2];
      }
    }
  }

  return closestPair;

  // return squares.reduce((closest, current) => {
  //   const distanceToClosest = Math.sqrt(Math.pow(x - closest.x, 2) + Math.pow(y - closest.y, 2));
  //   const distanceToCurrent = Math.sqrt(Math.pow(x - current.x, 2) + Math.pow(y - current.y, 2));
  //   return distanceToCurrent < distanceToClosest ? current : closest;
  // });
};

export const getClosestToCharacter = (
  squareCode: string,
  { x, y }: Character,
  encyclopedia: Encyclopedia,
): Destination => {
  const squares = encyclopedia.squares.filter((x) => x.content?.code === squareCode);

  if (squares.length === 0) {
    throw new Error("Invalid code: " + squareCode);
  }

  return squares.reduce((closest, current) => {
    const distanceToClosest = Math.sqrt(Math.pow(x - closest.x, 2) + Math.pow(y - closest.y, 2));
    const distanceToCurrent = Math.sqrt(Math.pow(x - current.x, 2) + Math.pow(y - current.y, 2));
    return distanceToCurrent < distanceToClosest ? current : closest;
  });
};

export const depositAll = ({ inventory }: Character): QueueItem[] => {
  return inventory
    .filter((x) => x.quantity > 0)
    .map(({ code, quantity }) => ({
      action: { type: "deposit", payload: { code, quantity } },
    }));
};
