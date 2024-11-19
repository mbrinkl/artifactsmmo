import { useState } from "react";
import { ActivityName, CharacterInfo, possibileActivityNames, possibleContextsMap } from "@artifacts/shared";
import { Button, Select, Text } from "@mantine/core";

interface DashboardCharacterProps {
  x: CharacterInfo;
  update: (info: CharacterInfo) => void;
}

export const DashboardCharacter = ({ x, update }: DashboardCharacterProps) => {
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
      characterName: x.characterName,
      activity: { name: selectedActivity, context: selectedContext as any },
    });
  };

  const clearActivity = () => {
    update({
      characterName: x.characterName,
      activity: null,
    });
  };

  const isActive = x.activity !== null;

  return (
    <div
      style={{
        width: "100%",
        border: isActive ? "3px solid green" : "3px solid red",
        marginBottom: "5px",
        marginTop: "5px",
      }}
    >
      <Text size="lg">{x.characterName}</Text>
      <Text size="md">{x.activity ? x.activity.name + JSON.stringify(x.activity.context) : "None"}</Text>
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
                value={(selectedContext as any)[key]}
                onChange={(v) => onChangeContext(key, v)}
              />
            );
          })}
        </div>
      )}
      <Button onClick={updateActivity}>Update</Button>
      {isActive && <Button onClick={clearActivity}>Stop</Button>}
    </div>
  );
};
