import { Button, Flex, Loader, Stack, Text } from "@mantine/core";
import {
  useClearAllMutation,
  useGetDashboardDataQuery,
  useGetEncyclopediaQuery,
  useSetAllDefaultMutation,
} from "../api";
import { DashboardCharacter } from "./DashboardCharacter";

export const Dashboard = () => {
  const characterQuery = useGetDashboardDataQuery();
  const encyclopediaQuery = useGetEncyclopediaQuery();
  const clearAllMutation = useClearAllMutation();
  const setAllDefaultMutation = useSetAllDefaultMutation();

  const setAllDefault = () => {
    setAllDefaultMutation.mutate();
  };

  const clearAll = () => {
    clearAllMutation.mutate();
  };

  if (characterQuery.error || encyclopediaQuery.error) {
    return (
      <Text>
        Error: {characterQuery.error?.message} {encyclopediaQuery.error?.message}
      </Text>
    );
  }

  if (!characterQuery.data || !encyclopediaQuery.data) {
    return <Loader />;
  }

  if (characterQuery.data.length === 0) {
    return <Text>No characters found.</Text>;
  }

  return (
    <Stack>
      <Flex gap="md">
        <Button onClick={clearAll} color="red">
          Stop All
        </Button>
        <Button onClick={setAllDefault} color="green">
          Start All Default
        </Button>
      </Flex>
      {characterQuery.data.map((character) => (
        <DashboardCharacter key={character.characterName} character={character} encyclopedia={encyclopediaQuery.data} />
      ))}
    </Stack>
  );
};
