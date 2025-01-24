import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";

export function DeletePostConfirmationModal({
  onDelete,
}: {
  onDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    setIsOpen: (isOpen: boolean) => void
  ) => void;
}) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:underline"
      >
        Delete
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-gray-800 p-12 rounded">
            <DialogTitle className="font-bold">Delete Post</DialogTitle>
            <Description>This will delete the post permanently.</Description>
            <p>Are you sure you want to delete this post?</p>
            <div className="flex gap-4">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button onClick={(e) => onDelete(e, setIsOpen)}>Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export function DeleteCommentConfirmationModal({
  onDelete,
}: {
  onDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    setIsOpen: (isOpen: boolean) => void
  ) => void;
}) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:underline"
      >
        Delete
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-gray-800 p-12 rounded">
            <DialogTitle className="font-bold">Delete Comment</DialogTitle>
            <Description>This will delete the comment permanently.</Description>
            <p>Are you sure you want to delete this comment?</p>
            <div className="flex gap-4">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button onClick={(e) => onDelete(e, setIsOpen)}>Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
