import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CharacterInfo, Encyclopedia } from "@artifacts/shared";
import { serverUrl } from "../config";

const fetcher = async <T>(path: string, token: string, method: "GET" | "POST" = "GET", body?: BodyInit): Promise<T> => {
  const url = new URL(serverUrl + path);
  const response = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + token, Accept: "application/json", "Content-Type": "application/json" },
    body,
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

export const useGetEncyclopediaQuery = (token: string) =>
  useQuery({
    queryKey: ["encyclopedia"],
    queryFn: () => fetcher<Encyclopedia>("/encyclopedia", token),
  });

export const useGetDashboardDataQuery = (token: string) =>
  useQuery({
    queryKey: ["characters"],
    queryFn: () => fetcher<CharacterInfo[]>("/characters", token),
    refetchInterval: 15000,
    retry: false,
  });

export const useUpdateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, characterInfo }: { token: string; characterInfo: CharacterInfo }) =>
      fetcher<CharacterInfo[]>("/update", token, "POST", JSON.stringify(characterInfo)),
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard-data"], data);
    },
  });
};
