import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { serverUrl } from "../config";

const getEncyclopedia = async (token: string): Promise<Encyclopedia> => {
  const response = await fetch(serverUrl + "/api/encyclopedia", {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

const getDashboardData = async (token: string): Promise<CharacterInfo[]> => {
  const response = await fetch(serverUrl + "/api/characters", {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

const updateActivity = async (token: string, characterInfo: CharacterInfo): Promise<CharacterInfo[]> => {
  const response = await fetch(serverUrl + "/api/update", {
    method: "POST",
    body: JSON.stringify(characterInfo),
    headers: { Authorization: "Bearer " + token, Accept: "application/json", "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

export const useGetEncyclopdieaQuery = (token: string) =>
  useQuery({
    queryKey: ["initial"],
    queryFn: () => getEncyclopedia(token),
  });

export const useGetDashboardDataQuery = (token: string) =>
  useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getDashboardData(token),
    refetchInterval: 15000,
    retry: false,
  });

export const useUpdateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, characterInfo }: { token: string; characterInfo: CharacterInfo }) =>
      updateActivity(token, characterInfo),
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard-data"], data);
    },
  });
};
