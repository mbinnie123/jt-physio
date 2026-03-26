import axios from "axios";
import { GoogleAuth } from "google-auth-library";

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION || "us";
const dataStoreId = process.env.VERTEX_DATA_STORE_ID;
const engineId = process.env.VERTEX_ENGINE_ID;
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

interface ResearchQuery {
  topic: string;
  keywords?: string[];
  maxResults?: number;
}

const DEFAULT_MAX_RESULTS = Math.min(
  Math.max(Number(process.env.BLOG_RESEARCH_MAX_RESULTS || 100), 1),
  100
);

interface ResearchResult {
  title: string;
  content: string;
  source: string;
  url?: string;
  excerpt?: string;
  // Legacy support: some stored researchData uses `snippet`.
  // New code should prefer `excerpt` but we keep this for backwards compatibility.
  snippet?: string;
  relevanceScore: number;
  category?: string;
  keywords?: string;
  bodyContent?: string;
  author?: string;
  expert?: string;
  publication_date?: string;
  authority?: string;
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
    const rawQuery = query.keywords
      ? `${query.topic} ${query.keywords.join(" ")}`
      : query.topic;
    const searchQuery = dedupeQueryTerms(rawQuery);

    console.log(`[Research] Starting research for: "${searchQuery}"`);

    // Primary: Search your own Vertex AI data store
    const vertexResults = await searchVertexEngine(
      searchQuery,
      query.maxResults || 5,
      query.topic
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
      return googleResults.map((result: any, index: number) => {
        const raw = result.snippet || "";
        const excerpt = raw.length > 250 ? raw.substring(0, 250) + "…" : raw;
        return {
          title: result.title,
          content: excerpt,
          excerpt,
          snippet: excerpt,
          source: result.displayLink || (result.link ? new URL(result.link).hostname : "Google"),
          url: result.link,
          relevanceScore: 1 - index * 0.1,
        };
      });
    }

    // Fallback to mock sources if both Vertex and CSE fail
    console.warn("[Research] No results from CSE, using mock medical sources");
    const mockSources = getMockMedicalSources(searchQuery, query.maxResults || 5);
    console.log(`[Research] ✓ Using ${mockSources.length} mock sources as fallback`);
    return mockSources.map((source: any, index: number) => {
      const raw = source.snippet || "";
      const excerpt = raw.length > 250 ? raw.substring(0, 250) + "…" : raw;
      return {
        title: source.title,
        content: excerpt,
        excerpt,
        snippet: excerpt,
        source: source.displayLink,
        url: source.link,
        relevanceScore: 1 - index * 0.1,
      };
    });
  } catch (error) {
    console.error("[Research] Error:", error instanceof Error ? error.message : error);
    // Final fallback to mock sources on any error
    console.warn("[Research] Using mock medical sources due to error");
    const mockSources = getMockMedicalSources(query.topic, query.maxResults || 5);
    return mockSources.map((source: any, index: number) => {
      const raw = source.snippet || "";
      const excerpt = raw.length > 250 ? raw.substring(0, 250) + "…" : raw;
      return {
        title: source.title,
        content: excerpt,
        excerpt,
        snippet: excerpt,
        source: source.displayLink,
        url: source.link,
        relevanceScore: 1 - index * 0.1,
      };
    });
  }
}

/**
 * Search using your indexed Vertex AI Discovery Engine
 */
async function searchVertexEngine(
  query: string,
  maxResults: number,
  topic?: string
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

    const endpoints = [
      `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/servingConfigs/default_search:search`,
      `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/servingConfigs/default_search:search`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[Vertex] Calling: ${endpoint}`);
        console.log(`[Vertex] Query: "${query}", Max Results: ${maxResults}`);

        const collected: any[] = [];
        let pageToken: string | undefined;
        const pageSize = Math.min(Math.max(maxResults, 1), 50);

        do {
          const response = await axios.post(
            endpoint,
            {
              query,
              pageSize,
              pageToken,
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

          const pageResults = response.data.results || [];
          collected.push(...pageResults);
          pageToken = response.data.nextPageToken || undefined;
        } while (pageToken && collected.length < maxResults);

        const deduped = new Map<string, any>();
        for (const result of collected) {
          const doc = result?.document || {};
          const structData = doc.structData || {};
          const id =
            structData.url ||
            structData.uri ||
            structData.link ||
            doc.id ||
            doc.name ||
            JSON.stringify(result).slice(0, 200);
          if (!deduped.has(id)) {
            deduped.set(id, result);
          }
        }

        const finalResults = Array.from(deduped.values()).slice(0, maxResults);
        console.log(`[Vertex] Success! Got ${finalResults.length} results from Vertex`);
        return finalResults.map((result: any, index: number) =>
          mapVertexResult(result, index, topic)
        );
      } catch (endpointError) {
        const message =
          endpointError instanceof Error
            ? endpointError.message
            : String(endpointError);
        console.warn(`[Vertex] Endpoint failed: ${endpoint} -> ${message}`);
      }
    }

    return [];
  } catch (error) {
    console.error("[Vertex] Search error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes("401")) {
      console.error("[Vertex] Authentication failed - check access token");
    }
    // Fallback on error
    return [];
  }
}

function mapVertexResult(result: any, index: number, topic?: string): ResearchResult {
  const doc = result?.document || {};
  const structData = doc.structData || {};
  const derivedStructData = doc.derivedStructData || {};
  const metadata = structData.metadata || derivedStructData.metadata || {};

  const rawUrl =
    structData.url ||
    structData.link ||
    structData.uri ||
    derivedStructData.url ||
    derivedStructData.link ||
    metadata.url ||
    metadata.link ||
    doc.uri ||
    doc.contentUri ||
    undefined;

  const normalizedUrl = normalizeUrl(rawUrl);
  const title =
    structData.title ||
    structData.pageTitle ||
    derivedStructData.title ||
    derivedStructData.pageTitle ||
    doc.id ||
    doc.name ||
    `Result ${index + 1}`;

  // Extract full body content first (for creating excerpts if needed)
  const bodyContent =
    structData.bodyContent ||
    structData.text ||
    structData.content ||
    derivedStructData.text ||
    derivedStructData.content ||
    "";

  // Try to use Vertex's pre-made excerpt fields first (already formatted)
  let excerpt =
    result.snippet?.snippet ||
    doc.snippet ||
    structData.snippet ||
    derivedStructData.snippet ||
    metadata.snippet ||
    metadata.excerpt ||
    structData.excerpt ||
    derivedStructData.excerpt ||
    "";

  // If no pre-made excerpt, generate one from available text fields with topic awareness
  if (!excerpt) {
    excerpt = buildTopicAwareExcerpt(
      metadata.description ||
        derivedStructData.description ||
        structData.textSnippet ||
        "",
      bodyContent,
      topic
    );
  } else {
    // Even if we have a pre-made excerpt, validate it's topic-relevant
    // and not just metadata
    if (containsNavigationNoise(excerpt) || excerpt.length < 30) {
      const cleanExcerpt = buildTopicAwareExcerpt(
        "",
        bodyContent,
        topic
      );
      if (cleanExcerpt) {
        excerpt = cleanExcerpt;
      }
    }
  }

  const sourceHost =
    structData.source ||
    derivedStructData.source ||
    metadata.source ||
    (normalizedUrl ? extractHostname(normalizedUrl) : "Vertex Search");

  // Build comprehensive result object
  const researchResult: ResearchResult & { category?: string; keywords?: string; bodyContent?: string } = {
    title,
    content: excerpt,
    source: sourceHost,
    url: normalizedUrl,
    excerpt,
    snippet: excerpt,
    relevanceScore: 1 - index * 0.1,
  };

  // Add optional metadata if available
  if (structData.category) {
    researchResult.category = structData.category;
  }
  if (structData.keywords) {
    researchResult.keywords = structData.keywords;
  }
  
  // Extract author/expert information
  const author = structData.author || structData.expert || derivedStructData.author || metadata.author || '';
  if (author) {
    researchResult.author = author;
    researchResult.expert = author; // Alias for compatibility
  }
  
  // Extract publication date if available
  const pubDate = structData.publication_date || derivedStructData.publication_date || metadata.publication_date || '';
  if (pubDate) {
    researchResult.publication_date = pubDate;
  }
  
  // Extract authority level (high, medium, low)
  const authority = structData.authority || derivedStructData.authority || metadata.authority || '';
  if (authority) {
    researchResult.authority = authority;
  }
  
  // Include full body content if available (keep separate from excerpt)
  if (bodyContent) {
    researchResult.bodyContent = bodyContent;
  }

  return researchResult;
}

const NAVIGATION_PHRASES = [
  "skip to main content",
  "who we are",
  "learn cpr",
  "store finder",
  "log in",
  "sign in",
  "cookie",
  "newsletter",
  "search",
  "menu",
  "related articles",
  "more resources",
  "connect with us",
  "follow us",
  "subscribe",
  "about the author",
  "disclaimer",
  "advertisement",
  "print",
  "share this",
];

const IRRELEVANT_SECTION_PATTERNS = [
  /about\s+(?:the\s+)?author|author\s+bio/i,
  /related\s+(?:articles|posts|resources|links)/i,
  /further\s+reading/i,
  /see\s+also/i,
  /recommended\s+for\s+you/i,
  /more\s+from\s+us/i,
  /sign\s+up\s+for/i,
  /subscribe\s+to/i,
  /follow\s+us/i,
  /connect\s+with/i,
  /disclaimer|privacy|copyright/i,
  /advertisement|sponsored|ad\s+content/i,
  /cookie|cookie\s+policy/i,
  /contact\s+us|get\s+in\s+touch/i,
];

/**
 * Filter and score content based on topic relevance
 * Higher score means more relevant to the topic
 */
function scoreTopicRelevance(text: string, topic?: string): number {
  if (!topic || !text) return 0.5;
  
  const topicWords = topic
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const textLower = text.toLowerCase();
  const matches = topicWords.filter(word => textLower.includes(word));
  
  return Math.min(1, matches.length / topicWords.length);
}

/**
 * Clean and prioritize excerpt based on topic relevance
 */
function buildTopicAwareExcerpt(
  preferred: string | undefined,
  bodyContent: string | undefined,
  topic?: string
): string {
  const candidates: { text: string; score: number }[] = [];
  
  // Evaluate preferred text
  if (preferred && preferred.length > 20) {
    const preferredNorm = normalizeWhitespace(preferred);
    if (!containsNavigationNoise(preferredNorm)) {
      const score = scoreTopicRelevance(preferredNorm, topic);
      candidates.push({ text: preferredNorm, score });
    }
  }
  
  // Evaluate body content
  if (bodyContent && bodyContent.length > 40) {
    const cleaned = cleanBodyContent(bodyContent);
    if (cleaned.length > 40) {
      const score = scoreTopicRelevance(cleaned, topic);
      candidates.push({ text: cleaned, score });
    }
  }
  
  if (candidates.length === 0) {
    return "";
  }
  
  // Sort by relevance score and take the best one
  candidates.sort((a, b) => b.score - a.score);
  return truncateAtWordBoundary(candidates[0].text);
}

function extractFromBody(bodyContent?: any): string {
  const bodyStr = typeof bodyContent === 'string' ? bodyContent : '';
  if (!bodyStr) return "";
  
  // Clean body content more aggressively
  const cleaned = cleanBodyContent(bodyStr);
  
  if (!cleaned) return "";
  return truncateAtWordBoundary(cleaned);
}

/**
 * Clean body content by removing navigation, metadata, and irrelevant sections
 * Returns the first substantial paragraph of actual subject matter
 */
function cleanBodyContent(bodyContent: string): string {
  let text = bodyContent;

  // Remove common irrelevant sections at the beginning or end
  text = text
    .split(/\n{2,}/)  // Split by paragraph breaks
    .map((para) => normalizeWhitespace(para))
    .filter((para) => {
      // Filter out lines that match irrelevant patterns
      return !IRRELEVANT_SECTION_PATTERNS.some(pattern => pattern.test(para));
    })
    .filter((para) => {
      // Filter out navigation noise
      return !containsNavigationNoise(para);
    })
    .filter((para) => {
      // Keep only paragraphs that are substantial (not just a few words)
      return para.length > 40;
    })
    .join(" ");

  // Remove extra whitespace
  text = normalizeWhitespace(text);
  
  return text;
}

function containsNavigationNoise(text: string): boolean {
  if (typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return NAVIGATION_PHRASES.some((phrase) => lower.includes(phrase));
}

function truncateAtWordBoundary(text: any, maxLength: number = 250): string {
  const str = typeof text === 'string' ? text : '';
  if (!str) return "";
  if (str.length <= maxLength) return str;
  const truncated = str.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 50 ? truncated.substring(0, lastSpace) : truncated) + "…";
}

function normalizeWhitespace(text: any): string {
  if (typeof text !== 'string') return "";
  return text ? text.replace(/\s+/g, " ").trim() : "";
}

/**
 * Get access token for Vertex Search API
 */
async function getVertexAccessToken(): Promise<string | null> {
  try {
    // Use application default credentials (from GOOGLE_APPLICATION_CREDENTIALS env var)
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      ...(credentialsPath ? { keyFilename: credentialsPath } : {}),
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

function dedupeQueryTerms(input: string): string {
  const seen = new Set<string>();
  const terms = input
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => {
      const normalized = term.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

  return terms.join(" ");
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
    // Let caller decide fallback path and logging.
    return [];
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
export async function performComprehensiveResearch(
  topic: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<ResearchData> {
  const keywords = extractKeywords(topic);
  const [sources, locationInfo] = await Promise.all([
    conductResearch({ topic, keywords, maxResults }),
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

function normalizeUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function extractHostname(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
