# 🎬 Blog Automation System - Step-by-Step User Guide

## Overview

This guide walks you through creating your first automated blog post from start to finish.

---

## ⏱️ Time Required: 5-10 minutes

Breakdown:
- Setup: 2 minutes
- Create Blog: 1 minute
- Write Content: 3-5 minutes
- Publish: 30 seconds

---

## Step 1: Start the Application (1 minute)

### 1.1 Open Terminal
Navigate to your project directory:
```bash
cd /path/to/jt-physio
```

### 1.2 Install Dependencies (first time only)
```bash
npm install
```

### 1.3 Start Development Server
```bash
npm run dev
```

You'll see:
```
  ▲ Next.js 16.1
  - Local:        http://localhost:3000
  ✓ Ready in 2.5s
```

### 1.4 Access Admin Dashboard
Open your browser and go to: **http://localhost:3000/admin**

---

## Step 2: Login to Admin Dashboard (30 seconds)

### 2.1 Enter Password
The login screen appears:
```
[Password input field]
[Login button]
```

Enter the password you set in `.env.local` for `ADMIN_PASSWORD`.

### 2.2 View Dashboard
After login, you see the main dashboard with two tabs:
- **My Blogs**: List of all your drafts
- **Create New**: Form to start a new blog

---

## Step 3: Create a New Blog (2 minutes)

### 3.1 Click "Create New" Tab

### 3.2 Fill in Blog Details

**Location** (Optional)
- Enter geographic area
- Example: "Glasgow, Scotland"
- Used for location-specific blog content

**Topic** (Required)
- Main subject of your blog
- Example: "Knee Injury Recovery for Football Players"

**Sport** (Optional)
- Type of sport/activity
- Example: "Football, Tennis, Running"

**Number of Sections**
- Choose outline depth (3-10 sections)
- Default: 5 sections
- More sections = longer, more detailed blog

**Include in Generated Content**
- ☑ Recovery Checklist
- ☑ FAQ Section
- ☑ Internal CTA (Call to Action)
- Check all boxes for complete content

### 3.3 Click "Start Blog"

The system immediately:
1. ✓ Researches your topic
2. ✓ Finds relevant sources
3. ✓ Extracts keywords
4. ✓ Generates outline
5. ✓ Moves to editing view

**What you'll see:**
```
Draft Info & Settings
├─ Location: Glasgow, Scotland
├─ Topic: Knee Injury Recovery for Football Players
├─ Sport: Football
└─ Content Options: Checklist ✓, FAQs ✓, CTA ✓

Research Data
├─ Keywords: injury, recovery, physiotherapy, ...
└─ Sources: 5+ sources found

Blog Outline (Editable)
├─ 1. Introduction to Knee Injuries
├─ 2. Common Causes in Football
├─ 3. Recovery Stages
├─ 4. Exercises & Rehabilitation
└─ 5. When to Seek Professional Help
```

---

## Step 4: Review & Edit Outline (30 seconds)

### 4.1 Review the Generated Outline
The system generates section titles automatically based on research.

### 4.2 (Optional) Edit Section Titles
Click any section title to edit:
```
[Edit box] "Introduction to Knee Injuries"
         200 words (default target)
```

### 4.3 (Optional) Adjust Target Word Count
Each section has a target word count:
- Minimum: 100 words
- Default: 300 words
- Maximum: 2000 words

Change by editing the number in the "words" field.

---

## Step 5: Review Research Sources (1 minute)

### 5.1 View Sources
Scroll to "Select Sources for Blog" section.

Each source shows:
- ✓ Title
- Summary snippet
- URL (clickable)
- Source attribution

### 5.2 Select Sources to Use
Click on source cards to:
- ✓ Select (green highlight)
- ✓ Unselect (gray)
- ✓ View full URLs

Selected sources appear in:
- Blog content citations
- Outbound links section
- SEO data

### 5.3 (Optional) Search More Sources
Use "Search for more specific sources" field:
1. Type a query: "knee injury exercises"
2. Click "Search Sources"
3. New sources are added to list

---

## Step 6: Write Content Sections (3-5 minutes)

### 6.1 Start Writing
Scroll to "Action Buttons" section at bottom.

Click: **"Write Section 1"**

**What happens:**
1. System shows: "Writing 'Introduction to Knee Injuries'..."
2. Loading spinner appears
3. Section is written using OpenAI GPT-4 + research data
4. Takes ~30-60 seconds per section

### 6.2 Section is Written
When done, you see:
```
Written Sections (1/5)
┌─ Section 1: Introduction to Knee Injuries
│  └─ 342 words ✓
├─ [Content preview...]
```

### 6.3 Continue to Next Section
System automatically selects next section.
Click **"Write Section 2"** to continue.

### 6.4 Repeat for All Sections
Continue until all sections are written:
- ✓ Write Section 2
- ✓ Write Section 3
- ✓ Write Section 4
- ✓ Write Section 5

Total time: 2-5 minutes (depending on number of sections)

---

## Step 7: Assemble Blog Post (30 seconds)

### 7.1 View Written Sections
After all sections are written, you see:
```
Written Sections (5/5) - All sections complete!
✓ Section 1: Introduction (342 words)
✓ Section 2: Common Causes (298 words)
✓ Section 3: Recovery Stages (315 words)
✓ Section 4: Exercises (301 words)
✓ Section 5: When to Seek Help (287 words)
```

### 7.2 Click "Assemble Blog"
Button appears at bottom:
```
[Assemble Blog] (Green button)
```

Click it. The system:
1. Combines all sections
2. Generates SEO metadata
3. Creates FAQ section
4. Creates recovery checklist
5. Formats for publication

### 7.3 See Assembled Content
After assembly, dashboard shows:
```
Status: assembled

Edit Post Details
├─ Post Title: Knee Injury Recovery Guide
├─ URL Slug: knee-injury-recovery-guide
├─ Excerpt: Comprehensive guide to...
├─ Featured Image URL: (optional)
├─ SEO Title: Knee Injury Recovery | JT Physio
└─ SEO Description: Professional guide to...

Generated Extras
├─ FAQs (3 common questions)
├─ Recovery Checklist (5 items)
└─ Outbound Links (8 sources)
```

---

## Step 8: (Optional) Edit Content Details (2 minutes)

### 8.1 Review Auto-Generated Title
Default: Your topic name
Example: "Knee Injury Recovery for Football Players"

Change by editing "Post Title" field.

### 8.2 Review Auto-Generated Slug
Used in URL
Example: "knee-injury-recovery-football"

Change by editing "URL Slug" field.

### 8.3 Review SEO Fields
- **SEO Title**: 50-60 chars (optimal)
- **SEO Description**: 150-160 chars (optimal)
- **Featured Image URL**: (Optional) External image link

### 8.4 Edit Full Content (Advanced)
Click **"Show Markdown Editor"** to:
- View full markdown content
- Edit any section
- See live preview
- Make custom changes

### 8.5 Review Generated Extras
Scroll down to see:
- FAQs auto-generated from content
- Recovery checklist
- Outbound links to sources

---

## Step 9: Publish to Wix (1 minute)

### 9.1 Final Check
Review all fields are correct:
- ✓ Title looks good
- ✓ Slug is URL-friendly
- ✓ Excerpt is compelling
- ✓ SEO fields are filled

### 9.2 Click "Publish to Wix"
Button at bottom:
```
[Publish to Wix] (Purple button)
```

### 9.3 Publishing in Progress
You'll see:
```
⏳ Publishing to Wix...
```

System is:
1. Validating content
2. Converting to Wix format
3. Uploading to Wix API
4. Publishing to your site

Takes: 3-5 seconds

### 9.4 Success!
Green success message appears:
```
✅ Published successfully!
Post ID: blog_xyz123
URL: https://www.your-domain.com/blogs/knee-injury-recovery
```

Your blog is now **LIVE** on your website!

---

## 📱 Accessing Your Published Blog

### Via Dashboard
1. Go to "My Blogs" tab
2. Find your blog in the list
3. It shows "Status: published"
4. Shows publication date

### Via Direct URL
Open the provided URL in your browser:
```
https://www.your-domain.com/blogs/knee-injury-recovery
```

### Via Your Website
Go to your blog page and see it listed among all posts.

---

## 🔄 Creating Another Blog

### To Create Your Next Blog
1. Click "Create New" tab
2. Enter new topic
3. Repeat steps 3-9
4. Each blog takes 5-10 minutes total

### You Can Have Multiple Blogs In Progress
- Drafts in progress
- One being written
- One assembled
- Multiple published

---

## 💡 Pro Tips

### Tip 1: Edit Outline First
Before writing, review and edit the outline:
- Better outline = better blog
- Takes only 30 seconds
- Sections will follow your outline

### Tip 2: Adjust Target Words
- Short posts: 200-250 words per section
- Medium posts: 300-400 words (recommended)
- Long posts: 500+ words per section

### Tip 3: Select Sources Carefully
- Choose 5-8 most relevant sources
- System uses selected sources in content
- Better sources = better citations

### Tip 4: Edit SEO Fields
- SEO Title: Include main keyword
- SEO Description: Include call-to-action
- These appear in search results

### Tip 5: Review Before Publishing
- Read through assembled post
- Check formatting
- Verify all sections are there
- Fix any issues in markdown editor

---

## ❌ Common Issues & Solutions

### Issue: "Write Section Failed"
**Cause**: OpenAI API error
**Solution**:
1. Check internet connection
2. Verify OPENAI_API_KEY in .env.local
3. Check API rate limits
4. Try again after 30 seconds

### Issue: "Publish to Wix Failed"
**Cause**: Wix API credentials issue
**Solution**:
1. Verify WIX_API_KEY is correct
2. Check WIX_SITE_ID matches your site
3. Ensure WIX_AUTHOR_MEMBER_ID is valid
4. Review terminal for error details

### Issue: Section Content is Poor Quality
**Cause**: Research data not specific enough
**Solution**:
1. Go back to research sources
2. Search for more specific sources
3. Rewrite section manually in editor
4. Or delete draft and start over

### Issue: Dashboard Won't Load
**Cause**: Server not running
**Solution**:
1. Check terminal shows "Ready in..."
2. Try refreshing browser (Ctrl+R)
3. Stop server (Ctrl+C)
4. Run `npm run dev` again

---

## 🎯 Quality Checklist

Before publishing, verify:

- [ ] **Title**: Clear, keyword-rich, compelling
- [ ] **Slug**: URL-friendly, lowercase, hyphens only
- [ ] **Excerpt**: 150-160 characters, compelling
- [ ] **SEO Title**: 50-60 characters with main keyword
- [ ] **SEO Description**: 150-160 characters with CTA
- [ ] **Featured Image**: Professional, relevant (optional)
- [ ] **Content**: All sections written and reviewed
- [ ] **Structure**: Proper headings and formatting
- [ ] **Links**: Sources properly cited
- [ ] **FAQs**: Relevant and helpful
- [ ] **Checklist**: Useful for readers

All checked? ✓ Ready to publish!

---

## 📊 Success Metrics

After publishing, you can measure:

- **Traffic**: Page views from search engines
- **Engagement**: Time on page, scroll depth
- **Conversions**: Clicks to services, contact forms
- **SEO**: Ranking for target keywords
- **Backlinks**: References from other sites

Google Search Console and analytics tools will show these metrics.

---

## 🚀 Next Steps

After your first blog:

1. **Create More Blogs**: Same process, new topics
2. **Monitor Performance**: Check analytics
3. **Optimize Evergreen Content**: Update older posts
4. **Build Backlinks**: Link to your blogs from other content
5. **Analyze Keywords**: Track rankings on new posts

---

## ✨ Summary

Creating a blog is now as simple as:

1. Enter topic
2. Edit outline (optional)
3. Click "Write Section" 5 times
4. Click "Assemble Blog"
5. Click "Publish to Wix"
6. Done! 🎉

**Total time: 5-10 minutes**

---

For more information, see:
- [SYSTEM_REFERENCE.md](SYSTEM_REFERENCE.md) - Technical reference
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Configuration help
- [BLOG_AUTOMATION_README.md](BLOG_AUTOMATION_README.md) - Complete documentation

**Happy blogging! 🚀**
