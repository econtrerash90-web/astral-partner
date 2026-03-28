import React from "react";

/**
 * Formats AI-generated markdown-like text into clean React elements.
 * Converts **bold** to <strong>, removes #/* artifacts, preserves line breaks.
 */
export function formatAIText(text: string): React.ReactNode[] {
  // Clean up markdown artifacts
  let cleaned = text
    .replace(/^#{1,6}\s*/gm, "")      // Remove heading markers
    .replace(/^\*{3,}$/gm, "")         // Remove horizontal rules (*** or ---)
    .replace(/^-{3,}$/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")    // Convert list markers to bullet
    .replace(/\n{3,}/g, "\n\n");       // Collapse excessive newlines

  // Split into paragraphs
  const paragraphs = cleaned.split("\n\n").filter((p) => p.trim());

  return paragraphs.map((para, i) => {
    const lines = para.split("\n").filter((l) => l.trim());

    return React.createElement(
      "p",
      { key: i, className: i > 0 ? "mt-4" : undefined },
      ...lines.flatMap((line, li) => {
        const parts = formatInline(line);
        if (li < lines.length - 1) {
          return [...parts, React.createElement("br", { key: `br-${li}` })];
        }
        return parts;
      })
    );
  });
}

/** Parse inline bold (**text**) and return React nodes */
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      React.createElement("strong", { key: `b-${match.index}`, className: "text-primary font-semibold" }, match[1])
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
