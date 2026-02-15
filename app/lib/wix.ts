import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { posts } from "@wix/blog";
import { contacts } from "@wix/crm";
import { items } from "@wix/data";
import { messages } from "@wix/inbox";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(
      `[Wix] Missing ${name}. Add it to .env.local (or your deployment env vars) and restart the dev server.`
    );
  }
  return v;
}

/**
 * Lazily create the Wix client so we don't crash during module evaluation.
 * This file should only be imported/used from server code (Route Handlers / Server Actions).
 */

const modules = {
  posts,
  contacts,
  items,
  messages,
};

function getClientType() {
  return createClient({
    modules,
    auth: ApiKeyStrategy({ apiKey: "", siteId: "", accountId: "" }),
  });
}

let _client: ReturnType<typeof getClientType> | null = null;

export function getWixClient() {
  if (_client) return _client;

  const apiKey = requireEnv("WIX_API_KEY");
  const siteId = requireEnv("WIX_SITE_ID");
  const accountId = requireEnv("WIX_ACCOUNT_ID");

  _client = createClient({
    modules,
    auth: ApiKeyStrategy({
      apiKey,
      siteId,
      accountId,
    }),
  });

  return _client;
}

// Backwards compat for any existing imports
export const wixClient = getWixClient();