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
    const wantsResearchDataUpdate = Object.prototype.hasOwnProperty.call(
      body,
      "researchData"
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

    if (wantsResearchDataUpdate) {
      const value = body.researchData;
      if (
        value !== null &&
        (typeof value !== "object" || Array.isArray(value))
      ) {
        return NextResponse.json(
          { error: "researchData must be an object or null" },
          { status: 400 }
        );
      }

      if (
        value &&
        !Array.isArray((value as { sources?: unknown }).sources)
      ) {
        return NextResponse.json(
          { error: "researchData.sources must be an array" },
          { status: 400 }
        );
      }

      updates.researchData = value;
    }

    if (Object.prototype.hasOwnProperty.call(body, "includeChecklist")) {
      if (typeof body.includeChecklist !== "boolean") {
        return NextResponse.json(
          { error: "includeChecklist must be a boolean" },
          { status: 400 }
        );
      }
      updates.includeChecklist = body.includeChecklist;
    }

    if (Object.prototype.hasOwnProperty.call(body, "includeFaq")) {
      if (typeof body.includeFaq !== "boolean") {
        return NextResponse.json(
          { error: "includeFaq must be a boolean" },
          { status: 400 }
        );
      }
      updates.includeFaq = body.includeFaq;
    }

    if (Object.prototype.hasOwnProperty.call(body, "includeInternalCta")) {
      if (typeof body.includeInternalCta !== "boolean") {
        return NextResponse.json(
          { error: "includeInternalCta must be a boolean" },
          { status: 400 }
        );
      }
      updates.includeInternalCta = body.includeInternalCta;
    }

    if (Object.prototype.hasOwnProperty.call(body, "includeOverview")) {
      if (typeof body.includeOverview !== "boolean") {
        return NextResponse.json(
          { error: "includeOverview must be a boolean" },
          { status: 400 }
        );
      }
      updates.includeOverview = body.includeOverview;
    }

    if (Object.prototype.hasOwnProperty.call(body, "includeAuthorTakeaway")) {
      if (typeof body.includeAuthorTakeaway !== "boolean") {
        return NextResponse.json(
          { error: "includeAuthorTakeaway must be a boolean" },
          { status: 400 }
        );
      }
      updates.includeAuthorTakeaway = body.includeAuthorTakeaway;
    }

    if (Object.prototype.hasOwnProperty.call(body, "authorTakeawayText")) {
      if (typeof body.authorTakeawayText !== "string") {
        return NextResponse.json(
          { error: "authorTakeawayText must be a string" },
          { status: 400 }
        );
      }
      updates.authorTakeawayText = body.authorTakeawayText;
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

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const draftId = typeof body?.draftId === "string" ? body.draftId : undefined;
    const draftIds = Array.isArray(body?.draftIds)
      ? body.draftIds
          .filter((value: unknown): value is string => typeof value === "string")
          .map((value: string) => value.trim())
          .filter(Boolean)
      : [];

    if (draftIds.length > 0) {
      const deletedIds: string[] = [];
      const notFoundIds: string[] = [];

      for (const id of draftIds) {
        if (blogDatabase.deleteDraft(id)) {
          deletedIds.push(id);
        } else {
          notFoundIds.push(id);
        }
      }

      if (deletedIds.length === 0) {
        return NextResponse.json({ error: "No drafts deleted" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        deletedIds,
        deletedCount: deletedIds.length,
        notFoundIds,
      });
    }

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId or draftIds is required" },
        { status: 400 }
      );
    }

    const deleted = blogDatabase.deleteDraft(draftId);
    if (!deleted) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draftId });
  } catch (error) {
    console.error("Draft DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
