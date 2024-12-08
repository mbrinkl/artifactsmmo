import { ActivityName, activityNames, ActivityParams, Encyclopedia, initialParamsMap } from "@artifacts/shared";
import { Button, ComboboxData, Select, Stack } from "@mantine/core";
import { getParamsOptions } from "../util";
import { useMemo } from "react";

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

  const paramsOptions: ComboboxData = useMemo(() => {
    if (!props.selectedActivityName) {
      return [];
    }
    return getParamsOptions(props.selectedActivityName, props.encyclopedia);
  }, [props.selectedActivityName, props.encyclopedia]);

  return (
    <Stack>
      <Select
        label="Activity"
        data={activityNames}
        value={props.selectedActivityName}
        size="md"
        searchable
        onChange={(v) => onChangeActivityName(v as ActivityName)}
      />
      {props.selectedActivityParams &&
        Object.entries(props.selectedActivityParams).map(([key, value]) => (
          <Select
            key={key}
            label={key}
            searchable
            size="md"
            data={paramsOptions}
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
