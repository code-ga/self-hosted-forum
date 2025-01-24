import type { JSONContent } from "@tiptap/react";
import type { Comment } from "@/types";
import React, { useState } from "react";
import Tiptap from "./TipTap";

interface CommentFormProps {
  onSubmit: (comment: JSONContent, clearInput: () => void) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState<JSONContent>();
  const clearInput = () => {
    setComment(undefined);
  };
  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (!comment) {
      return;
    }
    onSubmit(comment as JSONContent, clearInput);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <Tiptap
        content={comment}
        setContent={(content) => setComment(content)}
        bubbleMenu={{
          className: "bg-gray-700 border border-gray-600 rounded-md",
        }}
        placeholder="Write your comment here..."
        className="w-full p-2  text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
      />
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default CommentForm;

export function EditCommentForm({
  comment,
  onSubmit,
}: {
  comment: Comment;
  onSubmit: (comment: JSONContent, clearInput: () => void) => void;
}) {
  const [content, setContent] = useState<JSONContent | undefined>(
    comment.content as JSONContent
  );
  console.log(content);
  const clearInput = () => {
    setContent(undefined);
  };
  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (!content) {
      return;
    }
    onSubmit(content as JSONContent, clearInput);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <Tiptap
        content={content}
        setContent={(content) => setContent(content)}
        bubbleMenu={{
          className: "bg-gray-700 border border-gray-600 rounded-md",
        }}
        placeholder="Write your comment here..."
        className="w-full p-2  text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
      />
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
