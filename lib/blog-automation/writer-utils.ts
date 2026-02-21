/**
 * Pure utility functions for converting Ricos format
 * These functions can be safely used in Client Components
 */

/**
 * Convert Ricos format to HTML
 */
export function ricosToHtml(ricos: any): string {
  if (!ricos || !ricos.nodes) return "";
  
  let html = "";
  
  for (const node of ricos.nodes) {
    if (node.type === "heading") {
      const text = ricosNodesToText(node.nodes);
      html += `<h${node.level || 3}>${escapeHtml(text)}</h${node.level || 3}>`;
    } else if (node.type === "paragraph") {
      html += "<p>";
      for (const inlineNode of node.nodes || []) {
        if (inlineNode.type === "text") {
          html += escapeHtml(inlineNode.data || "");
        } else if (inlineNode.type === "link") {
          const text = ricosNodesToText(inlineNode.nodes);
          const href = inlineNode.href || "#";
          const target = inlineNode.target ? ` target="${inlineNode.target}"` : "";
          html += `<a href="${escapeHtml(href)}"${target}>${escapeHtml(text)}</a>`;
        }
      }
      html += "</p>";
    }
  }
  
  return html;
}

function ricosNodesToText(nodes: any[]): string {
  let text = "";
  for (const node of nodes || []) {
    if (node.type === "text") {
      text += node.data || "";
    } else if (node.nodes) {
      text += ricosNodesToText(node.nodes);
    }
  }
  return text;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Extract plain text from Ricos format (useful for previews)
 */
export function ricosToText(ricos: any): string {
  if (!ricos || !ricos.nodes) return "";
  
  let text = "";
  for (const node of ricos.nodes) {
    text += ricosNodesToText(node.nodes);
  }
  return text;
}
