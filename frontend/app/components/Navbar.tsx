import { Link, useNavigate } from "react-router";
import { authClient } from "../libs/auth-client";
import CreatePostForm from "./CreatePostForm";
import Avatar from "./Avatar";
import { useQuery } from "@tanstack/react-query";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
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

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between content-center">
      <Link to={"/"}>
        <h1 className="text-2xl font-bold">Clone Forum</h1>
      </Link>

      <div>
        {data?.user ? (
          <div className="flex items-center gap-4 mx-10">
            <CreatePostForm></CreatePostForm>
            <Avatar></Avatar>
          </div>
        ) : (
          <>
            <Link
              to={"/login"}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
