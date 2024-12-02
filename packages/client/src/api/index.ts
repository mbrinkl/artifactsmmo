import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, CharacterInfo, CharacterInfoResponse, Encyclopedia } from "@artifacts/shared";
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
    queryFn: () => fetcher<CharacterInfoResponse>("/characters", token),
    refetchInterval: 20000,
    retry: false,
  });

export const useUpdateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, characterInfo }: { token: string; characterInfo: CharacterInfo }) =>
      fetcher<CharacterInfoResponse>("/update", token, "POST", JSON.stringify(characterInfo)),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};

export const useUpdateDefaultActivityMutation = () => {
  return useMutation({
    mutationFn: ({ token, body }: { token: string; body: { characterName: string; activity: Activity } }) =>
      fetcher<void>("/update-default-activity", token, "POST", JSON.stringify(body)),
  });
};

export const useClearAllMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token }: { token: string }) => fetcher<CharacterInfo[]>("/clear-all", token, "POST"),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};

export const useSetAllDefaultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token }: { token: string }) => fetcher<CharacterInfo[]>("/set-all-default", token, "POST"),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};
