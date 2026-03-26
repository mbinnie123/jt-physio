import { NextRequest, NextResponse } from "next/server";
import { blogDatabase } from "@/lib/blog-automation/db";
import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (openai) return openai;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

/**
 * Extract outbound links from section content and research data
 */
function extractOutboundLinks(
  sections: any[],
  researchData: any
): Array<{ title: string; url: string; source: string }> {
  const linkMap = new Map<string, { title: string; url: string; source: string }>();

  // Add research sources (deduplicated by URL)
  if (researchData?.sources) {
    researchData.sources.forEach((source: any) => {
      if (source.url && !linkMap.has(source.url)) {
        linkMap.set(source.url, {
          title: source.title || "Source",
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
    const content = typeof section.content === 'string' ? section.content : (section.contentHtml || '');
    while ((match = linkRegex.exec(content)) !== null) {
      const [, title, url] = match;
      if (!linkMap.has(url)) {
        linkMap.set(url, {
          title,
          url,
          source: section.title || "Content",
        });
      }
    }
  });

  return Array.from(linkMap.values());
}

interface RegenerateExtrasBody {
  draftId: string;
  topic: string;
  section?: "faqs" | "checklist" | "internalLinks" | "links" | "all";
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RegenerateExtrasBody;

    if (!body?.draftId || !body?.topic) {
      return NextResponse.json(
        { error: "draftId and topic are required" },
        { status: 400 }
      );
    }

    const draft = blogDatabase.getDraft(body.draftId);
    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    const sections = (draft.sections || []).filter(s => s && s.title && s.contentHtml);
    if (sections.length === 0) {
      return NextResponse.json(
        { error: "No written sections found to analyse" },
        { status: 400 }
      );
    }

    // Filter research data to only include selected sources
    const selectedSourceIds = draft.selectedSourceIds || [];
    const filteredResearchData = {
      ...draft.researchData,
      sources: (draft.researchData?.sources || []).filter((source: any) => {
        const sourceId = source.url || `${source.title || "source"}-${source.source || "unknown"}`;
        return selectedSourceIds.includes(sourceId);
      }),
    };

    const requestedSection = body.section || "all";
    const shouldGenerateFaqs = requestedSection === "all" || requestedSection === "faqs";
    const shouldGenerateChecklist = requestedSection === "all" || requestedSection === "checklist";
    const shouldGenerateInternalLinks = requestedSection === "all" || requestedSection === "internalLinks";
    const shouldGenerateLinks = requestedSection === "all" || requestedSection === "links";

    // Extract key information from sections (reuse for all prompts)
    const sectionSummaries = sections
      .map(s => `**${s.title}**\n${(s.contentHtml || '').replace(/<[^>]*>/g, '').substring(0, 300)}`)
      .join("\n\n");

    let faqs: Array<{ question: string; answer: string }> = [];
    let checklist: string[] = [];
    let internalLinks: Array<{ title: string; url: string; relevance: string }> = [];
    let outboundLinks: any[] = [];

    // Generate content-specific FAQs only if requested
    if (shouldGenerateFaqs) {
      const faqPrompt = `Based on this blog post about "${body.topic}", generate 5 specific, insightful FAQs that readers would likely ask after reading this content. Make them specific to the information covered, not generic.

Blog Content Summary:
${sectionSummaries}

Format your response as a JSON array with this structure:
[
  { "question": "specific question based on content", "answer": "detailed answer" },
  ...
]

Generate FAQs that:
- Address specific challenges mentioned in the content
- Provide actionable next steps
- Answer "how", "why", and "when" questions related to the topic
- Reference specific treatments, techniques, or advice mentioned`;

      const faqResponse = await getOpenAIClient().chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert physiotherapy content creator. Generate insightful FAQs based on blog content.",
          },
          {
            role: "user",
            content: faqPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      try {
        const faqText = faqResponse.choices[0]?.message?.content || "[]";
        const jsonMatch = faqText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (jsonMatch) {
          faqs = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error("Failed to parse FAQs:", error);
      }
    }

    // Generate content-specific checklist only if requested
    if (shouldGenerateChecklist) {
      const checklistPrompt = `Based on this blog post about "${body.topic}", create a specific, actionable recovery or progress checklist that aligns with the content covered. Make it specific to what was discussed, not generic.

Blog Content Summary:
${sectionSummaries}

Format your response as a JSON array of strings:
["Step 1", "Step 2", ...]

Create checklist items that:
- Follow a logical progression from the content
- Include specific techniques, exercises, or advice mentioned
- Are actionable and measurable
- Reflect the actual treatment/recovery pathway discussed
- Include 8-10 items`;

      const checklistResponse = await getOpenAIClient().chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert physiotherapy consultant. Create specific checklists based on blog content.",
          },
          {
            role: "user",
            content: checklistPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      try {
        const checklistText = checklistResponse.choices[0]?.message?.content || "[]";
        const jsonMatch = checklistText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          checklist = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error("Failed to parse checklist:", error);
      }
    }

    // Generate internal links (cross-linking suggestions) only if requested
    if (shouldGenerateInternalLinks) {
      const internalLinksPrompt = `Based on this blog post about "${body.topic}", suggest 3-5 internal links to other related blog posts that would be helpful for readers.

Blog Content Summary:
${sectionSummaries}

Consider these related physiotherapy topics for internal linking:
- ACL recovery
- Rehabilitation exercises
- Injury prevention
- Postoperative care
- Pain management
- Mobility restoration
- Preventative physiotherapy

Format your response as a JSON array with this structure:
[
  { "title": "blog post title", "url": "/blog/topic-slug", "relevance": "brief explanation of why this link is relevant" },
  ...
]

Generate internal links that:
- Are topically related to the main content
- Would provide additional value to readers
- Use logical URL slugs based on standard blog naming conventions
- Explain the relevance clearly`;

      try {
        const internalLinksResponse = await getOpenAIClient().chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO and content strategist. Suggest internal links for blog posts.",
            },
            {
              role: "user",
              content: internalLinksPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        });

        const internalLinksText = internalLinksResponse.choices[0]?.message?.content || "[]";
        const internalLinksMatch = internalLinksText.match(/\[[\s\S]*\]/);
        if (internalLinksMatch) {
          internalLinks = JSON.parse(internalLinksMatch[0]);
        }
      } catch (error) {
        console.error("Failed to generate internal links:", error);
      }
    }

    // Extract outbound links only if requested
    if (shouldGenerateLinks) {
      outboundLinks = extractOutboundLinks(sections, filteredResearchData);
    }

    // Build response with only generated sections
    const responseData: any = {
      success: true,
    };
    if (shouldGenerateFaqs) responseData.faqs = faqs;
    if (shouldGenerateChecklist) responseData.checklist = checklist;
    if (shouldGenerateInternalLinks) responseData.internalLinks = internalLinks;
    if (shouldGenerateLinks) responseData.outboundLinks = outboundLinks;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Regenerate extras error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate extras" },
      { status: 500 }
    );
  }
}
