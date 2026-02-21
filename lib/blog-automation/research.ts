import axios from "axios";
import { GoogleAuth } from "google-auth-library";

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION;
const dataStoreId = process.env.VERTEX_DATA_STORE_ID;
const engineId = process.env.VERTEX_ENGINE_ID;

interface ResearchQuery {
  topic: string;
  keywords?: string[];
  maxResults?: number;
}

interface ResearchResult {
  title: string;
  content: string;
  source: string;
  url?: string;
  relevanceScore: number;
}

// Initialize Google Discovery Engine client (optional for advanced search)
let discoveryEngineClient: any = null;
if (projectId) {
  try {
    const { DiscoveryEngineServiceClient } = require("@google-cloud/discoveryengine");
    discoveryEngineClient = new DiscoveryEngineServiceClient({
      projectId,
    });
  } catch (error) {
    console.warn("Discovery Engine client not available, using standard search only");
  }
}

/**
 * Conduct research using Vertex AI Search (your indexed data store)
 */
export async function conductResearch(
  query: ResearchQuery
): Promise<ResearchResult[]> {
  try {
    const searchQuery = query.keywords
      ? `${query.topic} ${query.keywords.join(" ")}`
      : query.topic;

    console.log(`[Research] Starting research for: "${searchQuery}"`);

    // Primary: Search your own Vertex AI data store
    const vertexResults = await searchVertexEngine(
      searchQuery,
      query.maxResults || 5
    );

    // If Vertex returns results, use them
    if (vertexResults.length > 0) {
      console.log(`[Research] ✓ Using ${vertexResults.length} results from Vertex Search`);
      return vertexResults;
    }

    console.warn("[Research] No results from Vertex, falling back to Google CSE");
    const googleResults = await searchGoogleCustomSearch(
      searchQuery,
      query.maxResults || 5
    );

    // If Google CSE returns results, map and return
    if (googleResults && googleResults.length > 0) {
      console.log(`[Research] ✓ Using ${googleResults.length} results from Google CSE`);
      return googleResults.map((result: any, index: number) => ({
        title: result.title,
        content: result.snippet,
        source: result.displayLink || (result.link ? new URL(result.link).hostname : "Google"),
        url: result.link,
        relevanceScore: 1 - index * 0.1,
      }));
    }

    // Fallback to mock sources if both Vertex and CSE fail
    console.warn("[Research] No results from CSE, using mock medical sources");
    const mockSources = getMockMedicalSources(searchQuery, query.maxResults || 5);
    console.log(`[Research] ✓ Using ${mockSources.length} mock sources as fallback`);
    return mockSources.map((source: any, index: number) => ({
      title: source.title,
      content: source.snippet,
      source: source.displayLink,
      url: source.link,
      relevanceScore: 1 - index * 0.1,
    }));
  } catch (error) {
    console.error("[Research] Error:", error instanceof Error ? error.message : error);
    // Final fallback to mock sources on any error
    console.warn("[Research] Using mock medical sources due to error");
    const mockSources = getMockMedicalSources(query.topic, query.maxResults || 5);
    return mockSources.map((source: any, index: number) => ({
      title: source.title,
      content: source.snippet,
      source: source.displayLink,
      url: source.link,
      relevanceScore: 1 - index * 0.1,
    }));
  }
}

/**
 * Search using your indexed Vertex AI Discovery Engine
 */
async function searchVertexEngine(
  query: string,
  maxResults: number
): Promise<ResearchResult[]> {
  try {
    if (!projectId || !dataStoreId || !location) {
      console.warn("Vertex Search not configured", { projectId, dataStoreId, location });
      return [];
    }

    // Call Vertex Search REST API
    const accessToken = await getVertexAccessToken();
    if (!accessToken) {
      console.warn("Could not get access token for Vertex Search");
      return [];
    }

    // Use the correct dataStore API endpoint (not engine endpoint)
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/servingConfigs/default_search:search`;
    
    console.log(`[Vertex] Calling: ${endpoint}`);
    console.log(`[Vertex] Query: "${query}", Max Results: ${maxResults}`);

    const response = await axios.post(
      endpoint,
      {
        query: query,
        pageSize: maxResults,
        queryExpansionSpec: { condition: "AUTO" },
        spellCorrectionSpec: { mode: "AUTO" },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const results = response.data.results || [];
    console.log(`[Vertex] Success! Got ${results.length} results from Vertex`);

    return results.map((result: any, index: number) => {
      const doc = result.document || {};
      const structData = doc.structData || {};
      
      return {
        title: structData.title || structData.h1 || doc.id || "Untitled",
        content: structData.textSnippet || doc.snippet || "",
        source: structData.url ? new URL(structData.url).hostname : "Vertex Search",
        url: structData.url,
        relevanceScore: 1 - index * 0.1,
      };
    });
  } catch (error) {
    console.error("[Vertex] Search error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes("401")) {
      console.error("[Vertex] Authentication failed - check access token");
    }
    // Fallback on error
    return [];
  }
}

/**
 * Get access token for Vertex Search API
 */
async function getVertexAccessToken(): Promise<string | null> {
  try {
    // Use application default credentials (from GOOGLE_APPLICATION_CREDENTIALS env var)
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log("[Vertex] ✓ Got access token");
    return token.token || null;
  } catch (error) {
    console.error("[Vertex] Failed to get access token:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Google Custom Search Engine integration
 */
async function searchGoogleCustomSearch(query: string, maxResults: number) {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  try {
    const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        q: query,
        cx: cx,
        key: apiKey,
        num: Math.min(maxResults, 10),
        safe: "active",
      },
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Google CSE error:", error);
    // Fallback: Return mock medical sources for physiotherapy-related queries
    return getMockMedicalSources(query, maxResults);
  }
}

/**
 * Mock medical sources for physiotherapy research
 * Used as fallback when CSE is not available
 */
function getMockMedicalSources(query: string, maxResults: number) {
  const medicalSources = [
    {
      title: "NHS - Physiotherapy and Rehabilitation Services",
      snippet: "Information about physiotherapy treatments, exercises, and recovery programs provided by the NHS.",
      displayLink: "nhs.uk",
      link: "https://www.nhs.uk/conditions/physiotherapy/",
    },
    {
      title: "Mayo Clinic - Physiotherapy and Physical Medicine",
      snippet: "Mayo Clinic's guide to physiotherapy treatments, rehabilitation programs, and recovery protocols.",
      displayLink: "mayoclinic.org",
      link: "https://www.mayoclinic.org/tests-procedures/physical-therapy/about/pac-20384701",
    },
    {
      title: "Cleveland Clinic - Physical Therapy Services",
      snippet: "Cleveland Clinic's comprehensive information on physical therapy, rehabilitation, and recovery treatments.",
      displayLink: "clevelandclinic.org",
      link: "https://my.clevelandclinic.org/health/treatments/8657-physical-therapy",
    },
    {
      title: "American Physical Therapy Association",
      snippet: "APTA provides resources about physical therapy treatments, benefits, and finding certified therapists.",
      displayLink: "apta.org",
      link: "https://www.apta.org/patient-care",
    },
    {
      title: "Johns Hopkins Medicine - Rehabilitation Services",
      snippet: "Johns Hopkins offers comprehensive rehabilitation and physical therapy services for various conditions.",
      displayLink: "hopkinsmedicine.org",
      link: "https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/physical-therapy",
    },
  ];

  // Filter by query relevance and return limited results
  const filtered = medicalSources.filter(
    (source) =>
      source.title.toLowerCase().includes(query.toLowerCase()) ||
      source.snippet.toLowerCase().includes(query.toLowerCase())
  );

  return (filtered.length > 0 ? filtered : medicalSources).slice(0, maxResults);
}

/**
 * Get location-specific information using Google Places
 */
export async function getLocationInfo() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,business_status,reviews,rating`
    );

    return response.data.result;
  } catch (error) {
    console.error("Google Places error:", error);
    return null;
  }
}

export interface ResearchData {
  topic: string;
  keywords: string[];
  sources: ResearchResult[];
  locationInfo?: any;
  timestamp: string;
}

/**
 * Comprehensive research workflow
 */
export async function performComprehensiveResearch(topic: string): Promise<ResearchData> {
  const keywords = extractKeywords(topic);
  const [sources, locationInfo] = await Promise.all([
    conductResearch({ topic, keywords, maxResults: 8 }),
    getLocationInfo(),
  ]);

  return {
    topic,
    keywords,
    sources,
    locationInfo,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simple keyword extraction
 */
function extractKeywords(topic: string): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "is",
    "was",
  ]);

  return topic
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !commonWords.has(word) && word.length > 3)
    .slice(0, 5);
}
