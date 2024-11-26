import { Item, Monster, Resource, Square } from "@artifacts/shared";
import { client } from "./client";

export const getCharacters = async () => {
  const { data, error } = await client.GET("/my/characters");
  const characters = handle(data?.data, error);
  if (characters.length === 0) {
    throw new Error("No characters found");
  }
  return characters;
};

export const getCharacter = async (name: string) => {
  const { data, error } = await client.GET("/characters/{name}", { params: { path: { name } } });
  return handle(data?.data, error);
};

export const getMaps = async (page: number = 1, accumulated: Square[] = []): Promise<Square[]> => {
  const { data, error } = await client.GET("/maps", { params: { query: { page, size: 100 } } });
  const result = handle(data?.data, error);
  if (page === Number(data!.pages)) {
    return [...accumulated, ...result];
  }
  return await getMaps(page + 1, [...accumulated, ...result]);
};

export const getItems = async (page: number = 1, accumulated: Item[] = []): Promise<Item[]> => {
  const { data, error } = await client.GET("/items", { params: { query: { page, size: 100 } } });
  const result = handle(data?.data, error);
  if (page === Number(data!.pages)) {
    return [...accumulated, ...result];
  }
  return await getItems(page + 1, [...accumulated, ...result]);
};

export const getResources = async (page: number = 1, accumulated: Resource[] = []): Promise<Resource[]> => {
  const { data, error } = await client.GET("/resources", { params: { query: { page, size: 100 } } });
  const result = handle(data?.data, error);
  if (page === Number(data!.pages)) {
    return [...accumulated, ...result];
  }
  return await getResources(page + 1, [...accumulated, ...result]);
};

export const getMonsters = async (page: number = 1, accumulated: Monster[] = []): Promise<Monster[]> => {
  const { data, error } = await client.GET("/monsters", { params: { query: { page, size: 100 } } });
  const result = handle(data?.data, error);
  if (page === Number(data!.pages)) {
    return [...accumulated, ...result];
  }
  return await getMonsters(page + 1, [...accumulated, ...result]);
};

interface Err {
  error: {
    code: number;
    message: string;
  };
}

const handle = <T>(data: T | undefined, error: Err | undefined): T => {
  if (error) {
    throw new Error(`${error.error.code} ${error.error.message}`);
  }
  if (!data) {
    throw new Error("Unexpected data and error missing");
  }

  return data;
};
