import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

/**
 * Parse sitemap XML file and extract URLs
 * @param sitemapPath - Path to the sitemap XML file (relative to project root)
 * @returns Array of URL objects with location and last modified date
 */
export async function getSitemapUrls(sitemapPath: string = 'shoulder-urls-sitemap.xml'): Promise<SitemapUrl[]> {
  try {
    const fullPath = path.join(process.cwd(), sitemapPath);
    const xmlContent = fs.readFileSync(fullPath, 'utf-8');
    
    const parsed = await parseStringPromise(xmlContent);
    const urls: SitemapUrl[] = [];

    if (parsed.urlset && parsed.urlset.url) {
      for (const urlEntry of parsed.urlset.url) {
        if (urlEntry.loc && urlEntry.loc[0]) {
          urls.push({
            loc: urlEntry.loc[0],
            lastmod: urlEntry.lastmod?.[0],
          });
        }
      }
    }

    return urls;
  } catch (error) {
    console.error(`Error parsing sitemap at ${sitemapPath}:`, error);
    throw error;
  }
}

/**
 * Get only the location URLs from sitemap
 * @param sitemapPath - Path to the sitemap XML file
 * @returns Array of URL strings
 */
export async function getSitemapUrlStrings(sitemapPath: string = 'shoulder-urls-sitemap.xml'): Promise<string[]> {
  const urls = await getSitemapUrls(sitemapPath);
  return urls.map(url => url.loc);
}

/**
 * Get sitemap URLs synchronously (for scripts)
 * @param sitemapPath - Path to the sitemap XML file
 * @returns Array of URL strings
 */
export function getSitemapUrlsSync(sitemapPath: string = 'shoulder-urls-sitemap.xml'): string[] {
  try {
    const fullPath = path.join(process.cwd(), sitemapPath);
    const xmlContent = fs.readFileSync(fullPath, 'utf-8');
    
    const urls: string[] = [];
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    let match;

    while ((match = urlRegex.exec(xmlContent)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  } catch (error) {
    console.error(`Error parsing sitemap at ${sitemapPath}:`, error);
    throw error;
  }
}
