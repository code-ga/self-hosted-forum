import { twMerge } from "tailwind-merge";
import type { BaseResponse, Post, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../libs/client";
import { parseJsonContentToString } from "../utils";
import { authClient } from "../libs/auth-client";
import { DeleteConfirmationModal } from "./Modal";
import { useState } from "react";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex justify-center items-center my-8">
      <div
        className={twMerge(
          "w-full bg-base-100 shadow-xl border lg:w-1/2 drop-shadow-lg rounded shadow-slate-700 bg-gray-800",
          className
        )}
      >
        <div className="">{children}</div>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const [toastError, setToastError] = useState<string | null>(null);
  const {
    data: user,
    error,
    isPending,
  } = useQuery({
    queryKey: ["user", post.authorId],
    queryFn: async () => {
      const { data, status, error } = await client.api
        .user({ id: post.authorId })
        .get({
          query: { id: post.authorId },
        });
      if (error) {
        throw error;
      }
      if (status !== 200) {
        throw new Error("Failed to fetch user");
      }
      return data as BaseResponse<{ user: User }>;
    },
  });
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result?.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error, status } = await client.api.posts({ id }).delete();
      if (error) {
        throw error;
      }
      if (status !== 200) {
        throw new Error("Failed to delete post");
      }
      return data.id as string;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["posts"], (oldData: Post[]) => {
        if (!oldData) {
          return oldData;
        }
        return oldData.filter((post) => post.id != variables);
      });
      setToastError(null);
    },
    onError: (error) => {
      setToastError(error.message);
      setTimeout(() => {
        setToastError(null);
      }, 3000);
    },
  });

  const onEdit = () => {};

  if (isPending) {
    return (
      <Card>
        <div>Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div>Error: {error.message}</div>
      </Card>
    );
  }

  const author = user?.data.user;
  if (!author) {
    return (
      <Card>
        <div>Author not found</div>
      </Card>
    );
  }
  return (
    <>
      {toastError && (
        <div
          className="max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-800 dark:border-neutral-700"
          role="alert"
          tabIndex={-1}
          aria-labelledby="hs-toast-error-example-label"
        >
          <div className="flex p-4">
            <div className="shrink-0">
              <svg
                className="shrink-0 size-4 text-red-500 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
              </svg>
            </div>
            <div className="ms-3">
              <p
                id="hs-toast-error-example-label"
                className="text-sm text-gray-700 dark:text-neutral-400"
              >
                {toastError}
              </p>
            </div>
          </div>
        </div>
      )}
      <Card>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-white text-lg font-bold mb-2">{post.title}</h2>
          <p className="text-gray-400 mb-4 break-words">
            {post.rawText.slice(0, 100)}
            {post.rawText.length > 100 && "..."}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400">By {author.name}</span>
              <span className="text-gray-400 ml-2">
                {" "}
                - {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              {currentUser?.user.id === author.id && (
                <button
                  className="text-blue-500 hover:underline mr-2"
                  onClick={onEdit}
                >
                  Edit
                </button>
              )}
              {currentUser?.user.id === author.id && (
                <DeleteConfirmationModal
                  onDelete={async (event, setIsOpen) => {
                    event.preventDefault();
                    setIsOpen(false);
                    await deleteMutation.mutateAsync(post.id);
                  }}
                ></DeleteConfirmationModal>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
