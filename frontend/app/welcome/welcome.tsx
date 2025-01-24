import { useQuery } from "@tanstack/react-query";
import { PostCard } from "../components/Card";
import { client } from "../libs/client";
import ErrorPage from "../components/ErrorPage";
import LoadingPage from "../components/LoadingPage";
import type { BaseResponse, Post } from "@/types";

export function Welcome() {
  const {
    data: posts,
    error,
    isPending,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, status, error } = await client.api.posts.posts.get({
        query: { page: 1, limit: 10 },
      });
      if (error) {
        throw error;
      }
      if (status !== 200) {
        throw new Error("Failed to fetch posts");
      }
      const result = data as BaseResponse<{ posts: Post[] }>;
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data.posts;
    },
  });
  return isPending ? (
    <LoadingPage></LoadingPage>
  ) : error ? (
    <ErrorPage error={error.message}></ErrorPage>
  ) : (
    <main className="px-16 py-10 text-center w-full mx-auto">
      {posts.map((post) => {
        return <PostCard key={post.id} post={post}></PostCard>;
      })}
    </main>
  );
}
