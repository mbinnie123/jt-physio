import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check both formats: with or without "Bearer " prefix
    const isAuthorized = authHeader && (
      authHeader === adminPassword || 
      authHeader === `Bearer ${adminPassword}`
    );
    
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || "us";
    const dataStoreId = process.env.VERTEX_DATA_STORE_ID;

    if (!projectId || !dataStoreId) {
      return NextResponse.json(
        { error: "Missing Vertex configuration: GCP_PROJECT_ID or VERTEX_DATA_STORE_ID not set" },
        { status: 500 }
      );
    }

    // Get access token with explicit cloud-platform scope for Discovery Engine.
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      ...(credentialsPath ? { keyFilename: credentialsPath } : {}),
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const tokenValue =
      typeof accessToken === "string" ? accessToken : accessToken?.token;

    if (!tokenValue) {
      return NextResponse.json(
        { error: "Failed to obtain Google access token" },
        { status: 500 }
      );
    }

    // Fetch documents from Vertex Data Store
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/branches/default_branch/documents`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${tokenValue}`,
      },
      params: {
        pageSize: 100,
      },
    });

    const documents = (response.data.documents || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      displayName: doc.displayName || doc.name,
      uri: doc.uri,
      jsonData: doc.jsonData,
      content: doc.structData?.content || doc.content || "",
      title: doc.structData?.title || doc.displayName || "Untitled",
      excerpt: doc.structData?.excerpt || "",
      source: doc.structData?.source || "Vertex Data Store",
    }));

    return NextResponse.json({
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch Vertex documents:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const lowerMessage = message.toLowerCase();
    const authHint =
      lowerMessage.includes("invalid_grant") ||
      lowerMessage.includes("invalid jwt signature")
        ? "Google service-account key appears invalid or revoked. Generate a new key JSON for the configured service account and update GOOGLE_APPLICATION_CREDENTIALS."
        : lowerMessage.includes("invalid_scope")
        ? "OAuth scope or API audience mismatch. Ensure Discovery Engine API is enabled and credentials have cloud-platform scope."
        : undefined;

    return NextResponse.json(
      {
        error: "Failed to fetch Vertex documents",
        details: message,
        hint: authHint,
      },
      { status: 500 }
    );
  }
}
