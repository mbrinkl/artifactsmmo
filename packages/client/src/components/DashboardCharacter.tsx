import { useState } from "react";
import {
  Activity,
  ActivityName,
  ActivityParams,
  CharacterInfo,
  CharacterInfoResponse,
  Encyclopedia,
} from "@artifacts/shared";
import { Button, Flex, Group, Image, Paper, Text } from "@mantine/core";
import { ActivitySelector } from "./ActivitySelector";
import { CharacterStats } from "./CharacterStats";
import { useUpdateDefaultActivityMutation } from "../api";
import styles from "./DashboardCharacter.module.css";

interface DashboardCharacterProps {
  character: CharacterInfoResponse[0];
  encyclopedia: Encyclopedia;
  update: (info: CharacterInfo) => void;
}

export const DashboardCharacter = ({ character, update, encyclopedia }: DashboardCharacterProps) => {
  const [selectedActivityName, setSelectedActivityName] = useState<ActivityName | null>(null);
  const [selectedActivityParams, setSelectedActivityParams] = useState<ActivityParams | null>(null);

  const updateDefaultActivityMutation = useUpdateDefaultActivityMutation();

  const updateActivity = () => {
    if (!selectedActivityName || !selectedActivityParams) return;
    // todo, check context values are set
    update({
      characterName: character.characterName,
      activity: { name: selectedActivityName, params: selectedActivityParams } as Activity,
    });
  };

  const updateDefaultActivity = () => {
    if (!selectedActivityName || !selectedActivityParams) return;
    // todo, check context values are set
    updateDefaultActivityMutation.mutate({
      body: {
        characterName: character.characterName,
        activity: { name: selectedActivityName, params: selectedActivityParams } as Activity,
      },
    });
  };

  const clearActivity = () => {
    update({
      characterName: character.characterName,
      activity: null,
    });
  };

  const isActive = character.activity !== null;

  const getFormattedActivity = (activity: Activity | null): string => {
    if (!activity) {
      return "none";
    }
    const params = Object.values(activity.params).join(", ");
    return `${activity.name} ${params}`;
  };

  return (
    <Paper p="sm" className={`${styles.container} ${isActive ? styles.active : styles.inactive}`}>
      <Flex justify="center" direction="column" style={{ textAlign: "center" }}>
        <Flex justify="center" align="center" gap="sm">
          <Image
            mah={50}
            w="auto"
            fit="contain"
            src={`https://artifactsmmo.com/images/characters/${character.skin}.png`}
          />
          <Text size="xl" fw="bold">
            {character.characterName}
          </Text>
        </Flex>
        <CharacterStats character={character} />
        <Text>Default Activity: {getFormattedActivity(character.defaultActivity ?? null)}</Text>
        {character.error && <Text>Error: {character.error}</Text>}
      </Flex>

      <Flex direction="column" gap="sm" pb="sm">
        <Text size="md">Current Activity: {getFormattedActivity(character.activity)}</Text>
        <Group gap="sm">
          <Button onClick={clearActivity} disabled={!isActive} color="red">
            Stop
          </Button>
          <Button onClick={updateDefaultActivity} disabled={!isActive}>
            Set as Default
          </Button>
        </Group>
      </Flex>

      <ActivitySelector
        selectedActivityName={selectedActivityName}
        selectedActivityParams={selectedActivityParams}
        setSelectedActivityName={setSelectedActivityName}
        setSelectedActivityParams={setSelectedActivityParams}
        onUpdateClick={updateActivity}
        encyclopedia={encyclopedia}
      />
    </Paper>
  );
};
