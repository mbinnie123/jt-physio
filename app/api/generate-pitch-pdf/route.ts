import { NextRequest, NextResponse } from "next/server";
import { generatePitchPDF } from "@/lib/pdf-generator/pitch-pdf";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipientName = searchParams.get("recipientName") || undefined;
    const recipientOrganization = searchParams.get("recipientOrganization") || undefined;

    const pdfBuffer = await generatePitchPDF({
      recipientName: recipientName || undefined,
      recipientOrganization: recipientOrganization || undefined,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="JT-Football-Physiotherapy-Pitch.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
