import { Activity, ActivityName, Encyclopedia } from "@artifacts/shared";

export const getFormattedActivity = (activity: Activity | null): string => {
  if (!activity) {
    return "none";
  }
  const params = Object.values(activity.params).join(", ");
  return `${activity.name} ${params}`;
};

export const getParamsOptions = (activityName: ActivityName, { resources, items, monsters }: Encyclopedia) => {
  switch (activityName) {
    case "craft":
      return items
        .filter((x) => !!x.craft)
        .map((x) => x.code)
        .sort() as string[];
    case "gather":
      return resources.map((x) => x.code).sort();
    case "fight":
      return monsters.map((x) => x.code).sort();
  }
};
