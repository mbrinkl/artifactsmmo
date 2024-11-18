import { CharacterInfo } from "../../../server/src/types";
import { useGetDashboardDataQuery, useUpdateActivityMutation } from "../api";
import "./Dashboard.css";

interface DashboardProps {
  token: string;
}

export const Dashboard = (props: DashboardProps) => {
  const { data, error } = useGetDashboardDataQuery(props.token);
  const mutation = useUpdateActivityMutation();

  const update = (characterInfo: CharacterInfo) => {
    mutation.mutate({ token: props.token, characterInfo });
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return <div>No characters in response</div>;
  }

  return (
    <div>
      {data.map((x) => (
        <div>
          {x.characterName}: {x.activity ? x.activity.name + JSON.stringify(x.activity.context) : "None"}
          <button
            onClick={() =>
              update({
                characterName: x.characterName,
                activity: { name: "gather", context: { location: "Copper_Rocks" } },
                queue: [],
              })
            }
          >
            gg idiot
          </button>
        </div>
      ))}
    </div>
  );
};
