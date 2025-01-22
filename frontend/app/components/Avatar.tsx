import { useQuery } from "@tanstack/react-query";
import { authClient } from "../libs/auth-client";

const Avatar: React.FC = () => {
  const { data, error, isPending } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result?.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (data?.user) {
    return (
      <div className="flex items-center">
        <img
          className="h-8 w-8 rounded-full"
          src={
            data.user.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTtKDBHoGq6L5htfFMFrluklPkLsQd4e3PAg&s"
          }
          alt={data.user.name}
        />
        <span className="ml-2">{data.user.name}</span>
      </div>
    );
  }

  return null;
};

export default Avatar;