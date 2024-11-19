import { useMutation, useQuery } from "@tanstack/react-query";
import { CharacterInfo } from "@artifacts/shared";
import { serverUrl } from "../config";

const getDashboardData = async (token: string) => {
  const response = await fetch(serverUrl + "/dashboard-data", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return (await response.json()) as CharacterInfo[];
};

const updateActivity = async (token: string, characterInfo: CharacterInfo) => {
  const response = await fetch(serverUrl + "/update-activity", {
    method: "POST",
    body: JSON.stringify(characterInfo),
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

export const useGetDashboardDataQuery = (token: string) =>
  useQuery({ queryKey: ["dashboard-data"], queryFn: () => getDashboardData(token), refetchInterval: 5000 });

export const useUpdateActivityMutation = () =>
  useMutation({
    mutationFn: ({ token, characterInfo }: { token: string; characterInfo: CharacterInfo }) =>
      updateActivity(token, characterInfo),
  });
