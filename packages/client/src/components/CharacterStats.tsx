import { CharacterInfoResponse } from "@artifacts/shared";
import { Flex, Grid, Image, Text } from "@mantine/core";

interface CharacterStatsProps {
  character: CharacterInfoResponse[0];
}

interface Data {
  value: string;
  imgSrc?: string;
}

const getData = (c: CharacterInfoResponse[0]): Data[] => {
  return [
    {
      value: `Level: ${c.level} (${c.xp} / ${c.max_xp})`,
    },
    {
      value: `Alchemy: Lv${c.alchemy_level} (${c.alchemy_xp} / ${c.alchemy_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/alchemy.png",
    },
    {
      value: `Cooking: Lv${c.cooking_level} (${c.cooking_xp} / ${c.cooking_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/cooked_chicken.png",
    },
    {
      value: `Fishing: Lv${c.fishing_level} (${c.fishing_xp} / ${c.fishing_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/fishing.png",
    },
    {
      value: `Gearcrafting: Lv${c.gearcrafting_level} (${c.gearcrafting_xp} / ${c.gearcrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/iron_armor.png",
    },
    {
      value: `Jewelrycrafting: Lv${c.jewelrycrafting_level} (${c.jewelrycrafting_xp} / ${c.jewelrycrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/ruby_ring.png",
    },
    {
      value: `Mining: Lv${c.mining_level} (${c.mining_xp} / ${c.mining_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/mining.png",
    },
    {
      value: `Weaponcrafting: Lv${c.weaponcrafting_level} (${c.weaponcrafting_xp} / ${c.weaponcrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/iron_sword.png",
    },
    {
      value: `Woodcutting: Lv${c.woodcutting_level} (${c.woodcutting_xp} / ${c.woodcutting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/woodcutting.png",
    },
  ];
};

export const CharacterStats = ({ character }: CharacterStatsProps) => {
  return (
    <Grid p="sm" justify="center">
      {getData(character).map((x, index) => (
        <Grid.Col key={index} span={{ xs: 6, sm: 4 }}>
          <Flex align="center" justify="center">
            {x.imgSrc && <Image h={25} w="auto" fit="contain" src={x.imgSrc} />}
            <Text>{x.value}</Text>
          </Flex>
        </Grid.Col>
      ))}
    </Grid>
  );
};
