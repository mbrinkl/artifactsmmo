import { Activity, ActivityName, Encyclopedia } from "@artifacts/shared";
import { ComboboxData } from "@mantine/core";

export const getFormattedActivity = (activity: Activity | null): string => {
  if (!activity) {
    return "none";
  }
  const params = Object.values(activity.params).join(", ");
  return `${activity.name} ${params}`;
};

export const getParamsOptions = (
  activityName: ActivityName,
  { resources, items, monsters }: Encyclopedia,
): ComboboxData => {
  switch (activityName) {
    case "craft":
      return items
        .filter((x) => !!x.craft)
        .sort((a, b) => a.craft!.skill!.localeCompare(b.craft!.skill!) || a.craft!.level! - b.craft!.level!)
        .map((x) => ({
          label: `${x.code} (Lv ${x.craft?.level} ${x.craft?.skill}) - ${x.craft?.items?.map((x) => `${x.quantity} ${x.code}`).join(", ")}`,
          value: x.code,
        }));
    case "gather":
      return resources
        .sort((a, b) => a.skill.localeCompare(b.skill) || a.level - b.level)
        .map((x) => ({ label: `${x.code} (Lv ${x.level} ${x.skill})`, value: x.code }));
    case "fight":
      return monsters
        .sort((a, b) => a.level - b.level)
        .map((x) => ({ label: `${x.code} (Lv ${x.level})`, value: x.code }));
  }
};
