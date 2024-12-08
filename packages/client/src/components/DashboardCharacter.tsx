import { useState } from "react";
import {
  Activity,
  ActivityName,
  ActivityParams,
  CharacterInfo,
  CharacterInfoResponse,
  Encyclopedia,
} from "@artifacts/shared";
import { Button, Divider, Flex, Group, Image, Paper, Text } from "@mantine/core";
import { ActivitySelector } from "./ActivitySelector";
import { CharacterStats } from "./CharacterStats";
import { useUpdateActivityMutation, useUpdateDefaultActivityMutation } from "../api";
import styles from "./DashboardCharacter.module.css";
import { getFormattedActivity } from "../util";

interface DashboardCharacterProps {
  character: CharacterInfoResponse[0];
  encyclopedia: Encyclopedia;
}

export const DashboardCharacter = ({ character, encyclopedia }: DashboardCharacterProps) => {
  const [selectedActivityName, setSelectedActivityName] = useState<ActivityName | null>(null);
  const [selectedActivityParams, setSelectedActivityParams] = useState<ActivityParams | null>(null);
  const [showStats, setShowStats] = useState(false);

  const updateActivityMutation = useUpdateActivityMutation();
  const updateDefaultActivityMutation = useUpdateDefaultActivityMutation();

  const updateActivity = () => {
    if (!selectedActivityName || !selectedActivityParams) return;
    // todo, check context values are set

    const characterInfo: CharacterInfo = {
      characterName: character.characterName,
      activity: { name: selectedActivityName, params: selectedActivityParams } as Activity,
    };
    updateActivityMutation.mutate({ characterInfo });
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
    const characterInfo: CharacterInfo = {
      characterName: character.characterName,
      activity: null,
    };
    updateActivityMutation.mutate({ characterInfo });
  };

  const isActive = character.activity !== null;

  return (
    <Paper p="sm" className={`${styles.container} ${isActive ? styles.active : styles.inactive}`}>
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
        <Button size="xs" variant="subtle" onClick={() => setShowStats((prev) => !prev)}>
          Stats
        </Button>
      </Flex>

      {showStats && <CharacterStats character={character} />}

      <Divider my="md" />

      <Flex align="center" direction="column" gap="sm">
        <Text>Default Activity: {getFormattedActivity(character.defaultActivity ?? null)}</Text>
        {character.error && <Text>Error: {character.error}</Text>}
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

      <Divider my="md" />

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
