import { Button, Container, Loader, Stack, Text } from "@mantine/core";
import { CharacterInfo } from "@artifacts/shared";
import { useGetDashboardDataQuery, useGetEncyclopediaQuery, useUpdateActivityMutation } from "../api";
import { DashboardCharacter } from "./DashboardCharacter";

interface DashboardProps {
  token: string;
  clearToken: () => void;
}

export const Dashboard = (props: DashboardProps) => {
  const characterQuery = useGetDashboardDataQuery(props.token);
  const encyclopediaQuery = useGetEncyclopediaQuery(props.token);
  const updateActivityMutation = useUpdateActivityMutation();

  const update = (characterInfo: CharacterInfo) => {
    updateActivityMutation.mutate({ token: props.token, characterInfo });
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
    <Container>
      <Stack>
        <Stack>
          <Button onClick={props.clearToken}>Clear Token</Button>
          <Button onClick={props.clearToken}>Stop All</Button>
        </Stack>
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
