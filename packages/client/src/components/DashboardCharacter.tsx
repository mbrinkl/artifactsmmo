import { useState } from "react";
import { Activity, ActivityName, ActivityParams, CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { Button, Paper, Text } from "@mantine/core";
import styles from "./DashboardCharacter.module.css";
import { ActivitySelector } from "./ActivitySelector";

interface DashboardCharacterProps {
  character: CharacterInfo;
  encyclopedia: Encyclopedia;
  update: (info: CharacterInfo) => void;
}

export const DashboardCharacter = ({ character, update, encyclopedia }: DashboardCharacterProps) => {
  const [selectedActivityName, setSelectedActivityName] = useState<ActivityName | null>(null);
  const [selectedActivityParams, setSelectedActivityParams] = useState<ActivityParams | null>(null);

  const updateActivity = () => {
    if (!selectedActivityName || !selectedActivityParams) return;
    // todo, check context values are set
    update({
      characterName: character.characterName,
      activity: { name: selectedActivityName, params: selectedActivityParams } as Activity,
    });
  };

  const clearActivity = () => {
    update({
      characterName: character.characterName,
      activity: null,
    });
  };

  const isActive = character.activity !== null;

  return (
    <Paper className={`${styles.container} ${isActive ? styles.active : styles.inactive}`}>
      <Text size="lg">{character.characterName}</Text>
      {character.activity ? (
        <Text size="md">
          {character.activity.name} {JSON.stringify(character.activity.params)}
        </Text>
      ) : (
        <Text size="md">None</Text>
      )}
      {character.error && <Text>Error: {character.error}</Text>}
      <ActivitySelector
        selectedActivityName={selectedActivityName}
        selectedActivityParams={selectedActivityParams}
        setSelectedActivityName={setSelectedActivityName}
        setSelectedActivityParams={setSelectedActivityParams}
        encyclopedia={encyclopedia}
      />
      <Button onClick={updateActivity}>Update</Button>
      {isActive && <Button onClick={clearActivity}>Stop</Button>}
    </Paper>
  );
};
