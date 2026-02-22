import "server-only";

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_LOCATION || "us-central1";
const STORAGE_BUCKET = process.env.GCP_IMAGE_STORAGE_BUCKET || "gs://jt-physio-images";

/**
 * Extract bucket name from gs:// URL
 */
function getBucketName(storagePath: string): string {
  if (storagePath.startsWith("gs://")) {
    return storagePath.replace("gs://", "");
  }
  return storagePath;
}

/**
 * Generate an image for a blog post using Google Vertex AI Imagen and upload to GCS
 */
export async function generateBlogImage(topic: string, keywords: string[]): Promise<string | null> {
  if (!PROJECT_ID) {
    console.error("GCP_PROJECT_ID not configured");
    return null;
  }

  try {
    // Construct a detailed prompt from topic and keywords
    const prompt = buildImagePrompt(topic, keywords);

    console.log(`[ImageGen] Generating image for: ${topic}`);
    console.log(`[ImageGen] Prompt: ${prompt}`);
    console.log(`[ImageGen] Project: ${PROJECT_ID}, Location: ${LOCATION}`);

    // Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error("[ImageGen] Failed to get GCP access token");
      return null;
    }

    // Call Vertex AI Imagen API directly via REST
    const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;
    console.log(`[ImageGen] API URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          safetyFilterLevel: "block_some",
          personGenerationConfig: {
            denyAdult: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[ImageGen] API error: ${response.status} - ${error}`);
      return null;
    }

    const data = await response.json() as { predictions?: unknown[] };
    
    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0] as { bytesBase64Encoded?: string };
      if (prediction.bytesBase64Encoded) {
        console.log(`[ImageGen] ✓ Generated image successfully, uploading to GCS...`);
        
        // Upload to GCS and get public URL
        const publicUrl = await uploadImageToGCS(
          prediction.bytesBase64Encoded,
          topic,
          keywords
        );
        
        if (publicUrl) {
          console.log(`[ImageGen] ✓ Image uploaded: ${publicUrl}`);
          return publicUrl;
        }
      }
    }

    console.warn("No predictions in Vertex AI Imagen response");
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

/**
 * Upload base64 image to GCS bucket and return signed public URL
 */
async function uploadImageToGCS(
  base64Image: string,
  topic: string,
  keywords: string[]
): Promise<string | null> {
  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { Storage } = await import("@google-cloud/storage");
      
      const storage = new Storage({
        projectId: PROJECT_ID,
      });

      const bucketName = getBucketName(STORAGE_BUCKET);
      const bucket = storage.bucket(bucketName);

      // Generate filename from topic and keywords
      const sanitizedTopic = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      
      const timestamp = Date.now();
      const filename = `blog-images/${sanitizedTopic}-${timestamp}.png`;

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Image, "base64");

      const file = bucket.file(filename);

      console.log(`[ImageGen] Uploading to GCS (attempt ${attempt}/${maxRetries})...`);

      // Upload and make file publicly readable
      await file.save(buffer, {
        metadata: {
          contentType: "image/png",
        },
        timeout: 30000, // Increase timeout to 30 seconds
      });

      // Make file public (permanently accessible without token)
      await file.makePublic();

      console.log(`[ImageGen] ✓ Uploaded to GCS: gs://${bucketName}/${filename}`);

      // Generate permanent public URL (no expiration)
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

      console.log(`[ImageGen] ✓ Generated public URL (permanent)`);
      return publicUrl;
    } catch (error) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[ImageGen] GCS upload attempt ${attempt} failed:`, errorMsg);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[ImageGen] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("[ImageGen] GCS upload failed after all retries:", lastError);
  return null;
}

/**
 * Get access token for Vertex AI API using Application Default Credentials
 */
async function getAccessToken(): Promise<string> {
  try {
    // Use google-auth-library to get access token from Application Default Credentials
    const { GoogleAuth } = await import("google-auth-library");
    
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      console.error("[ImageGen] No access token retrieved from credentials");
      return "";
    }
    
    console.log("[ImageGen] Access token obtained successfully");
    return accessToken.token;
  } catch (error) {
    console.error("[ImageGen] Failed to get access token:", error);
    return "";
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
High resolution, suitable for blog cover image. Medical/wellness themed. 
Photography style, realistic, professional lighting.`;
}
