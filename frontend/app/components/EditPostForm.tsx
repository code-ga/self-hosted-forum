import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Field,
  Fieldset,
  Input,
  Label,
} from "@headlessui/react";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import Tiptap from "./TipTap";
import { authClient } from "../libs/auth-client";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { Navigate } from "react-router";
import { clsx } from "clsx";
import type { JSONContent } from "@tiptap/react";
import { client } from "../libs/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseResponse, Post } from "@/types";

function EditPostForm({ post }: { post: Post }) {
  let [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    content?: JSONContent;
  }>({
    title: post.title,
    content: post.content as JSONContent,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
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
    return <LoadingPage></LoadingPage>;
  }

  if (isOpen && !data?.user) {
    return <Navigate to="/login"></Navigate>;
  }
  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    setIsCreating(true);
    if (!formData.title) {
      setIsCreating(false);
      setFormError({
        title: "Title is required",
      });
      return;
    }

    if (!formData.content) {
      setIsCreating(false);
      setFormError({
        content: "Content is required",
      });
      return;
    }
    let rawText = "";
    if (formData.content) {
      rawText = JSON.stringify(formData.content);
    }
    try {
      const {
        data: result,
        error,
        status,
      } = await client.api.posts({ id: post.id }).put({
        title: formData.title,
        content: formData.content,
      });

      if (error) {
        switch (error.status) {
          case 400:
            setFormError({
              title: "Title is required",
              content: "Content is required",
            });
            break;
          default:
            setFormError({
              fetch: "Error creating post",
            });
            break;
        }
        setIsCreating(false);
      }

      if (status === 200) {
        const res = result as BaseResponse<Post>;
        if (res.success) {
          queryClient.setQueryData(["post", post.id], res.data);
          queryClient.setQueryData(["posts"], (old: Post[] | undefined) => {
            if (!old) {
              return old;
            }
            return old.map((post) => {
              if (post.id === res.data.id) {
                return res.data;
              }
              return post;
            });
          });
          setFormData({
            title: res.data.title,
            content: res.data.content as JSONContent,
          });
        }
        setIsCreating(false);
        setIsOpen(false);
      }
    } catch (error) {
      setIsCreating(false);
      setFormError({
        fetch: "Error creating post",
      });
      return;
    }

    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="text-blue-500 hover:underline mr-2"
      >
        Edit
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        // className="relative z-50"
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <div className="fixed inset-0 w-screen overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <DialogPanel className=" space-y-4 border bg-gray-800 rounded p-12">
                {error ? (
                  <ErrorPage error={(error as Error).message}></ErrorPage>
                ) : (
                  <>
                    <DialogTitle className="font-bold text-2xl">
                      Edit Post
                    </DialogTitle>
                    <Description className="text-sm/1 text-gray-400">
                      this will create new post as{" "}
                      <span className="font-bold text-white">
                        {data?.user?.name}
                      </span>
                    </Description>
                    {formError.fetch && (
                      <p className="text-sm/1 text-red-500 font-bold">
                        {formError.fetch}
                      </p>
                    )}

                    <div className="w-full mb-6">
                      <Fieldset className="space-y-6 rounded-xl">
                        <Field>
                          <Label className="text-sm/6 font-medium text-white">
                            Title
                          </Label>
                          {formError.title && (
                            <p className="text-sm/1 text-red-500 font-bold">
                              {formError.title}
                            </p>
                          )}
                          <Input
                            className={clsx(
                              "mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white",
                              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                            )}
                            type="text"
                            placeholder="Title"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            value={formData.title}
                          />
                        </Field>

                        <Field>
                          <Label className="text-sm/6 font-medium text-white">
                            Content
                          </Label>

                          <Description className="text-sm/6 text-white/50">
                            Markdown is supported here.
                          </Description>
                          {formError.content && (
                            <p className="text-sm/1 text-red-500 font-bold">
                              {formError.content}
                            </p>
                          )}
                          <Tiptap
                            className="mt-3 bg-white/5 text-white rounded-lg w-full py-1.5 px-3 [&>div:first-child]:w-[50vw] [&>div:first-child>div:first-child]:w-[50vw] [&>div:first-child]:min-h-14 [&>div:first-child>div:first-child]:min-h-14"
                            bubbleMenu={{}}
                            placeholder="Write your problem, solution, feelings, confession, etc."
                            content={formData.content}
                            setContent={(content) =>
                              setFormData({
                                ...formData,
                                content,
                              })
                            }
                          />
                        </Field>
                      </Fieldset>
                    </div>

                    <div className="flex gap-4 justify-between pt-5">
                      <Button
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={(e) => handleSubmit(e)}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-blue-700 data-[focus]:outline-1 data-[focus]:outline-white"
                        disabled={isCreating}
                      >
                        Edit
                      </Button>
                    </div>
                  </>
                )}
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default EditPostForm;
