import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CharacterInfo, Item, Resource, Square } from "@artifacts/shared";
import { serverUrl } from "../config";

const getInitial = async (token: string): Promise<{ squares: Square[]; items: Item[]; resources: Resource[] }> => {
  const response = await fetch(serverUrl + "/init", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

const getDashboardData = async (token: string): Promise<CharacterInfo[]> => {
  const response = await fetch(serverUrl + "/dashboard-data", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

const updateActivity = async (token: string, characterInfo: CharacterInfo): Promise<CharacterInfo[]> => {
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

export const useGetInitialQuery = (token: string) =>
  useQuery({
    queryKey: ["initial"],
    queryFn: () => getInitial(token),
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
