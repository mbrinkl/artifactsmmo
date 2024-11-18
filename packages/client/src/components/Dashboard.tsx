import { useGetDashboardDataQuery } from "../api";

interface DashboardProps {
  token: string;
}

export const Dashboard = (props: DashboardProps) => {
  const query = useGetDashboardDataQuery(props.token);

  if (query.error) {
    return <div>Error: {query.error.message}</div>;
  }

  if (!query.data) {
    return <div>Loading...</div>;
  }

  return <div>Data: {JSON.stringify(query.data)}</div>;
};
