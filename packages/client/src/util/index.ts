import { Activity, ActivityName, CharacterInfoResponse, Encyclopedia } from "@artifacts/shared";
import { ComboboxData } from "@mantine/core";

interface StatsData {
  value: string;
  imgSrc?: string;
}

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

export const getStatsData = (c: CharacterInfoResponse[0]): StatsData[] => {
  return [
    {
      value: `Level: ${c.level} (${c.xp} / ${c.max_xp})`,
    },
    {
      value: `Alchemy: Lv${c.alchemy_level} (${c.alchemy_xp} / ${c.alchemy_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/alchemy.png",
    },
    {
      value: `Cooking: Lv${c.cooking_level} (${c.cooking_xp} / ${c.cooking_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/cooked_chicken.png",
    },
    {
      value: `Fishing: Lv${c.fishing_level} (${c.fishing_xp} / ${c.fishing_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/fishing.png",
    },
    {
      value: `Gearcrafting: Lv${c.gearcrafting_level} (${c.gearcrafting_xp} / ${c.gearcrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/iron_armor.png",
    },
    {
      value: `Jewelrycrafting: Lv${c.jewelrycrafting_level} (${c.jewelrycrafting_xp} / ${c.jewelrycrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/ruby_ring.png",
    },
    {
      value: `Mining: Lv${c.mining_level} (${c.mining_xp} / ${c.mining_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/mining.png",
    },
    {
      value: `Weaponcrafting: Lv${c.weaponcrafting_level} (${c.weaponcrafting_xp} / ${c.weaponcrafting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/items/iron_sword.png",
    },
    {
      value: `Woodcutting: Lv${c.woodcutting_level} (${c.woodcutting_xp} / ${c.woodcutting_max_xp})`,
      imgSrc: "https://artifactsmmo.com/images/effects/woodcutting.png",
    },
  ];
};
