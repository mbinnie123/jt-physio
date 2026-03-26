# Section Generation Bug Diagnosis

## User Report
"The blog sections that are being generated are not corresponding with the section title (outline)? Instead repeating the first section outline."

## Hypothesis
When generating multiple sections, they're all being generated with the same title (the first section), OR the content is being duplicated from the first section.

## Root Cause Possibilities

### 1. `editableOutline` State Issue
- [ ] editableOutline only has 1 element when it should have 5+
- [ ] editableOutline isn't being updated properly from research API response
- [ ] editableOutline gets reset/truncated between section generations

### 2. `targetIndex` Calculation Issue  
- [ ] Always resolving to 0 due to `nextUnwrittenIndex` calculation
- [ ] `findNextUnwrittenSectionIndex` always returns -1, default to 0
- [ ] `currentSectionIndex` is always 0, so `Math.max(nextUnwrittenIndex, currentSectionIndex)` always favors 0

### 3. `sectionIndex` Not Passed to API
- [ ] Request being made without `sectionIndex` parameter
- [ ] API defaulting to `index = 0` because `sectionIndex` is missing

### 4. Sections Array Not Updated After Write
- [ ] Section is written to correct index but then sections array isn't properly updated
- [ ] Browser state gets out of sync with backend
- [ ] `isSectionWritten()` check failing, so `findNextUnwrittenSectionIndex` always returns 0

## Debugging Steps

### Step 1: Check Browser Console Logs
When generating sections, look for `[WriteFlow] request` logs:
```
{
  explicitSectionIndex: undefined | number,
  nextUnwrittenIndex: number,
  currentSectionIndex: number,
  targetIndex: number,                    // THIS SHOULD INCREASE!
  outlineLength: number,                  // THIS SHOULD BE 5+
  sectionsLength: number,
}
```

**Expected behavior:**
- First call: targetIndex = 0, outlineLength = 5+
- Second call: targetIndex = 1, outlineLength = 5+
- Third call: targetIndex = 2, outlineLength = 5+

**Bug indicator:** If targetIndex stays 0 or outlineLength = 1, that's the issue.

### Step 2: Check Draft Data
In browser DevTools Console:
```javascript
// Get all drafts from localStorage
const drafts = Object.keys(localStorage).filter(k => k.includes('draft'));
console.log('Draft keys:', drafts);

// Check if .blog-db.json has sections
fetch('/api/blog/research', {headers: {Authorization: 'Bearer ...'}}).then(r => r.json()).then(d => console.log('Draft from DB:', d.drafts[0]));
```

### Step 3: Check Updated Section Storage
After each section generation, check:
- `sections` state array length (should increase from 1→2→3)
- Each section's `.title` property (should match outline)
- `isSectionWritten()` for each section

### Step 4: Check API Request Body
In Network tab, inspect POST to `/api/blog/write-section`:
```json
{
  "draftId": "...",
  "sectionTitle": "...",      // SHOULD BE DIFFERENT EACH TIME
  "sectionIndex": 0 | 1 | 2,  // SHOULD INCREASE
  ...
}
```

## Most Likely Root Cause
Based on code review, **the most likely issue is one of these:**

1. **Bug in `findNextUnwrittenSectionIndex`** - If `isSectionWritten()` is not correctly detecting written sections, it always returns 0
2. **Bug in section update** - If sections aren't being saved/returned correctly from API, they appear unwritten
3. **Bug in `editableOutline` initialization** - If outline is only 1 element or not being set properly

## Next Steps
1. Check browser console for `[WriteFlow] request` logs
2. Verify `targetIndex` increases with each section generation
3. Check if `outlineLength` is correct (should match number of sections)
4. If `targetIndex` always = 0, debug `findNextUnwrittenSectionIndex` logic
5. If `targetIndex` is correct but sections look the same, debug OpenAI prompt or title handling
