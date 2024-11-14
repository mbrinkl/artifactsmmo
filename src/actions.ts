import { client } from ".";
import { CHARACTER_NAME } from "./config";
import { Destination, Drop } from "./types";

export const move = async (destintation: Destination) => {
  const { data, error } = await client.POST("/my/{name}/action/move", {
    params: { path: { name: CHARACTER_NAME } },
    body: destintation,
  });

  return handle(data?.data, error, [490]); // ignore if already at destination
};

export const fight = async () => {
  const { data, error } = await client.POST("/my/{name}/action/fight", {
    params: { path: { name: CHARACTER_NAME } },
  });
  return handle(data?.data, error);
};

export const gather = async () => {
  const { data, error } = await client.POST("/my/{name}/action/gathering", {
    params: { path: { name: CHARACTER_NAME } },
  });
  return handle(data?.data, error);
};

export const deposit = async (item: Drop) => {
  const { data, error } = await client.POST("/my/{name}/action/bank/deposit", {
    params: { path: { name: CHARACTER_NAME } },
    body: item,
  });
  return handle(data?.data, error);
};

interface Err {
  error: {
    code: number;
    message: string;
  };
}

const handle = <T>(data: T | undefined, error: Err | undefined, ignoreCodes?: number[]): T | null => {
  if (error) {
    console.error("error", error.error);
    if (ignoreCodes && ignoreCodes.includes(error.error.code)) {
      return null;
    }
    throw new Error(`error: ${error.error.code} ${error.error.message}`);
  }
  if (!data) {
    throw new Error("Unexpected data and error missing");
  }
  return data;
};
