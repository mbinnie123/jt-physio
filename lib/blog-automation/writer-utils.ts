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
  
  for (let i = 0; i < ricos.nodes.length; i++) {
    const node = ricos.nodes[i];
    if (node.type === "heading") {
      const level = Math.min(Math.max(node.level || 3, 1), 6);
      const text = renderRicosInlineNodes(node.nodes || []);
      const style = getHeadingStyle(level);
      html += `<h${level} style="${style}">${text}</h${level}>\n`;
    } else if (node.type === "paragraph") {
      const paraHtml = renderRicosInlineNodes(node.nodes || []);
      if (paraHtml.trim()) {
        html += "<p>" + paraHtml + "</p>\n";
      }
    }
  }
  
  return html;
}

function renderRicosInlineNodes(nodes: any[]): string {
  let html = "";
  for (const inlineNode of nodes || []) {
    if (inlineNode.type === "text") {
      html += escapeHtml(inlineNode.data || "");
    } else if (inlineNode.type === "bold") {
      const boldText = renderRicosInlineNodes(inlineNode.nodes || []);
      html += `<strong>${boldText}</strong>`;
    } else if (inlineNode.type === "link") {
      const linkText = renderRicosInlineNodes(inlineNode.nodes || []);
      const href = inlineNode.href || "#";
      const target = inlineNode.target ? ` target="${inlineNode.target}"` : "";
      const rel = inlineNode.rel ? ` rel="${inlineNode.rel}"` : "";
      html += `<a href="${escapeHtml(href)}"${target}${rel} style="color:#2563EB;text-decoration:underline;">${linkText}</a>`;
    }
  }
  return html;
}

function getHeadingStyle(level: number): string {
  const sizes: { [key: number]: string } = {
    1: "2.25rem",    // 36px
    2: "1.875rem",   // 30px
    3: "1.5rem",     // 24px
    4: "1.25rem",    // 20px
    5: "1.125rem",   // 18px
    6: "1rem",       // 16px
  };
  const size = sizes[level] || sizes[3];
  return `font-size:${size};font-weight:600;margin-top:1.5rem;margin-bottom:0.75rem;line-height:1.3;`;
}

function ricosNodesToText(nodes: any[]): string {
  let text = "";
  for (const node of nodes || []) {
    if (node.type === "text") {
      text += node.data || "";
    } else if (node.type === "bold" || node.type === "link") {
      text += ricosNodesToText(node.nodes || []);
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

/**
 * Convert HTML to Ricos format
 * Handles headings (h1-h6), bold/strong, links, and paragraphs
 */
export function htmlToRicos(htmlContent: string): any {
  const nodes: any[] = [];
  
  if (!htmlContent || typeof htmlContent !== 'string') {
    return { nodes };
  }
  
  // Parse HTML using regex (simple approach - works for well-formed HTML)
  // Remove extra whitespace
  let html = htmlContent.replace(/>\s+</g, '><').trim();
  
  // Split by block-level elements
  const blockPattern = /(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<p[^>]*>[\s\S]*?<\/p>)/gi;
  const blocks = html.split(blockPattern).filter(b => b && b.trim());
  
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    
    // Heading
    const headingMatch = trimmed.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h\1>$/i);
    if (headingMatch) {
      const level = parseInt(headingMatch[1], 10);
      const content = headingMatch[2];
      nodes.push({
        type: "heading",
        level,
        nodes: parseHtmlInlineContent(content),
      });
      continue;
    }
    
    // Paragraph
    const paraMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>$/i);
    if (paraMatch) {
      const content = paraMatch[1];
      const inlineNodes = parseHtmlInlineContent(content);
      if (inlineNodes.length > 0) {
        nodes.push({
          type: "paragraph",
          nodes: inlineNodes,
        });
      }
      continue;
    }
    
    // Plain text wrapped in paragraph
    if (trimmed.length > 0) {
      nodes.push({
        type: "paragraph",
        nodes: parseHtmlInlineContent(trimmed),
      });
    }
  }
  
  return { nodes };
}

/**
 * Parse inline HTML content (bold, links, text)
 */
function parseHtmlInlineContent(html: string): any[] {
  const nodes: any[] = [];
  
  // Pattern for links, bold, and text
  const pattern = /(<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>|<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>|[^<]+|<[^>]+>)/gi;
  
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const full = match[0];
    
    // Link
    if (full.match(/^<a[^>]*href/i)) {
      const href = full.match(/href="([^"]*)"/i)?.[1] || "#";
      const text = full.replace(/<[^>]*>/g, '');
      if (text.trim()) {
        nodes.push({
          type: "link",
          href: href,
          target: "_blank",
          rel: "noopener noreferrer",
          nodes: [{ type: "text", data: text }],
        });
      }
    }
    // Bold
    else if (full.match(/^<(?:strong|b)[^>]*>/i)) {
      const text = full.replace(/<[^>]*>/g, '');
      if (text.trim()) {
        nodes.push({
          type: "bold",
          nodes: [{ type: "text", data: text }],
        });
      }
    }
    // Plain text
    else if (!full.match(/^</) && full.trim()) {
      nodes.push({
        type: "text",
        data: full,
      });
    }
  }
  
  return nodes.length > 0 ? nodes : [{ type: "text", data: "" }];
}

/**
 * Convert markdown-style content (including [H3] markers) into Ricos format
 */
export function convertToRicos(content: string): any {
  try {
    if (!content || typeof content !== 'string') {
      console.log("[convertToRicos] Invalid content input, returning empty nodes");
      return { nodes: [] };
    }

    const normalized = normalizeHeadingMarkers(content || "");
    const nodes: any[] = [];

    // Match heading tags, but NOT across newlines
    const headingPattern = /\[H([1-6])\](.*?)\[\/H\1\]/gi;
    let lastIndex = 0;
    let match;
    let matchCount = 0;

    try {
      while ((match = headingPattern.exec(normalized)) !== null) {
        if (matchCount > 10000) {
          console.warn("[convertToRicos] Too many heading matches (>10000), stopping");
          break;
        }
        
        if (!Number.isFinite(match.index) || !Number.isFinite(headingPattern.lastIndex)) {
          console.warn("[convertToRicos] Invalid match indices:", {
            matchIndex: match.index,
            lastIndex: headingPattern.lastIndex,
          });
          break;
        }

        const preceding = normalized.substring(lastIndex, match.index);
        appendParagraphNodes(preceding, nodes);

        const level = Math.min(Math.max(parseInt(match[1], 10) || 3, 1), 6);
        const headingText = match[2].trim();
        
        // Only create heading if it doesn't contain newlines (single line heading)
        if (headingText && !headingText.includes('\n')) {
          nodes.push(createHeadingNode(headingText, level));
        } else if (headingText) {
          // If heading contains newlines, treat as regular paragraph
          const lines = headingText.split('\n').filter(l => l.trim());
          for (const line of lines) {
            if (line.trim()) {
              nodes.push(createParagraphNode(line.trim()));
            }
          }
        }

        lastIndex = headingPattern.lastIndex;
        matchCount++;
      }
    } catch (matchError) {
      console.error("[convertToRicos] Error during heading pattern matching:", matchError);
      // Continue with what we have so far rather than crashing
    }

    const trailing = normalized.substring(lastIndex);
    appendParagraphNodes(trailing, nodes);

    return { nodes };
  } catch (error) {
    console.error("[convertToRicos] Unexpected error converting to Ricos:", {
      error: error instanceof Error ? error.message : String(error),
      contentLength: content?.length,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return minimal valid Ricos instead of crashing
    return { nodes: [] };
  }
}

function normalizeHeadingMarkers(text: string): string {
  let result = text;

  // Convert markdown-style headings into [Hn] markers (these should already capture single line)
  result = result.replace(/^######\s*([^\n]+?)$/gm, "[H6]$1[/H6]");
  result = result.replace(/^#####\s*([^\n]+?)$/gm, "[H5]$1[/H5]");
  result = result.replace(/^####\s*([^\n]+?)$/gm, "[H4]$1[/H4]");
  result = result.replace(/^###\s*([^\n]+?)$/gm, "[H3]$1[/H3]");
  result = result.replace(/^##\s*([^\n]+?)$/gm, "[H2]$1[/H2]");
  result = result.replace(/^#\s*([^\n]+?)$/gm, "[H1]$1[/H1]");

  // Handle bare [Hn] markers - match until newline only (not greedy, stop at newline)
  result = result.replace(/\[H([1-6])\]([^\[\n]*?)(?=\n|$)(?![^\n]*\[\/H\1\])/gi, (_match, level, headingText) => {
    const text = headingText.trim();
    return text ? `[H${level}]${text}[/H${level}]\n` : `[/H${level}]\n`;
  });

  // Ensure closing tags are followed by newlines if not already
  result = result.replace(/\[\/H([1-6])\]([^\n])/g, "[/H$1]\n$2");

  return result;
}

function appendParagraphNodes(text: string, nodes: any[]) {
  if (!text || !text.trim()) return;

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    nodes.push(createParagraphNode(paragraph));
  }
}

function createHeadingNode(text: string, level: number): any {
  return {
    type: "heading",
    level,
    nodes: createTextNodes(text.trim(), true), // skipLinks=true to prevent nested links in headings
  };
}

function createParagraphNode(text: string): any {
  return {
    type: "paragraph",
    nodes: createTextNodes(text),
  };
}

function createTextNodes(text: string, skipLinks: boolean = false): any[] {
  const nodes: any[] = [];
  
  // Defensive input validation
  if (!text || typeof text !== 'string') {
    console.log("[createTextNodes] Invalid text input, returning empty array");
    return [{
      type: "text",
      data: "",
    }];
  }
  
  try {
    // Process text for bold, links, and plain text
    // Pattern handles: **bold** and [text](url)
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const linkRegex = skipLinks ? /$(?!.)/ : /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g; // Disable link regex if skipLinks=true
    
    let lastIndex = 0;
    const matches: Array<{ type: 'bold' | 'link'; index: number; endIndex: number; value: any }> = [];
    
    // Collect all bold matches with defensive error handling
    let boldCount = 0;
    try {
      let match: RegExpExecArray | null;
      while ((match = boldRegex.exec(text)) !== null) {
        if (boldCount > 1000) {
          console.warn("[createTextNodes] Too many bold matches detected (>1000), stopping");
          break;
        }
        if (match.index < 0 || !Number.isFinite(match.index)) {
          console.warn("[createTextNodes] Invalid bold match index:", match.index);
          continue;
        }
        matches.push({
          type: 'bold',
          index: match.index,
          endIndex: match.index + match[0].length,
          value: match[1],
        });
        boldCount++;
      }
    } catch (boldError) {
      console.error("[createTextNodes] Error collecting bold matches:", boldError);
    }
    
    // Collect all link matches with defensive error handling
    let linkCount = 0;
    try {
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(text)) !== null) {
        if (linkCount > 1000) {
          console.warn("[createTextNodes] Too many link matches detected (>1000), stopping");
          break;
        }
        if (match.index < 0 || !Number.isFinite(match.index)) {
          console.warn("[createTextNodes] Invalid link match index:", match.index);
          continue;
        }
        matches.push({
          type: 'link',
          index: match.index,
          endIndex: match.index + match[0].length,
          value: { text: match[1], url: match[2] },
        });
        linkCount++;
      }
    } catch (linkError) {
      console.error("[createTextNodes] Error collecting link matches:", linkError);
    }
    
    // Sort by index with validation
    matches.sort((a, b) => {
      if (!Number.isFinite(a.index) || !Number.isFinite(b.index)) {
        console.warn("[createTextNodes] Non-finite indices in matches, returning 0");
        return 0;
      }
      return a.index - b.index;
    });
    
    // Build nodes from text and matches
    lastIndex = 0;
    for (const m of matches) {
      // Validate match object
      if (!Number.isFinite(m.index) || !Number.isFinite(m.endIndex)) {
        console.warn("[createTextNodes] Skipping match with invalid indices:", m);
        continue;
      }
      
      // Add plain text before this match
      if (m.index > lastIndex && m.index > 0) {
        const substring = text.substring(lastIndex, m.index);
        if (substring && substring.length > 0) {
          nodes.push({
            type: "text",
            data: substring,
          });
        }
      }
      
      // Add bold or link node
      if (m.type === 'bold') {
        nodes.push({
          type: "bold",
          nodes: [
            {
              type: "text",
              data: String(m.value || ""),
            },
          ],
        });
      } else if (m.type === 'link') {
        nodes.push({
          type: "link",
          href: String(m.value?.url || "#"),
          target: "_blank",
          rel: "noopener noreferrer",
          nodes: [
            {
              type: "text",
              data: String(m.value?.text || ""),
            },
          ],
        });
      }
      
      lastIndex = m.endIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      if (remaining && remaining.length > 0) {
        nodes.push({
          type: "text",
          data: remaining,
        });
      }
    }
    
    // If no nodes were created, add a plain text node
    if (nodes.length === 0) {
      nodes.push({
        type: "text",
        data: text,
      });
    }
    
    return nodes;
  } catch (error) {
    console.error("[createTextNodes] Unexpected error creating text nodes:", {
      error: error instanceof Error ? error.message : String(error),
      textLength: text?.length,
      skipLinks,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return fallback with original text
    return [{
      type: "text",
      data: text || "",
    }];
  }
}
