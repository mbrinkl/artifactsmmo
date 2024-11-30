import { Button, Container, Flex, Group, Loader, Stack, Text } from "@mantine/core";
import { CharacterInfo } from "@artifacts/shared";
import {
  useClearAllMutation,
  useGetDashboardDataQuery,
  useGetEncyclopediaQuery,
  useUpdateActivityMutation,
} from "../api";
import { DashboardCharacter } from "./DashboardCharacter";

interface DashboardProps {
  token: string;
  clearToken: () => void;
}

export const Dashboard = (props: DashboardProps) => {
  const characterQuery = useGetDashboardDataQuery(props.token);
  const encyclopediaQuery = useGetEncyclopediaQuery(props.token);
  const updateActivityMutation = useUpdateActivityMutation();
  const clearAllMutation = useClearAllMutation();

  const update = (characterInfo: CharacterInfo) => {
    updateActivityMutation.mutate({ token: props.token, characterInfo });
  };

  const clearAll = () => {
    clearAllMutation.mutate({ token: props.token });
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
    return <Text>No characters in response</Text>;
  }

  return (
    <Container py="md">
      <Stack>
        <Flex justify="space-between">
          <Group gap="md">
            <Button onClick={clearAll} color="red">
              Stop All
            </Button>
            <Button color="green">Start All Default</Button>
          </Group>
          <Button onClick={props.clearToken} color="yellow">
            Logout
          </Button>
        </Flex>
        {characterQuery.data.map((character) => (
          <DashboardCharacter
            key={character.characterName}
            character={character}
            encyclopedia={encyclopediaQuery.data}
            update={update}
          />
        ))}
      </Stack>
    </Container>
  );
};
