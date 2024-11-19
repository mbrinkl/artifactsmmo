import { Stack } from "@mantine/core";
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
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return <div>No characters in response</div>;
  }

  return (
    <Stack>
      {data.map((x) => (
        <DashboardCharacter key={x.characterName} x={x} update={update} />
      ))}
    </Stack>
  );
};
