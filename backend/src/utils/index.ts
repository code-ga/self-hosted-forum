export function parseJsonContentToString(content: Record<string, any>): string {
  if (content.text) {
    return content.text || "";
  } else if (content.content && Array.isArray(content.content)) {
    return content.content
      .map((item: Record<string, any>) => parseJsonContentToString(item))
      .join("");
  } else {
    return "";
  }
}
