import { useQuery } from "@tanstack/react-query";

const getDashboardData = async (token: string) => {
  const response = await fetch("http://localhost:3000/dashboard-data", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
};

// poll? refetchInterval
export const useGetDashboardDataQuery = (token: string) =>
  useQuery({ queryKey: ["test"], queryFn: () => getDashboardData(token) });
