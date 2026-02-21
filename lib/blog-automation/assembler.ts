import { BlogSection } from "./writer";
import { ResearchData } from "./research";
import { BlogMetadata } from "./db";

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  featuredImageUrl?: string;
  content: string;
  sections: BlogSection[];
  faqs: Array<{ question: string; answer: string }>;
  checklist: string[];
  outboundLinks: Array<{ title: string; url: string; source: string }>;
  metadata: BlogMetadata;
  location?: string;
  sport?: string;
  researchData?: ResearchData;
}

/**
 * Assemble individual sections into a complete blog post with all metadata
 */
export function assembleBlogPost(
  topic: string,
  sections: BlogSection[],
  metadata: BlogMetadata,
  researchData: ResearchData,
  selectedSourceIds?: string[],
  options?: { location?: string; sport?: string }
): BlogPost {
  const content = assembleBlogContent(sections);
  const readTime = calculateReadTime(content);
  const location = options?.location?.trim() || undefined;
  const sport = options?.sport?.trim() || undefined;
  
  // Filter research sources if selectedSourceIds provided
  let filteredResearchData = researchData;
  if (selectedSourceIds && selectedSourceIds.length > 0) {
    filteredResearchData = {
      ...researchData,
      sources: researchData.sources.filter((source: any) => {
        const sourceId = source.url || `${source.title}-${researchData.sources.indexOf(source)}`;
        return selectedSourceIds.includes(sourceId);
      }),
    };
  }

  const metadataWithContext = enrichMetadata(metadata, {
    topic,
    location,
    sport,
    researchData: filteredResearchData,
    selectedSources: filteredResearchData.sources || [],
  });

  const outboundLinks = extractOutboundLinks(sections, filteredResearchData);
  const faqs = generateFAQs(topic, sections, filteredResearchData);
  const checklist = generateChecklist(topic, sections);

  const basePublishDate = metadataWithContext.publishDate || new Date().toISOString().split("T")[0];
  const updatedMetadata: BlogMetadata = {
    ...metadataWithContext,
    author: metadataWithContext.author || "JT Physiotherapy",
    publishDate: basePublishDate,
    readTime,
    category: metadataWithContext.category || "Health & Wellness",
    featured: metadataWithContext.featured ?? false,
    faqs,
    checklist,
    outboundLinks,
  };

  return {
    title: updatedMetadata.title,
    slug: updatedMetadata.slug,
    excerpt: updatedMetadata.excerpt,
    seoTitle: updatedMetadata.seoTitle,
    seoDescription: updatedMetadata.seoDescription,
    seoKeywords: updatedMetadata.seoKeywords,
    featuredImageUrl: updatedMetadata.featuredImageUrl,
    content,
    sections,
    faqs,
    checklist,
    outboundLinks,
    metadata: updatedMetadata,
    location,
    sport,
    researchData,
  };
}

/**
 * Combine sections into Markdown content
 */
function assembleBlogContent(sections: BlogSection[]): string {
  return sections
    .map((section) => {
      // Handle both Ricos objects and string content
      let content = '';
      if (typeof section.content === 'string') {
        content = section.content;
      } else if (section.contentHtml) {
        // If Ricos format, use the HTML version and strip tags for markdown
        content = section.contentHtml.replace(/<[^>]*>/g, '');
      } else {
        content = 'No content available';
      }
      return `## ${section.title}\n\n${content}\n\n`;
    })
    .join("");
}

/**
 * Extract outbound links from sections and research sources
 */
function extractOutboundLinks(
  sections: BlogSection[],
  researchData: ResearchData
): Array<{ title: string; url: string; source: string }> {
  const linkMap = new Map<string, { title: string; url: string; source: string }>();

  // Add research sources (deduplicated by URL)
  if (researchData.sources) {
    researchData.sources.forEach((source: any) => {
      if (source.url && !linkMap.has(source.url)) {
        linkMap.set(source.url, {
          title: source.title,
          url: source.url,
          source: source.source || "Research",
        });
      }
    });
  }

  // Extract links from section content (markdown URLs, also deduplicated)
  sections.forEach((section) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    // Use contentHtml if available (Ricos format), otherwise use content as string
    const content = typeof section.content === 'string' ? section.content : (section.contentHtml || '');
    while ((match = linkRegex.exec(content)) !== null) {
      const [, title, url] = match;
      if (!linkMap.has(url)) {
        linkMap.set(url, {
          title,
          url,
          source: section.title,
        });
      }
    }
  });

  return Array.from(linkMap.values());
}

/**
 * Extract condition name from topic (removes case study suffix)
 * E.g., "Neck Pain and Cardiff City striker Yousef Salech Neck Pain Case Study" → "Neck Pain"
 */
function extractConditionName(topic: string): string {
  // If topic contains "and", take only the part before "and"
  if (topic.includes(" and ")) {
    return topic.split(" and ")[0].trim();
  }
  
  // If topic ends with common case study patterns, remove them
  const caseStudyPatterns = [
    / Case Study$/i,
    / Example$/i,
    / Story$/i,
    / Experience$/i,
  ];
  
  for (const pattern of caseStudyPatterns) {
    if (pattern.test(topic)) {
      return topic.replace(pattern, "").trim();
    }
  }
  
  return topic;
}

/**
 * Generate FAQ section from content and research
 */
function generateFAQs(
  topic: string,
  sections: BlogSection[],
  researchData: ResearchData
): Array<{ question: string; answer: string }> {
  // Extract just the condition name (e.g., "Neck Pain" from "Neck Pain and Cardiff City striker Yousef Salech Neck Pain Case Study")
  const conditionName = extractConditionName(topic);

  // Common physiotherapy questions
  const commonFAQs = [
    {
      question: `What should I expect when treating ${conditionName}?`,
      answer: `Treatment depends on severity. Initially, expect assessment, personalized exercises, and advice. Most patients see improvement within 2-4 weeks of consistent treatment.`,
    },
    {
      question: `How long does recovery from ${conditionName} typically take?`,
      answer: `Recovery varies by individual and severity. Mild cases may resolve in weeks, while complex cases may require several months of targeted physiotherapy.`,
    },
    {
      question: `Can physiotherapy prevent ${conditionName} from returning?`,
      answer: `Yes. Strengthening exercises, proper posture, and ergonomic adjustments significantly reduce recurrence risk.`,
    },
    {
      question: `Is ${conditionName} painful to treat?`,
      answer: `Physiotherapy aims to reduce pain progressively. Some discomfort is normal during rehabilitation, but treatment should not cause sharp pain.`,
    },
  ];

  return commonFAQs;
}

/**
 * Generate a recovery checklist
 */
function generateChecklist(
  topic: string,
  sections: BlogSection[]
): string[] {
  return [
    "✓ Schedule assessment with qualified physiotherapist",
    "✓ Follow personalized exercise program daily",
    "✓ Apply ice/heat as advised for pain management",
    "✓ Maintain proper posture throughout the day",
    "✓ Avoid activities that aggravate symptoms",
    "✓ Attend all scheduled therapy sessions",
    "✓ Track pain levels and progress in journal",
    "✓ Strengthen supporting muscle groups",
    "✓ Practice relaxation and stress management",
    "✓ Return to activities gradually as cleared",
  ];
}

/**
 * Calculate estimated reading time in minutes
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate URL-friendly slug from topic
 */
function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

type ResearchSource = ResearchData["sources"][number];

interface MetadataContext {
  topic: string;
  location?: string;
  sport?: string;
  researchData: ResearchData;
  selectedSources: ResearchSource[];
}

function enrichMetadata(
  base: BlogMetadata,
  context: MetadataContext
): BlogMetadata {
  const { topic, location, sport, researchData, selectedSources } = context;
  const normalizedTopic = topic.trim();
  const locationPhrase = location ? ` in ${location}` : "";
  const sportPhrase = sport ? ` for ${sport}` : "";
  const citedSources = formatSourceList(selectedSources);
  const sourceSentence = citedSources
    ? ` Insights referenced from ${citedSources}.`
    : "";

  const defaultTitle = location
    ? `${normalizedTopic} Physiotherapy in ${location}`
    : sport
    ? `${normalizedTopic} Support for ${sport}`
    : `${normalizedTopic} Treatment Guide`;

  const defaultSeoTitle = `${normalizedTopic}${sportPhrase}${
    location ? ` | ${location}` : ""
  } | JT Physiotherapy`;

  const excerptFallback = `Comprehensive guide to ${normalizedTopic}${sportPhrase}${locationPhrase}, covering causes, recovery timelines, and prevention strategies.${sourceSentence}`;
  const descriptionFallback = `Discover how JT Physiotherapy treats ${normalizedTopic}${
    sport ? ` impacting ${sport} athletes` : ""
  }${locationPhrase ? ` across ${location}` : ""} with evidence-based rehab plans.${sourceSentence}`;

  const shouldReplaceTitle =
    !base.title || base.title.trim().toLowerCase() === normalizedTopic.toLowerCase();
  const shouldReplaceSeoTitle =
    !base.seoTitle || base.seoTitle.trim().toLowerCase() === normalizedTopic.toLowerCase();
  const baseSlug = (base.slug || "").trim();
  const defaultSlug = generateSlug(normalizedTopic);
  const slugSeed = [normalizedTopic, sport, location].filter(Boolean).join(" ");
  const contextualSlug = slugSeed ? generateSlug(slugSeed) : defaultSlug;
  const slugNeedsUpdate = !baseSlug || baseSlug === defaultSlug;

  const keywordSet = new Set(base.seoKeywords || []);
  const addKeyword = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim();
    if (trimmed) {
      keywordSet.add(trimmed);
    }
  };

  addKeyword(normalizedTopic);
  addKeyword(`${normalizedTopic} physiotherapy`);
  addKeyword(`${normalizedTopic} treatment`);

  if (location) {
    addKeyword(location);
    addKeyword(`${normalizedTopic} ${location}`);
    addKeyword(`physiotherapy ${location}`);
    location
      .split(/[|,]/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach(addKeyword);
  }

  if (sport) {
    addKeyword(sport);
    addKeyword(`${sport} injury`);
    addKeyword(`${sport} rehabilitation`);
  }

  (researchData.keywords || []).forEach(addKeyword);
  selectedSources
    .map((source) => source.source || extractHost(source.url) || source.title)
    .filter(Boolean)
    .forEach((label) => addKeyword(label as string));

  return {
    ...base,
    title: shouldReplaceTitle ? defaultTitle : base.title,
    slug: slugNeedsUpdate ? contextualSlug : base.slug,
    excerpt: base.excerpt?.trim() ? base.excerpt : excerptFallback,
    seoTitle: shouldReplaceSeoTitle ? defaultSeoTitle : base.seoTitle,
    seoDescription: base.seoDescription?.trim()
      ? base.seoDescription
      : descriptionFallback,
    seoKeywords: Array.from(keywordSet).slice(0, 20),
  };
}

function formatSourceList(sources: ResearchSource[]): string {
  const labels = sources
    .map((source) => source.source || extractHost(source.url) || source.title)
    .filter((label): label is string => Boolean(label))
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (labels.length === 0) {
    return "";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function extractHost(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/**
 * Format blog post for HTML output
 */
export function formatAsHTML(post: BlogPost): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${post.seoDescription}">
  <meta name="keywords" content="${post.seoKeywords.join(", ")}">
  <title>${post.seoTitle} | JT Physiotherapy</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #374151; }
    h1 { color: #111827; font-size: 2.25em; margin-bottom: 0.5em; }
    h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 2.5rem; }
    h3 { color: #374151; margin-top: 1.5rem; font-size: 1.5em; }
    ul, ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    p { margin-bottom: 1.25rem; }
    a { color: #2563eb; text-decoration: underline; }
    .meta { color: #6b7280; font-size: 0.9em; margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; }
    dt { font-weight: bold; margin-top: 1rem; }
    dd { margin-left: 0; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <article>
    <header>
      <h1>${post.title}</h1>
      <p class="meta">
        By ${post.metadata.author || "JT Physiotherapy"} | 
        ${post.metadata.publishDate} | 
        ${post.metadata.readTime} min read
      </p>
    </header>
    
    <main>
      ${post.sections
        .map(
          (section) => {
            // Use contentHtml for Ricos format, or format string content
            const contentHtml = typeof section.content === 'string' 
              ? formatMarkdownToHTML(section.content)
              : (section.contentHtml || 'No content');
            return `
        <section>
          <h2>${section.title}</h2>
          ${contentHtml}
        </section>
      `;
          }
        )
        .join("")}

      ${post.faqs.length > 0 ? `
        <section>
          <h2>Frequently Asked Questions</h2>
          <dl>
            ${post.faqs.map(f => `<dt>${f.question}</dt><dd>${f.answer}</dd>`).join("")}
          </dl>
        </section>
      ` : ""}

      ${post.checklist.length > 0 ? `
        <section>
          <h2>Recovery Checklist</h2>
          <ul>
            ${post.checklist.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      ` : ""}

      ${post.outboundLinks.length > 0 ? `
        <section>
          <h2>Sources & Further Reading</h2>
          <ul>
            ${post.outboundLinks.map(link => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.source}: ${link.title}</a></li>`).join("")}
          </ul>
        </section>
      ` : ""}
    </main>
  </article>
</body>
</html>`;
}

/**
 * Format blog post for Markdown output
 */
export function formatAsMarkdown(post: BlogPost): string {
  let markdown = `# ${post.title}\n\n`;
  markdown += `*By ${post.metadata.author || "JT Physiotherapy"} | ${post.metadata.publishDate} | ${post.metadata.readTime} min read*\n\n`;
  markdown += `---\n\n`;

  for (const section of post.sections) {
    // Handle both Ricos objects and string content
    let content = '';
    if (typeof section.content === 'string') {
      content = section.content;
    } else if (section.contentHtml) {
      // If Ricos format, use the HTML version and strip tags for markdown
      content = section.contentHtml.replace(/<[^>]*>/g, '');
    } else {
      content = 'No content available';
    }
    markdown += `## ${section.title}\n\n${content}\n\n`;
  }

  if (post.faqs.length > 0) {
    markdown += `## Frequently Asked Questions\n\n`;
    for (const faq of post.faqs) {
      markdown += `### ${faq.question}\n${faq.answer}\n\n`;
    }
  }

  if (post.checklist.length > 0) {
    markdown += `## Recovery Checklist\n\n`;
    for (const item of post.checklist) {
      markdown += `- ${item}\n`;
    }
    markdown += `\n`;
  }

  if (post.outboundLinks.length > 0) {
    markdown += `## Sources & Further Reading\n\n`;
    for (const link of post.outboundLinks) {
      markdown += `- ${link.source}: ${link.title}\n`;
    }
  }

  return markdown;
}

/**
 * Simple markdown to HTML converter
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Handle [H3] style headers (seen in drafts)
  html = html.replace(/\[H([1-6])\](.*?)\[\/H\1\]/gi, "<h$1>$2</h$1>");

  // Standard Markdown Headers (handle potential missing space)
  html = html.replace(/^### ?(.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## ?(.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# ?(.*$)/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Lists - convert lines starting with * or - to li
  html = html.replace(/^[\*\-] (.*$)/gm, "<li>$1</li>");
  
  // Wrap adjacent li elements in ul
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>\n$1</ul>\n");

  // Paragraphs - split by double newlines to avoid wrapping block elements
  const blocks = html.split(/\n\s*\n/);
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    // If block starts with an HTML tag that shouldn't be wrapped
    if (trimmed.match(/^<(h[1-6]|ul|ol|p|div|blockquote|pre|table|section)/i)) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return processedBlocks.join("\n\n");
}

/**
 * Validate blog post structure
 */
export function validateBlogPost(post: BlogPost): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!post.title || post.title.trim().length === 0) {
    errors.push("Blog post must have a title");
  }

  if (!post.slug || post.slug.trim().length === 0) {
    errors.push("Blog post must have a slug");
  }

  if (post.sections.length === 0) {
    errors.push("Blog post must have at least one section");
  }

  if (!post.content || post.content.trim().length < 300) {
    errors.push("Blog post content is too short (minimum 300 characters)");
  }

  if (!post.metadata.publishDate) {
    errors.push("Blog post must have a publish date");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
