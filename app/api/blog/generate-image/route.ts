import { NextRequest, NextResponse } from "next/server";
import { generateBlogImage } from "@/lib/blog-automation/image-generator";

export async function POST(request: NextRequest) {
  try {
    const { sectionTitle, keywords, sectionContent, topic } = await request.json();

    if (!sectionTitle) {
      return NextResponse.json(
        { error: "sectionTitle is required" },
        { status: 400 }
      );
    }

    // Generate image with section-specific content for better context
    const imageUrl = await generateBlogImage(
      sectionTitle,
      keywords || [],
      sectionContent || "",
      topic || sectionTitle
    );

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image. Check OpenAI API configuration." },
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
