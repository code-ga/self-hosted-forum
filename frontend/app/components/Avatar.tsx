import { authClient } from "../libs/auth-client";

const Avatar: React.FC = () => {
  const { data, error, isPending } = authClient.useSession();

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