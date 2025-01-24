import type { BaseResponse, Comment, Post, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import Card, { CommentCard } from "../components/Card";
import CommentForm from "../components/CommentForm";
import EditPostForm from "../components/EditPostForm";
import ErrorPage from "../components/ErrorPage";
import LoadingPage from "../components/LoadingPage";
import { DeletePostConfirmationModal } from "../components/Modal";
import { authClient } from "../libs/auth-client";
import { client } from "../libs/client";
import { renderContent } from "../utils";

const ViewPost: React.FC<{ post: Post }> = ({ post }) => {
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
      <Card className="mb-4 text-left transition my-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-white text-lg font-bold mb-2">{post.title}</h2>
          <h2 className="text-white text-lg mb-2">
            {renderContent(post.content as JSONContent)}
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <Link to={`/profile/${author.id}`}>
                <span className="text-gray-400">By</span>
                <span className="text-gray-400 font-bold"> {author.name}</span>
              </Link>
              <span className="text-gray-400 ml-2">
                {" "}
                - {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
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
};

const ViewPostPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <Navigate to="/" />;
  }
  const queryClient = useQueryClient();
  const {
    data: post,
    error: postError,
    isPending: postIsPending,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, status, error } = await client.api.posts({ id }).get();
      if (error) {
        throw error;
      }
      if (status !== 200) {
        throw new Error("Failed to fetch post");
      }
      const result = data as BaseResponse<{ post: Post }>;
      return result.data.post;
    },
  });
  const {
    data: comment,
    error: commentError,
    isPending: commentIsPending,
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, status, error } = await client.api.comments
        .posts({ postId: id })
        .get();
      if (error) {
        throw error;
      }
      if (status !== 200) {
        throw new Error("Failed to fetch post");
      }
      const result = data as BaseResponse<{ comments: Comment[] }>;
      return result.data.comments;
    },
  });
  if (postIsPending) {
    return <LoadingPage></LoadingPage>;
  }
  if (postError) {
    return <ErrorPage error={postError.message}></ErrorPage>;
  }

  const handleCommentSubmit = async (
    comment: JSONContent,
    clearInput: () => void
  ) => {
    const { data, error, status } =
      await client.api.comments.createComment.post(
        {
          content: comment,
          postId: post.id,
        },
        {}
      );
    if (error) {
      throw error;
    }
    if (status !== 200) {
      throw new Error("Failed to create comment");
    }
    const result = data as BaseResponse<Comment>;
    console.log(result);
    clearInput();
    queryClient.setQueryData(["comments", id], (oldData: Comment[]) => {
      if (!oldData) {
        return oldData;
      }
      return [...oldData, result.data]
        .filter((c) => c.id !== "")
        .sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
    });
  };

  console.log(comment);

  return (
    <div className="flex flex-col">
      <ViewPost post={post} />
      <Card className="mb-4 border-gray-500">
        <div className="h-1 bg-gray-500"></div>
      </Card>
      {commentIsPending && <LoadingPage></LoadingPage>}
      {commentError && (
        <Card className="text-center border-none bg-transparent my-10 shadow-none">
          <p className="text-red-500 text-2xl">{commentError.message}</p>
        </Card>
      )}
      {comment?.map((comment) => (
        <CommentCard comment={comment} key={comment.id}></CommentCard>
      ))}
      <Card className="mt-4 border-gray-800">
        <CommentForm onSubmit={handleCommentSubmit}></CommentForm>
      </Card>
    </div>
  );
};

export default ViewPostPage;
