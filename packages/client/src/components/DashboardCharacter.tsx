import { useState } from "react";
import {
  Activity,
  ActivityName,
  CharacterInfo,
  Item,
  possibileActivityNames,
  Resource,
  Square,
} from "@artifacts/shared";
import { Button, Paper, Select, Text } from "@mantine/core";
import styles from "./DashboardChartacter.module.css";

interface DashboardCharacterProps {
  character: CharacterInfo;
  initial: { squares: Square[]; items: Item[]; resources: Resource[] };
  update: (info: CharacterInfo) => void;
}

const getit = (activityName: ActivityName, items: Item[], resources: Resource[]) => {
  console.log("getting", resources.length);
  switch (activityName) {
    case "craft":
      return items
        .filter((x) => !!x.craft)
        .map((x) => x.code)
        .sort() as string[];
    case "gather":
      return resources.map((x) => x.code).sort();
  }
};

export const DashboardCharacter = ({ character, update, initial }: DashboardCharacterProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const onChangeActivityName = (value: ActivityName | null) => {
    if (value === null) {
      setSelectedActivity(null);
    } else {
      if (value === "gather") {
        setSelectedActivity({ name: value, params: { squareCode: "" } });
      } else if (value === "craft") {
        setSelectedActivity({ name: value, params: { productCode: "" } });
      }
    }
  };

  const onChangeContext = (property: string, value: string | null) => {
    setSelectedActivity((prev) => {
      if (!prev) return null;
      return { ...prev, params: { ...prev.params, [property]: value } } as Activity;
    });
  };

  const updateActivity = () => {
    if (!selectedActivity) return;
    // todo, check context values are set
    update({
      characterName: character.characterName,
      activity: selectedActivity,
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
        {character.activity ? character.activity.name + JSON.stringify(character.activity.params) : "None"}
      </Text>
      <Select
        label="Activity"
        data={possibileActivityNames}
        value={selectedActivity?.name}
        onChange={(v) => onChangeActivityName(v as ActivityName)}
      />
      {selectedActivity && (
        <div>
          <Text>Activity Context:</Text>
          {Object.entries(selectedActivity.params).map(([key, value]) => {
            return (
              <Select
                key={key}
                label={key}
                data={getit(selectedActivity.name, initial.items, initial.resources)} // todo: usememo
                value={value}
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
