import { client } from "..";
import { ActionResultData, Destination, Drop } from "../types";

export const move = async (name: string, destintation: Destination) => {
  const { data, error } = await client.POST("/my/{name}/action/move", {
    params: { path: { name } },
    body: destintation,
  });

  return handle(data?.data, error, [490]); // ignore if already at destination
};

export const fight = async (name: string) => {
  const { data, error } = await client.POST("/my/{name}/action/fight", {
    params: { path: { name } },
  });
  return handle(data?.data, error);
};

export const gather = async (name: string) => {
  const { data, error } = await client.POST("/my/{name}/action/gathering", {
    params: { path: { name } },
  });
  return handle(data?.data, error);
};

export const deposit = async (name: string, item: Drop) => {
  const { data, error } = await client.POST("/my/{name}/action/bank/deposit", {
    params: { path: { name } },
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

const handle = <T extends ActionResultData>(
  data: T | undefined,
  error: Err | undefined,
  ignoreCodes?: number[]
): T | null => {
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
