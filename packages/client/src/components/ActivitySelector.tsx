import { ActivityName, activityNames, ActivityParams, Encyclopedia, initialParamsMap } from "@artifacts/shared";
import { Button, Select, Stack } from "@mantine/core";
import { getParamsOptions } from "../util";

interface ActivitySelectorProps {
  encyclopedia: Encyclopedia;
  selectedActivityName: ActivityName | null;
  selectedActivityParams: ActivityParams | null;
  setSelectedActivityName: (activityName: ActivityName | null) => void;
  setSelectedActivityParams: (activity: ActivityParams | null) => void;
  onUpdateClick: () => void;
}

export const ActivitySelector = (props: ActivitySelectorProps) => {
  const onChangeActivityName = (value: ActivityName | null) => {
    props.setSelectedActivityName(value);
    props.setSelectedActivityParams(value ? (initialParamsMap[value] as ActivityParams) : null);
  };

  const onChangeContext = (property: string, value: string | null) => {
    const updatedParams = { ...props.selectedActivityParams, [property]: value };
    props.setSelectedActivityParams(updatedParams as ActivityParams);
  };

  return (
    <Stack>
      <Select
        label="Activity"
        data={activityNames}
        value={props.selectedActivityName}
        searchable
        onChange={(v) => onChangeActivityName(v as ActivityName)}
      />
      {props.selectedActivityParams &&
        Object.entries(props.selectedActivityParams).map(([key, value]) => (
          <Select
            key={key}
            label={key}
            searchable
            // todo: usememo and get by param key in case of multi param
            data={getParamsOptions(props.selectedActivityName!, props.encyclopedia)}
            value={value}
            onChange={(v) => onChangeContext(key, v)}
          />
        ))}
      <Button onClick={props.onUpdateClick} disabled={!props.selectedActivityName || !props.selectedActivityParams}>
        Update Activity
      </Button>
    </Stack>
  );
};
