import { client } from "..";

export const getCharacters = async () => {
  const { data } = await client.GET("/my/characters");
  return data?.data;
};

export const getCharacter = async (name: string) => {
  const { data } = await client.GET("/characters/{name}", { params: { path: { name } } });
  if (!data) {
    throw new Error("Couldn't fetch character " + name);
  }
  return data.data;
};
