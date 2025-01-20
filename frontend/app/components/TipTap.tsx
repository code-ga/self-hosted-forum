// src/Tiptap.tsx
import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FaBold, FaItalic, FaStrikethrough } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

// define your extension array
const extensions = [StarterKit];

interface Props {
  id?: string;
  rows?: number;
  className?: string;
  floatingMenu?: {
    className?: string;
  };
  bubbleMenu?: {
    className?: string;
  };
  content?: JSONContent;
  setContent?: (content: JSONContent) => void;
}

const Tiptap: React.FC<Props> = ({
  id,
  rows,
  className,
  floatingMenu,
  bubbleMenu,
  content,
  setContent,
}) => {
  const editor = useEditor({
    extensions,
    content: content || [],
    onUpdate: ({ editor }) => {
      if (setContent) {
        setContent(editor.getJSON());
      }
    },
  });

  return (
    <>
      <EditorContent
        editor={editor}
        className={twMerge("bg-white text-black hover:border-none", className)}
        id={id}
        rows={rows}
        step={4}
      />
      {floatingMenu && (
        <FloatingMenu
          editor={editor}
          className={twMerge("bg-white text-black", floatingMenu.className)}
        >
          This is the floating menu
        </FloatingMenu>
      )}
      {bubbleMenu && editor && (
        <BubbleMenu editor={editor}>
          <div
            className={twMerge(
              "bg-white text-black border rounded-md shadow-lg p-2 flex gap-2",
              bubbleMenu.className
            )}
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={twMerge(
                "hover:bg-slate-100",
                editor.isActive("bold") ? "bg-slate-100 hover:bg-slate-200" : ""
              )}
            >
              <FaBold />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={twMerge(
                "hover:bg-slate-100",
                editor.isActive("italic")
                  ? "bg-slate-100 hover:bg-slate-200"
                  : ""
              )}
            >
              <FaItalic />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={twMerge(
                "hover:bg-slate-100",
                editor.isActive("strike")
                  ? "bg-slate-100 hover:bg-slate-200"
                  : ""
              )}
            >
              <FaStrikethrough />
            </button>
          </div>
        </BubbleMenu>
      )}
    </>
  );
};

export default Tiptap;
