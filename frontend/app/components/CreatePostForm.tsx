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

function CreatePostForm() {
  let [isOpen, setIsOpen] = useState(false);
  const { data, error, isPending } = authClient.useSession();
  if (isPending) {
    return <LoadingPage></LoadingPage>;
  }

  if (isOpen && !data?.user) {
    return <Navigate to="/login"></Navigate>;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        <CiCirclePlus className="text-2xl" />
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <div className="fixed inset-0 w-screen overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <DialogPanel className="max-w-lg space-y-4 border bg-gray-800 rounded p-12">
                {error ? (
                  <ErrorPage error={(error as Error).message}></ErrorPage>
                ) : (
                  <>
                    <DialogTitle className="font-bold">
                      Create a Post
                    </DialogTitle>
                    <Description>
                      this will create new post as {data?.user?.name}
                    </Description>

                    <div className="w-full max-w-lg mb-6">
                      <Fieldset className="space-y-6 rounded-xl">
                        <Field>
                          <Label className="text-sm/6 font-medium text-white">
                            Title
                          </Label>
                          <Input
                            className={clsx(
                              "mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white",
                              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                            )}
                          />
                        </Field>

                        <Field>
                          <Label className="text-sm/6 font-medium text-white">
                            Content
                          </Label>
                          <Description className="text-sm/6 text-white/50">
                            Markdown is supported here. Write your problem,
                            solution, feelings, confession, etc.
                          </Description>
                          <Tiptap
                            className="mt-3 bg-white/5 text-white rounded-lg w-full py-1.5 px-3"
                            bubbleMenu={{}}
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
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-blue-700 data-[focus]:outline-1 data-[focus]:outline-white"
                      >
                        Create
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

export default CreatePostForm;
