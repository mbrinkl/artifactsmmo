import { client } from "..";

export const getCharacters = async () => {
  const { data } = await client.GET("/my/characters");
  return data?.data;
};
