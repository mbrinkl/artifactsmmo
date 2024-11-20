import { Loader, Stack, Text } from "@mantine/core";
import { CharacterInfo } from "@artifacts/shared";
import { useGetDashboardDataQuery, useUpdateActivityMutation } from "../api";
import { DashboardCharacter } from "./DashboardCharacter";

interface DashboardProps {
  token: string;
}

export const Dashboard = (props: DashboardProps) => {
  const { data, error } = useGetDashboardDataQuery(props.token);
  const mutation = useUpdateActivityMutation();

  const update = (characterInfo: CharacterInfo) => {
    mutation.mutate({ token: props.token, characterInfo });
  };

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!data) {
    return <Loader />;
  }

  if (data.length === 0) {
    return <Text>No characters in response</Text>;
  }

  return (
    <Stack>
      {data.map((character) => (
        <DashboardCharacter key={character.characterName} character={character} update={update} />
      ))}
    </Stack>
  );
};
