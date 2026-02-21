import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const WIX_API_KEY = process.env.WIX_API_KEY;
    const WIX_SITE_ID = process.env.WIX_SITE_ID;

    const diagnostics: any = {
      credentials: {
        apiKeySet: !!WIX_API_KEY,
        apiKeyLength: WIX_API_KEY?.length || 0,
        siteId: WIX_SITE_ID,
      },
      checks: {},
    };

    // Test 1: Check if we can reach Wix API
    try {
      const testClient = axios.create({
        baseURL: "https://www.wixapis.com/v1",
        headers: {
          Authorization: WIX_API_KEY,
          "Content-Type": "application/json",
        },
      });

      // Try to get site info
      const siteResponse = await testClient.get("/contacts/contacts", {
        params: { limit: 1 },
      });

      diagnostics.checks.wixApiReachable = {
        success: true,
        statusCode: siteResponse.status,
        message: "Can reach Wix API",
      };
    } catch (error) {
      diagnostics.checks.wixApiReachable = {
        success: false,
        error: axios.isAxiosError(error) ? error.response?.status : "Unknown",
        message: axios.isAxiosError(error) ? error.message : String(error),
      };
    }

    // Test 2: Check blog posts endpoint
    try {
      const testClient = axios.create({
        baseURL: "https://www.wixapis.com/v1",
        headers: {
          Authorization: WIX_API_KEY,
          "Content-Type": "application/json",
        },
      });

      const blogResponse = await testClient.get("/blogs/posts", {
        params: { limit: 1 },
      });

      diagnostics.checks.blogEndpoint = {
        success: true,
        statusCode: blogResponse.status,
        message: "Blog endpoint is available",
      };
    } catch (error) {
      diagnostics.checks.blogEndpoint = {
        success: false,
        error: axios.isAxiosError(error) ? error.response?.status : "Unknown",
        statusText: axios.isAxiosError(error) ? error.response?.statusText : undefined,
        message: axios.isAxiosError(error) ? error.message : String(error),
      };
    }

    return NextResponse.json({
      diagnostics,
      recommendations: [
        "If blogEndpoint shows 404, the Blog feature may not be enabled on your Wix site",
        "To enable Blog on Wix: Wix Editor → Add → Blog → Create Blog",
        "Ensure your WIX_API_KEY has permissions for blog management",
        "Verify WIX_SITE_ID is correct",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Diagnosis failed",
      },
      { status: 500 }
    );
  }
}
