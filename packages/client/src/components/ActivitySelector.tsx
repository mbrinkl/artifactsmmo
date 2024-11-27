import { ActivityName, activityNames, ActivityParams, Encyclopedia, initialParamsMap } from "@artifacts/shared";
import { Select, Text } from "@mantine/core";
import { getParamsOptions } from "../util";

interface ActivitySelectorProps {
  encyclopedia: Encyclopedia;
  selectedActivityName: ActivityName | null;
  selectedActivityParams: ActivityParams | null;
  setSelectedActivityName: (activityName: ActivityName | null) => void;
  setSelectedActivityParams: (activity: ActivityParams | null) => void;
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
    <div>
      <Select
        label="Activity"
        data={activityNames}
        value={props.selectedActivityName}
        onChange={(v) => onChangeActivityName(v as ActivityName)}
      />
      {props.selectedActivityParams && (
        <div>
          <Text>Activity Context:</Text>
          {Object.entries(props.selectedActivityParams).map(([key, value]) => {
            return (
              <Select
                key={key}
                label={key}
                // todo: usememo and get by param key in case of multi param
                data={getParamsOptions(props.selectedActivityName!, props.encyclopedia)}
                value={value}
                onChange={(v) => onChangeContext(key, v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
