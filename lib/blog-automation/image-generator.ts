import "server-only";
import OpenAI from "openai";

/**
 * Build a detailed, context-aware prompt from section content
 */
function buildDetailedPrompt(
  sectionTitle: string,
  sectionContent: string,
  topic: string,
  keywords: string[]
): string {
  // Extract key concepts from content (first 2-3 sentences)
  const contentPreview = sectionContent
    .split(".")
    .slice(0, 2)
    .join(".")
    .substring(0, 300);

  // Build a rich, visual prompt
  const prompt = `Create a professional, medical-illustration style image for a physiotherapy blog post section titled "${sectionTitle}" about "${topic}".

The section covers: ${contentPreview}

Key concepts to visualize: ${keywords.slice(0, 5).join(", ")}

Requirements:
- Clean, professional medical illustration style
- Shows practical application or anatomical relevance
- Includes people demonstrating exercises or movements when appropriate
- Professional color palette suitable for healthcare content
- High quality, suitable for web use
- Focus on clarity and educational value
- No text or watermarks on the image

Create an illustration that clearly represents the key concepts discussed in this section.`;

  return prompt;
}

/**
 * Generate an image for a blog section using OpenAI DALL-E 3
 */
export async function generateBlogImage(
  sectionTitle: string,
  keywords: string[] = [],
  sectionContent: string = "",
  topic: string = sectionTitle
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[ImageGen] OPENAI_API_KEY not configured");
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });

    // Build detailed prompt from section content
    const prompt = buildDetailedPrompt(sectionTitle, sectionContent, topic, keywords);

    console.log(`[ImageGen] Generating image for section: "${sectionTitle}"`);
    console.log(`[ImageGen] Using DALL-E 3...`);

    // Generate image using DALL-E 3
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    if (response.data && response.data.length > 0) {
      const imageUrl = response.data[0].url;
      if (imageUrl) {
        console.log(`[ImageGen] ✓ Generated image successfully: ${imageUrl}`);
        return imageUrl;
      }
    }

    console.warn("[ImageGen] No image URL in DALL-E 3 response");
    return null;
  } catch (error) {
    console.error("[ImageGen] Error generating image with DALL-E 3:", error);
    return null;
  }
}

