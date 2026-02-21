import { NextRequest, NextResponse } from "next/server";
import { blogDatabase } from "@/lib/blog-automation/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allDrafts = blogDatabase.getAllDrafts();
    
    return NextResponse.json({
      success: true,
      totalDrafts: allDrafts.length,
      drafts: allDrafts.map(draft => ({
        id: draft.id,
        topic: draft.topic,
        status: draft.status,
        sectionsCount: draft.sections?.length || 0,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
