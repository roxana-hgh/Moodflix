export interface TiptapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

const INLINE_PARENTS = new Set(["paragraph", "heading"]);

export function extractPlainText(node: TiptapNode): string {
  if (typeof node.text === "string") return node.text;
  const separator = node.type && INLINE_PARENTS.has(node.type) ? "" : " ";
  return (node.content ?? [])
    .map(extractPlainText)
    .join(separator)
    .replace(/\s+/g, " ")
    .trim();
}

export function collectImageSrcs(node: TiptapNode, acc: string[] = []): string[] {
  if (node.type === "image" && typeof node.attrs?.src === "string") {
    acc.push(node.attrs.src);
  }
  node.content?.forEach((child) => collectImageSrcs(child, acc));
  return acc;
}