import { CharacterInfoResponse } from "@artifacts/shared";
import { Flex, Image, Text } from "@mantine/core";

interface CharacterStatsProps {
  character: CharacterInfoResponse[0];
}

export const CharacterStats = ({ character: c }: CharacterStatsProps) => {
  return (
    <Flex justify="center" gap="md" wrap="wrap">
      <Text>
        Level: {c.level} ({c.xp} / {c.max_xp})
      </Text>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/effects/alchemy.png" />
        <Text>
          Alchemy: Lv{c.alchemy_level} ({c.alchemy_xp} / {c.alchemy_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/items/cooked_chicken.png" />
        <Text>
          Cooking: Lv{c.cooking_level} ({c.cooking_xp} / {c.cooking_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/effects/fishing.png" />
        <Text>
          Fishing: Lv{c.fishing_level} ({c.fishing_xp} / {c.fishing_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/items/iron_armor.png" />
        <Text>
          Gearcrafting: Lv{c.gearcrafting_level} ({c.gearcrafting_xp} / {c.gearcrafting_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/items/ruby_ring.png" />
        <Text>
          Jewelrycrafting: Lv{c.jewelrycrafting_level} ({c.jewelrycrafting_xp} / {c.jewelrycrafting_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/effects/mining.png" />
        <Text>
          Mining: Lv{c.mining_level} ({c.mining_xp} / {c.mining_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/items/iron_sword.png" />
        <Text>
          Weaponcrafting: Lv{c.weaponcrafting_level} ({c.weaponcrafting_xp} / {c.weaponcrafting_max_xp})
        </Text>
      </Flex>
      <Flex align="center">
        <Image h={25} w="auto" fit="contain" src="https://artifactsmmo.com/images/effects/woodcutting.png" />
        <Text>
          Woodcutting: Lv{c.woodcutting_level} ({c.woodcutting_xp} / {c.woodcutting_max_xp})
        </Text>
      </Flex>
    </Flex>
  );
};
