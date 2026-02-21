import "server-only";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = "us-central1";

/**
 * Generate an image for a blog post using Google Vertex AI Imagen
 */
export async function generateBlogImage(topic: string, keywords: string[]): Promise<string | null> {
  if (!PROJECT_ID) {
    console.error("GOOGLE_CLOUD_PROJECT_ID not configured");
    return null;
  }

  try {
    // Construct a detailed prompt from topic and keywords
    const prompt = buildImagePrompt(topic, keywords);
    
    console.log(`[ImageGen] Generating image for: ${topic}`);
    console.log(`[ImageGen] Prompt: ${prompt}`);

    // Get access token for Vertex AI API
    const accessToken = await getVertexAccessToken();
    if (!accessToken) {
      console.error("Could not get access token for Vertex AI");
      return null;
    }

    // Call Vertex AI Imagen API
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            sampleCount: 1,
          },
        ],
        parameters: {
          sampleCount: 1,
          safetyFilterLevel: "block_medium_and_above",
          personGenerationConfig: {
            denyPersonGeneration: false,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Vertex AI Imagen error:", error);
      return null;
    }

    const data = (await response.json()) as any;
    
    // Extract the generated image URL
    const imageUrl = data?.predictions?.[0]?.imageUri;
    
    if (imageUrl) {
      console.log(`[ImageGen] ✓ Generated image: ${imageUrl}`);
      return imageUrl;
    }

    console.warn("No image URL in Vertex AI response");
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

/**
 * Build a detailed, professional prompt for image generation
 */
function buildImagePrompt(topic: string, keywords: string[]): string {
  const keywordStr = keywords.slice(0, 5).join(", ");
  
  return `Professional, high-quality blog header image for a physiotherapy article about "${topic}". 
Keywords: ${keywordStr}. 
Style: Modern healthcare aesthetic, clean, professional, inspiring. 
Include relevant medical/physiotherapy elements. Show people, movement, or healing. 
High resolution, suitable for blog cover image. Medical/wellness themed.`;
}

/**
 * Get an access token for Vertex AI API calls
 */
async function getVertexAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity", {
      headers: {
        "Metadata-Flavor": "Google",
      },
    });

    if (!response.ok) {
      // In local development or non-GCP environment, try using GOOGLE_APPLICATION_CREDENTIALS
      console.warn("Could not get identity token from metadata service");
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn("Metadata service not available (expected in local dev)");
    return null;
  }
}

/**
 * Alternative: Use generative AI client if available
 */
export async function generateBlogImageWithClient(topic: string, keywords: string[]): Promise<string | null> {
  try {
    // Try importing the generative AI library
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_GENERATIVE_AI_API_KEY not set");
      return null;
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = buildImagePrompt(topic, keywords);
    
    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: prompt,
        }],
      }],
    });

    const content = response.response.text();
    console.log(`[ImageGen] Generated description: ${content.substring(0, 100)}...`);
    
    // Note: This would return a text description, not an actual image
    // For actual image generation, you'd need to use a service like DALL-E or Imagen
    return null;
  } catch (error) {
    console.warn("Generative AI client not available or error:", error instanceof Error ? error.message : error);
    return null;
  }
}
