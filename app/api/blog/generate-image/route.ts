import { NextRequest, NextResponse } from "next/server";
import { generateBlogImage } from "@/lib/blog-automation/image-generator";

export async function POST(request: NextRequest) {
  try {
    const { topic, keywords } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const imageUrl = await generateBlogImage(topic, keywords || []);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image. Make sure Vertex AI is configured." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
