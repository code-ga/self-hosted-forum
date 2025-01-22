import type { JSONContent } from "@tiptap/react";

export function parseJsonContentToString(content: JSONContent): string {
  if (content.text) {
    return content.text || "";
  } else if (content.content) {
    return content.content
      .map((item) => parseJsonContentToString(item))
      .join("");
  } else {
    return "";
  }
}