import { useState } from "react";
import { Activity, ActivityName, CharacterInfo, possibileActivityNames, possibleContextsMap } from "@artifacts/shared";
import { Button, Paper, Select, Text } from "@mantine/core";
import styles from "./DashboardChartacter.module.css";

interface DashboardCharacterProps {
  character: CharacterInfo;
  update: (info: CharacterInfo) => void;
}

export const DashboardCharacter = ({ character, update }: DashboardCharacterProps) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityName | null>(null);
  const [selectedContext, setSelectedContext] = useState<object | null>(null);

  const onChangeActivity = (value: ActivityName | null) => {
    setSelectedActivity(value);

    if (value === null) {
      setSelectedContext(null);
    } else {
      let obj = {};
      {
        Object.entries(possibleContextsMap[value]).map(([key, value]) => {
          obj = { ...obj, [key]: (value as string[])[0] };
        });
      }
      setSelectedContext(obj);
    }
  };

  const onChangeContext = (property: string, value: string | null) => {
    if (value === null) return;
    setSelectedContext((prev) => ({ ...prev, [property]: value }));
  };

  const updateActivity = () => {
    if (!selectedActivity || !selectedContext) return;
    update({
      characterName: character.characterName,
      activity: { name: selectedActivity, context: selectedContext } as Activity,
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
      <Text size="md">
        {character.activity ? character.activity.name + JSON.stringify(character.activity.context) : "None"}
      </Text>
      <Select
        label="Activity"
        data={possibileActivityNames}
        value={selectedActivity}
        onChange={(v) => onChangeActivity(v as ActivityName)}
      />
      {selectedActivity && selectedContext && (
        <div>
          <Text>Activity Context:</Text>
          {Object.entries(possibleContextsMap[selectedActivity]).map(([key, value]) => {
            return (
              <Select
                key={key}
                label={key}
                data={value as string[]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(selectedContext as any)[key]}
                onChange={(v) => onChangeContext(key, v)}
              />
            );
          })}
        </div>
      )}
      <Button onClick={updateActivity}>Update</Button>
      {isActive && <Button onClick={clearActivity}>Stop</Button>}
    </Paper>
  );
};
