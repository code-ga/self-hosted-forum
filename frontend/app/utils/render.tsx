import type { JSONContent } from "@tiptap/react";
import type { JSX } from "react";
export function renderContent(content: JSONContent) {
  if (content.type === "paragraph") {
    return <p>{content.content?.map((item) => renderContent(item))}</p>;
  } else if (content.type === "text") {
    if (content.marks) {
      return renderMask(content.marks, <span>{content.text}</span>);
    } else {
      return <span>{content.text}</span>;
    }
  } else if (content.type === "heading") {
    return (
      <h1>
        {content.content
          ? content.content.map((item) => renderContent(item))
          : ""}
      </h1>
    );
  } else {
    return (
      <div>
        {content.content
          ? content.content.map((item) => renderContent(item))
          : ""}
      </div>
    );
  }
}

export function renderMask(
  masks: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[],
  content: JSX.Element
) {
  if (masks.length === 0) {
    return content;
  }
  const mask = masks[0];
  if (mask.type === "bold") {
    return renderMask(masks.slice(1), <b>{content}</b>);
  } else if (mask.type === "italic") {
    return renderMask(masks.slice(1), <i>{content}</i>);
  } else if (mask.type === "strike") {
    return renderMask(masks.slice(1), <del>{content}</del>);
  }
}
