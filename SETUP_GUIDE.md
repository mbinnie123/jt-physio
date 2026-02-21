# Blog Automation - Setup Guide

Complete guide to configuring all required APIs and services.

## 1. Google APIs Setup

### Google Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Places API**
4. Create **API Key** credential (Restrict to Android apps or HTTP referrers)
5. Add to `.env.local`:
```env
GOOGLE_PLACES_API_KEY=your_key_here
GOOGLE_PLACE_ID=ChIJ0doCg2kziEgR_w6Lz-akblc  # Your business place ID from Google Maps
```

### Google Custom Search Engine (CSE)
1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com)
2. Create new search engine
3. Set it to search your website + physiotherapy-related sites
4. Get your **CX ID** and **API Key**
5. Add to `.env.local`:
```env
GOOGLE_CSE_API_KEY=your_api_key
GOOGLE_CSE_CX=your_cx_id
```

### Get Your Google Place ID
1. Go to [Google Maps](https://maps.google.com)
2. Search for your business (JT Physiotherapy)
3. Click on your business listing
4. Right-click → "What's here?" to see the Place ID
5. Or use this URL format and check the results:
```
https://maps.googleapis.com/maps/api/geocode/json?address=Your+Business+Address&key=YOUR_API_KEY
```

---

## 2. OpenAI Setup

### Create OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy and add to `.env.local`:
```env
OPENAI_API_KEY=sk-proj-xxxxx
```

### Set Usage Limits (Recommended)
1. Go to **Billing** → **Usage limits**
2. Set a monthly budget to prevent overages
3. Set rate limits per minute

### Model Used
- **GPT-4 Turbo** for high-quality blog content generation
- Replace with **GPT-3.5 Turbo** for cost savings (less quality)

---

## 3. Wix API Setup

### Enable Wix API
1. Go to [Wix Developer Center](https://www.wix.com/developers)
2. Log in with your Wix account
3. Create an app or OAuth application
4. Navigate to **API Overview**
5. Generate an **API Key** (or OAuth token if using OAuth)

### Get Site & Account IDs
1. Go to your Wix site dashboard
2. Check the URL: `https://www.wix.com/dashboard/site/{SITE_ID}/...`
3. Your **Site ID** is in the URL

For Account ID, use the API:
```bash
curl -H "Authorization: {YOUR_API_KEY}" \
  https://www.wixapis.com/v1/accounts/current
```

### Find Author Member ID
```bash
curl -H "Authorization: {YOUR_API_KEY}" \
  https://www.wixapis.com/v1/members?limit=1
```

5. Add to `.env.local`:
```env
WIX_API_KEY=IST.eyJraWQi...
WIX_SITE_ID=a0398594-eaee-40bf-a70b-9287df970e8e
WIX_ACCOUNT_ID=ba6adc02-0b45-4780-84ba-dc1fde492045
WIX_AUTHOR_MEMBER_ID=ba6adc02-0b45-4780-84ba-dc1fde492045
```

### Enable Blog on Wix
1. Go to Wix Editor
2. Add **Blog** app if not already added
3. Make sure it's published

---

## 4. Google Cloud / Vertex AI Setup (Optional but Recommended)

### Create GCP Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create **New Project**
3. Project name: `jt-physiotherapy-blog`
4. Enable these APIs:
   - Discovery Engine API
   - Cloud Data Discovery API

### Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `blog-automation`
4. Grant **Editor** role (or Data Discovery Editor)
5. Create **JSON Key**
6. Download and save to: `/Users/marcusbinnie/jt-physio/gcp-service-account.json`

### Create Vertex AI Data Store
1. Go to **Vertex AI** → **Search and Conversation**
2. Create **New Agent**
3. Name: `blog-research-index`
4. Create associated **Data Store**
5. Add content (your website, blog posts, knowledge base)
6. Get the **Data Store ID**

### Create Search Engine
1. In same section, create **Search Engine** using the data store
2. Get the **Engine ID**
3. Add to `.env.local`:
```env
GCP_PROJECT_ID=jt-football-physiotherapy
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=blog-research-index_1771434940842
VERTEX_ENGINE_ID=blog-generator-app_1771437328841
GOOGLE_APPLICATION_CREDENTIALS=/Users/marcusbinnie/jt-physio/gcp-service-account.json
```

---

## 5. Admin Password & Sync Secret

Generate secure passwords:

```bash
# Generate a random password
openssl rand -base64 32

# Or use these from your .env.local
ADMIN_PASSWORD=JtPhysio_Admin_2026!9kP
BLOG_SYNC_SECRET=jtphysio_blog_sync_9f3a2c1b
```

---

## 6. Complete .env.local Template

```env
# Google APIs
GOOGLE_PLACES_API_KEY=AIzaSyBK8ZXec6vXiPpmWeqFQxHUJ-QRy8cE77U
GOOGLE_PLACE_ID=ChIJ0doCg2kziEgR_w6Lz-akblc

# Google Custom Search
GOOGLE_CSE_API_KEY=AIzaSyDhlXAkn2yu7ZqxVRj86FUjXoXoogSQo8o
GOOGLE_CSE_CX=21d30ac1023f8481f

# Google Cloud
GCP_PROJECT_ID=jt-football-physiotherapy
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=blog-research-index_1771434940842
VERTEX_ENGINE_ID=blog-generator-app_1771437328841
GOOGLE_APPLICATION_CREDENTIALS=/Users/marcusbinnie/jt-physio/gcp-service-account.json

# OpenAI
OPENAI_API_KEY=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

# Wix
WIX_API_KEY=IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0...
WIX_SITE_ID=a0398594-eaee-40bf-a70b-9287df970e8e
WIX_ACCOUNT_ID=ba6adc02-0b45-4780-84ba-dc1fde492045
WIX_AUTHOR_MEMBER_ID=ba6adc02-0b45-4780-84ba-dc1fde492045

# Admin & Security
ADMIN_PASSWORD=JtPhysio_Admin_2026!9kP
BLOG_SYNC_SECRET=jtphysio_blog_sync_9f3a2c1b
```

---

## 7. Testing Your Setup

### Test API Keys
```bash
# Test Google Places API
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=YOUR_PLACE_ID&key=YOUR_API_KEY"

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test Wix API
curl https://www.wixapis.com/v1/accounts/current \
  -H "Authorization: YOUR_API_KEY"

# Test Google CSE
curl "https://www.googleapis.com/customsearch/v1?q=test&cx=YOUR_CX&key=YOUR_API_KEY"
```

### Test Admin Dashboard
1. Navigate to `http://localhost:3000/admin`
2. Log in with `ADMIN_PASSWORD`
3. Create a test blog post

---

## 8. Pricing Overview

### Free Tier Available
- **Google Places API**: 25,000 requests/month free
- **Google Custom Search**: 100 queries/day free
- **OpenAI**: No free tier, but reasonable pricing (~$0.01 per blog post)
- **Wix**: Included with Wix subscription
- **Google Cloud**: 300 free credits

### Estimated Monthly Cost (1 blog post/week)
- OpenAI GPT-4: ~$4
- Google APIs: Free (under quota)
- Total: ~$4/month

---

## 9. Troubleshooting

### "401 Unauthorized" on API calls
- Check API keys are correctly copied (no extra spaces)
- Verify keys haven't expired
- Check IP whitelist settings if applicable

### "Invalid Place ID"
- Verify your business is on Google Maps
- Use "What's here?" feature to get correct Place ID
- Wait 24-48 hours after creating business listing

### OpenAI errors
- Check API key is valid
- Verify billing is set up
- Check rate limits haven't been exceeded
- Ensure organization ID is correct

### Wix publish fails
- Verify API key has Blog write permissions
- Check Site ID is correct
- Ensure Blog app is enabled on your Wix site
- Verify Author Member ID exists

### GCP errors
- Check service account key file path
- Verify service account has proper permissions
- Ensure APIs are enabled in the project

---

## 10. Next Steps

1. ✅ Set up all API keys
2. ✅ Add keys to `.env.local`
3. ✅ Test each API with curl commands
4. ✅ Access admin dashboard at `/admin`
5. ✅ Create your first blog post
6. ✅ Monitor Wix for published content
7. ✅ Set up production database (PostgreSQL recommended)
8. ✅ Deploy to production

---

## Support Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Wix Developer Docs](https://www.wix.com/velo/documentation)
- [Vertex AI Search Documentation](https://cloud.google.com/generative-ai-app-builder/docs)

---

**Status:** Ready to use! 🚀
