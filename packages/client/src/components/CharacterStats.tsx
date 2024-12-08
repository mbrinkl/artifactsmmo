import { CharacterInfoResponse } from "@artifacts/shared";
import { Flex, Grid, Image, Text } from "@mantine/core";
import { getStatsData } from "../util";

interface CharacterStatsProps {
  character: CharacterInfoResponse[0];
}

export const CharacterStats = ({ character }: CharacterStatsProps) => {
  return (
    <Grid p="sm" justify="center">
      {getStatsData(character).map((x, index) => (
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
