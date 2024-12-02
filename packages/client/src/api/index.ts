import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, CharacterInfo, CharacterInfoResponse, Encyclopedia } from "@artifacts/shared";
import { serverUrl, tokenStorageKey } from "../config";

const fetcher = async <T>(path: string, method: "GET" | "POST" = "GET", body?: BodyInit): Promise<T> => {
  const token = localStorage.getItem(tokenStorageKey);
  if (!token) {
    throw new Error("Token not found in localstorage");
  }
  const response = await fetch(serverUrl + path, {
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

export const useGetEncyclopediaQuery = () =>
  useQuery({
    queryKey: ["encyclopedia"],
    queryFn: () => fetcher<Encyclopedia>("/encyclopedia"),
  });

export const useGetDashboardDataQuery = () =>
  useQuery({
    queryKey: ["characters"],
    queryFn: () => fetcher<CharacterInfoResponse>("/characters"),
    refetchInterval: 20000,
    retry: false,
  });

export const useUpdateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ characterInfo }: { characterInfo: CharacterInfo }) =>
      fetcher<CharacterInfoResponse>("/update", "POST", JSON.stringify(characterInfo)),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};

export const useUpdateDefaultActivityMutation = () => {
  return useMutation({
    mutationFn: ({ body }: { body: { characterName: string; activity: Activity } }) =>
      fetcher<void>("/update-default-activity", "POST", JSON.stringify(body)),
  });
};

export const useClearAllMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetcher<CharacterInfo[]>("/clear-all", "POST"),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};

export const useSetAllDefaultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetcher<CharacterInfo[]>("/set-all-default", "POST"),
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], data);
    },
  });
};
