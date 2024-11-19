import { client } from "..";
import { ActionResultData, Destination, Drop } from "@artifacts/shared";

export const move = async (name: string, destintation: Destination) => {
  const { data, error } = await client.POST("/my/{name}/action/move", {
    params: { path: { name } },
    body: destintation,
  });

  return handle(data?.data, error, [490]);
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

export const craft = async (name: string, item: Drop) => {
  const { data, error } = await client.POST("/my/{name}/action/crafting", {
    params: { path: { name } },
    body: item,
  });
  return handle(data?.data, error);
};

export const withdraw = async (name: string, item: Drop) => {
  const { data, error } = await client.POST("/my/{name}/action/bank/withdraw", {
    params: { path: { name } },
    body: item,
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

const handle = <TData extends ActionResultData>(
  data: TData | undefined,
  error: Err | undefined,
  ignoreCodes?: number[],
): TData | null => {
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
