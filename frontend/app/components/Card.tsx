import { twMerge } from "tailwind-merge";
import type { BaseResponse, Post, User, Comment } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../libs/client";
import { authClient } from "../libs/auth-client";
import {
  DeleteCommentConfirmationModal,
  DeletePostConfirmationModal,
} from "./Modal";
import { useState } from "react";
import { Link } from "react-router";
import EditPostForm from "./EditPostForm";
import { renderContent } from "../utils";
import type { JSONContent } from "@tiptap/react";
import { EditCommentForm } from "./CommentForm";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex justify-center items-center">
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
      <Card className="text-left hover:scale-105 transition mb-10">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <Link to={`/post/${post.id}`}>
            <h2 className="text-white text-lg font-bold mb-2">{post.title}</h2>
            <p className="text-gray-400 mb-4 break-words">
              {post.rawText.slice(0, 100)}
              {post.rawText.length > 100 && "..."}
            </p>
          </Link>
          <div className="flex justify-between items-center">
            <Link to={`/profile/${author.id}`}>
              <div>
                <span className="text-gray-400">By</span>
                <span className="text-gray-400 font-bold"> {author.name}</span>
                <span className="text-gray-400 ml-2">
                  {" "}
                  - {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            </Link>
            <div>
              {currentUser?.user.id === author.id && (
                <EditPostForm post={post}></EditPostForm>
              )}
              {currentUser?.user.id === author.id && (
                <DeletePostConfirmationModal
                  onDelete={async (event, setIsOpen) => {
                    event.preventDefault();
                    setIsOpen(false);
                    await deleteMutation.mutateAsync(post.id);
                  }}
                ></DeletePostConfirmationModal>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

export const CommentCard = ({ comment }: { comment: Comment }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const {
    data: userData,
    error: userError,
    isPending: userIsPending,
  } = useQuery({
    queryKey: ["user", comment.authorId],
    queryFn: async () => {
      const { data, status, error } = await client.api
        .user({ id: comment.authorId })
        .get({
          query: { id: comment.authorId },
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
  if (!userData) {
    return null;
  }
  if (userError || error) {
    return (
      <Card className="text-center my-10">
        <p className="text-red-500 text-2xl">{userError?.message || error}</p>
      </Card>
    );
  }
  if (userIsPending) {
    return (
      <Card className="text-center my-10">
        <p className="text-2xl">Loading...</p>
      </Card>
    );
  }
  const user = userData.data.user;
  const deleteComment = async () => {
    const { data, error, status } = await client.api
      .comments({ id: comment.id })
      .delete();
    if (error) {
      setError(error.message);
    }
    if (status !== 200) {
      setError("Failed to delete comment");
    }
    const res = data as BaseResponse<Comment>;
    queryClient.setQueryData(
      ["comments", comment.postId],
      (oldData: Comment[]) => {
        return oldData.filter((c) => c.id !== res.data.id);
      }
    );
  };

  const onEditCommentSubmit = async (content: JSONContent, clearInput: () => void) => {
    const { data, error, status } = await client.api
      .comments({ id: comment.id })
      .put({ content: content });
    if (error) {
      setError(error.message);
    }
    if (status !== 200) {
      setError("Failed to update comment");
    }
    const res = data as BaseResponse<Comment>;
    queryClient.setQueryData(["comments", comment.postId], (oldData: Comment[]) => {
      return oldData.map((c) => (c.id === comment.id ? res.data : c));
    });
    queryClient.setQueryData(["comment", comment.id], res.data);
    clearInput();
    setEditing(false);
  };
  return (
    <Card className="text-left transition mb-5 mt-10">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <Link to={`/profile/${user.id}`}>
          <div className="flex items-center my-3">
            <img
              className="h-8 w-8 rounded-full mr-3"
              src={
                user.image ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTtKDBHoGq6L5htfFMFrluklPkLsQd4e3PAg&s"
              }
              alt={user.name}
            />
            <span className="text-gray-400 font-bold"> {user.name}</span>
            <span className="text-gray-400 ml-2">
              {" "}
              - {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </Link>
        {editing ? (
          <EditCommentForm
            comment={comment}
            onSubmit={onEditCommentSubmit}
          ></EditCommentForm>
        ) : (
          <h2 className="text-white text-lg mb-2">
            {renderContent(comment.content as JSONContent)}
          </h2>
        )}

        <div className="flex justify-end items-center">
          {currentUser?.user.id === user.id && (
            <button
              onClick={() => {
                setEditing((old) => !old);
              }}
              className="text-gray-400 mr-2"
            >
              Edit
            </button>
          )}
          {currentUser?.user.id === user.id && (
            <DeleteCommentConfirmationModal
              onDelete={async (event, setIsOpen) => {
                event.preventDefault();
                setIsOpen(false);
                await deleteComment();
              }}
            ></DeleteCommentConfirmationModal>
          )}
        </div>
      </div>
    </Card>
  );
};
