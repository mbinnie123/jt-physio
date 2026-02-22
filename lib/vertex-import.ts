import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { getSitemapUrlStrings } from './sitemap';

interface VertexDocumentData {
  id: string;
  title: string;
  url: string;
  content: string;
}

interface VertexImportResult {
  success: boolean;
  documentId: string;
  url: string;
  error?: string;
}

/**
 * Create Google Cloud authentication for Vertex API
 */
async function getVertexAuthHeaders() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token || !token.token) {
    throw new Error('Failed to obtain Vertex access token');
  }

  return {
    'Authorization': `Bearer ${token.token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Add a single URL as a document to Vertex Data Store
 */
export async function addUrlToVertex(
  url: string,
  title?: string
): Promise<VertexImportResult> {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;
    const dataStoreId = process.env.VERTEX_DATA_STORE_ID;

    if (!projectId || !location || !dataStoreId) {
      throw new Error('Missing required Vertex env vars: GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID');
    }

    const headers = await getVertexAuthHeaders();
    const documentId = `shoulder-url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Use regional API endpoint if location is regional (not global)
    const baseUrl = location === 'global' 
      ? 'https://discoveryengine.googleapis.com'
      : `https://${location}-discoveryengine.googleapis.com`;
    
    const endpoint = `${baseUrl}/v1/projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/branches/default_branch/documents:import`;

    const payload = {
      inlineSource: {
        documents: [
          {
            id: documentId,
            structData: {
              title: title || new URL(url).hostname,
              url: url,
              content: `Resource URL: ${title || url}`,
              type: 'webpage',
            },
          }
        ]
      }
    };

    await axios.post(endpoint, payload, { headers });

    return {
      success: true,
      documentId,
      url,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      documentId: '',
      url,
      error: errorMsg,
    };
  }
}

/**
 * Add all sitemap URLs to Vertex Data Store
 */
export async function addSitemapToVertex(
  sitemapPath: string = 'shoulder-urls-sitemap.xml'
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: VertexImportResult[];
}> {
  try {
    const urls = await getSitemapUrlStrings(sitemapPath);
    const results: VertexImportResult[] = [];

    console.log(`📤 Adding ${urls.length} URLs from sitemap to Vertex Data Store...\n`);

    for (const url of urls) {
      const result = await addUrlToVertex(url);
      results.push(result);

      if (result.success) {
        console.log(`✓ Added: ${url}`);
      } else {
        console.error(`✗ Failed: ${url} - ${result.error}`);
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n✅ Import complete: ${successful}/${urls.length} successful`);
    if (failed > 0) {
      console.log(`⚠️  ${failed} URLs failed to import`);
    }

    return {
      total: urls.length,
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('❌ Error importing sitemap to Vertex:', error);
    throw error;
  }
}

/**
 * Batch import URLs with chunking for better performance
 */
export async function addSitemapToVertexBatch(
  sitemapPath: string = 'shoulder-urls-sitemap.xml',
  batchSize: number = 5,
  delayMs: number = 500
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: VertexImportResult[];
}> {
  try {
    const urls = await getSitemapUrlStrings(sitemapPath);
    const results: VertexImportResult[] = [];

    console.log(
      `📤 Batch importing ${urls.length} URLs to Vertex (batch size: ${batchSize})...\n`
    );

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);

      const batchResults = await Promise.all(
        batch.map((url) => addUrlToVertex(url))
      );

      results.push(...batchResults);

      batchResults.forEach((result) => {
        if (result.success) {
          console.log(`  ✓ ${result.url}`);
        } else {
          console.log(`  ✗ ${result.url} - ${result.error}`);
        }
      });

      // Delay between batches to avoid rate limiting
      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n✅ Batch import complete: ${successful}/${urls.length} successful`);
    if (failed > 0) {
      console.log(`⚠️  ${failed} URLs failed to import`);
    }

    return {
      total: urls.length,
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('❌ Error in batch import:', error);
    throw error;
  }
}
