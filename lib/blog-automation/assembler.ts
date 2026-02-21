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
      return `## ${section.title}\n\n${section.content}\n\n`;
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
  const links: Array<{ title: string; url: string; source: string }> = [];

  // Add research sources
  if (researchData.sources) {
    researchData.sources.forEach((source: any) => {
      if (source.url) {
        links.push({
          title: source.title,
          url: source.url,
          source: source.source || "Research",
        });
      }
    });
  }

  // Extract links from section content (markdown URLs)
  sections.forEach((section) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(section.content)) !== null) {
      const [, title, url] = match;
      if (!links.find((l) => l.url === url)) {
        links.push({
          title,
          url,
          source: section.title,
        });
      }
    }
  });

  return links;
}

/**
 * Generate FAQ section from content and research
 */
function generateFAQs(
  topic: string,
  sections: BlogSection[],
  researchData: ResearchData
): Array<{ question: string; answer: string }> {
  // Common physiotherapy questions
  const commonFAQs = [
    {
      question: `What should I expect when treating ${topic}?`,
      answer: `Treatment depends on severity. Initially, expect assessment, personalized exercises, and advice. Most patients see improvement within 2-4 weeks of consistent treatment.`,
    },
    {
      question: `How long does recovery from ${topic} typically take?`,
      answer: `Recovery varies by individual and severity. Mild cases may resolve in weeks, while complex cases may require several months of targeted physiotherapy.`,
    },
    {
      question: `Can physiotherapy prevent ${topic} from returning?`,
      answer: `Yes. Strengthening exercises, proper posture, and ergonomic adjustments significantly reduce recurrence risk.`,
    },
    {
      question: `Is ${topic} painful to treat?`,
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
          (section) => `
        <section>
          <h2>${section.title}</h2>
          ${formatMarkdownToHTML(section.content)}
        </section>
      `
        )
        .join("")}
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
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }

  return markdown;
}

/**
 * Simple markdown to HTML converter
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/### (.*?)\n/g, "<h3>$1</h3>\n");
  html = html.replace(/## (.*?)\n/g, "<h2>$1</h2>\n");
  html = html.replace(/# (.*?)\n/g, "<h1>$1</h1>\n");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Line breaks
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  // Lists
  html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*?<\/li>)/s, "<ul>$1</ul>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  return html;
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
