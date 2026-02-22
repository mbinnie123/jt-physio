import { NextRequest, NextResponse } from "next/server";
import { blogDatabase, type BlogDraft } from "@/lib/blog-automation/db";

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const draftId = typeof body?.draftId === "string" ? body.draftId : undefined;

    if (!draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 });
    }

    const draft = blogDatabase.getDraft(draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const updates: Partial<BlogDraft> = {};
    const wantsSourceUpdate = Object.prototype.hasOwnProperty.call(
      body,
      "selectedSourceIds"
    );

    if (wantsSourceUpdate) {
      if (!Array.isArray(body.selectedSourceIds)) {
        return NextResponse.json(
          { error: "selectedSourceIds must be an array" },
          { status: 400 }
        );
      }

      const sanitized = body.selectedSourceIds
        .filter((value: unknown): value is string => typeof value === "string")
        .map((value: string) => value.trim())
        .filter(Boolean);

      updates.selectedSourceIds = sanitized;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedDraft = blogDatabase.updateDraft(draftId, updates);
    if (!updatedDraft) {
      return NextResponse.json(
        { error: "Failed to update draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (error) {
    console.error("Draft PATCH error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
