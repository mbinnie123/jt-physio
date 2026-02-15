import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { posts } from "@wix/blog";

export const wixClient = createClient({
  modules: {posts},
  auth: ApiKeyStrategy({apiKey: process.env.WIX_API_KEY || '', siteId: process.env.WIX_SITE_ID || '', accountId: process.env.WIX_ACCOUNT_ID || ''})
});