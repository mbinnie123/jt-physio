"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ricosToHtml } from "@/lib/blog-automation/writer-utils";

interface BlogDraft {
  id: string;
  topic: string;
  location?: string; // Location (e.g., "Kilmarnock, Ayrshire")
  sport?: string; // Sport (e.g., "Football, Tennis")
  status: "draft" | "writing" | "assembled" | "published";
  sections: any[];
  metadata: any;
  researchData?: ResearchData;
  selectedSourceIds: string[]; // Track selected sources
  includeChecklist?: boolean;
  includeFaq?: boolean;
  includeInternalCta?: boolean;
  publishedAt?: string;
  wixPostId?: string;
  createdAt: string;
}

interface ResearchData {
  sources: any[];
  keywords: string[];
}

// ============================================================================
// Safe JSON Parsing & Retry Helpers
// ============================================================================

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractLinksFromHtml(html: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const text = match[2];
    // Only add unique URLs
    if (!links.some(link => link.url === url)) {
      links.push({ url, text });
    }
  }
  
  return links;
}

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.length > 300 ? text.slice(0, 300) + "…" : text;
    throw new Error(`Invalid JSON returned from ${res.url}. Snippet: ${snippet}`);
  }
}

async function fetchJsonWithRetry(
  url: string,
  options: RequestInit,
  retries = 1
): Promise<{ res: Response; json: any }> {
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Retry transient errors
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        await sleep(700 * (attempt + 1));
        continue;
      }

      const json = await readJsonSafely(res);
      return { res, json };
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      throw lastErr;
    }
  }

  throw lastErr ?? new Error("Unknown fetch error");
}

// ============================================================================
// Admin Dashboard Component
// ============================================================================

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<BlogDraft | null>(null);
  const [newLocation, setNewLocation] = useState(""); // Location (e.g., "Kilmarnock, Ayrshire")
  const [newTopic, setNewTopic] = useState(""); // Topic (e.g., "Sports Injury Recovery")
  const [newSport, setNewSport] = useState(""); // Sport (e.g., "Amateur Footballers")
  const [numSections, setNumSections] = useState(5); // Number of sections to generate
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeInternalCta, setIncludeInternalCta] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">("list");
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [outline, setOutline] = useState<string[]>([]);
  const [editableOutline, setEditableOutline] = useState<string[]>([]); // Editable outline items
  const [sectionTargetWords, setSectionTargetWords] = useState<number[]>([]); // Target word count per section
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [writingSection, setWritingSection] = useState(false); // Loading state for writing
  const [editableDraftLocation, setEditableDraftLocation] = useState(""); // Editable location
  const [editableDraftTopic, setEditableDraftTopic] = useState(""); // Editable topic
  const [editableDraftSport, setEditableDraftSport] = useState(""); // Editable sport
  const [assembledBlog, setAssembledBlog] = useState<any>(null); // Store assembled blog data
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(null); // For viewing full section content
  
  // Editable metadata fields
  const [editableTitle, setEditableTitle] = useState("");
  const [editableSlug, setEditableSlug] = useState("");
  const [editableExcerpt, setEditableExcerpt] = useState("");
  const [editableSeoTitle, setEditableSeoTitle] = useState("");
  const [editableSeoDescription, setEditableSeoDescription] = useState("");
  const [editableFeaturedImageUrl, setEditableFeaturedImageUrl] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]); // Track selected sources
  const [researchQuery, setResearchQuery] = useState(""); // Search query for "Add More Sources"
  const [reapplyingMetadata, setReapplyingMetadata] = useState(false);
  const [viewLinksMode, setViewLinksMode] = useState(false); // Toggle between content and links view

  const hydrateDraftEditor = (draft: BlogDraft) => {
    setSelectedDraft(draft);
    
    // Ensure all sections have contentHtml
    const sectionsWithHtml = (draft.sections || []).map((section: any) => {
      if (!section.contentHtml && section.content && typeof section.content === 'object') {
        // Generate contentHtml from Ricos object if it doesn't exist
        return {
          ...section,
          contentHtml: ricosToHtml(section.content)
        };
      }
      return section;
    });
    
    setSections(sectionsWithHtml);
    setResearchData(draft.researchData || null);
    setSelectedSourceIds(draft.selectedSourceIds || []);
    setEditableDraftLocation(draft.location || "");
    setEditableDraftTopic(draft.topic || "");
    setEditableDraftSport(draft.sport || "");
    setEditableTitle(draft.metadata?.title || draft.topic || "");
    setEditableSlug(draft.metadata?.slug || "");
    setEditableExcerpt(draft.metadata?.excerpt || "");
    setEditableSeoTitle(draft.metadata?.seoTitle || "");
    setEditableSeoDescription(draft.metadata?.seoDescription || "");
    setEditableFeaturedImageUrl(draft.metadata?.featuredImageUrl || "");
    const content = sectionsWithHtml
      .map((section: any) => {
        if (!section?.title || !section?.content) {
          return "";
        }
        // Handle both string and Ricos object content
        const contentText = typeof section.content === 'string'
          ? section.content
          : section.contentHtml
          ? section.contentHtml.replace(/<[^>]*>/g, '')
          : '';
        return `## ${section.title}\n\n${contentText}`;
      })
      .filter(Boolean)
      .join("\n\n");
    setEditableContent(content);
  };

  const persistSelectedSources = async (
    draftId: string,
    updatedIds: string[]
  ) => {
    if (!draftId) return;
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) return;

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId,
            selectedSourceIds: updatedIds,
          }),
        },
        1
      );

      if (!response.ok) {
        const message =
          data?.error ||
          `HTTP ${response.status}: Failed to save source selection`;
        console.error("Persist sources failed:", message);
        return;
      }

      if (data?.draft) {
        setDrafts((prev) =>
          prev.map((draft) =>
            draft.id === draftId ? data.draft : draft
          )
        );
      }
    } catch (error) {
      console.error("Failed to persist selected sources:", error);
    }
  };

  // Check if authenticated
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth) {
      setAuthenticated(true);
      loadDrafts(auth);
    }
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const auth = `Bearer ${password}`;
    localStorage.setItem("admin_auth", auth);
    setAuthenticated(true);
    setPassword("");
    loadDrafts(auth);
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    setAuthenticated(false);
    setDrafts([]);
    setSelectedDraft(null);
  };

  const loadDrafts = async (auth: string) => {
    try {
      const response = await fetch("/api/blog/research", {
        headers: { 
          Authorization: auth,
          "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error("Failed to load drafts:", error);
    }
  };

  const startNewBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/research",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            topic: newTopic,
            location: newLocation,
            sport: newSport,
            numSections,
            includeChecklist,
            includeFaq,
            includeInternalCta,
          }),
        },
        1
      );

      if (response.ok) {
        hydrateDraftEditor(data.draft);
        setResearchData(data.research || data.draft.researchData || null);
        setOutline(data.outline || []);
        setEditableOutline(data.outline || []);
        setSectionTargetWords((data.outline || []).map(() => 300)); // Initialize all sections to 300 words
        setCurrentSectionIndex(0);

        setNewTopic("");
        setNewLocation("");
        setNewSport("");
        setActiveTab("edit");
        loadDrafts(auth);
      }
    } catch (error) {
      console.error("Failed to start blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async (draftId: string, auth: string, numSections: number = 5) => {
    if (!draftId || !auth) {
      alert("Missing draft or authentication. Please reload the page.");
      return;
    }
    setGeneratingOutline(true);
    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        `/api/blog/write-section?draftId=${draftId}&action=generateOutline&numSections=${numSections}`,
        {
          method: "GET",
          headers: { 
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
          },
        },
        1
      );

      if (response.ok && data.outline && data.outline.length > 0) {
        setOutline(data.outline);
        setEditableOutline(data.outline);
        setSectionTargetWords(data.outline.map(() => 300)); // Initialize all sections to 300 words
        setCurrentSectionIndex(0);
      } else {
        const errorMsg = data?.error || `HTTP ${response.status}: Failed to generate outline`;
        console.error("Outline generation failed:", errorMsg);
        alert(`Failed to generate outline: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Error generating outline: ${errorMsg}`);
      
      // Set a default outline if generation fails
      const defaultOutline = [
        "Introduction",
        "Key Points",
        "Benefits",
        "Implementation",
        "Conclusion",
      ];
      setOutline(defaultOutline);
      setEditableOutline(defaultOutline);
      setSectionTargetWords(defaultOutline.map(() => 300)); // Initialize all sections to 300 words
    } finally {
      setGeneratingOutline(false);
    }
  };

  const handleGenerateOutline = () => {
    if (!selectedDraft?.id) {
      alert("Select or create a draft first.");
      return;
    }
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in again to generate an outline.");
      return;
    }
    generateOutline(selectedDraft.id, auth, numSections);
  };

  const writeNextSection = async () => {
    if (!selectedDraft || !editableOutline[currentSectionIndex]) return;

    setWritingSection(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/write-section",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            sectionTitle: editableOutline[currentSectionIndex],
            sectionNumber: currentSectionIndex + 1,
            tone: "professional",
            targetAudience: "physiotherapy patients",
            targetWords: sectionTargetWords[currentSectionIndex] || 300,
          }),
        },
        1
      );

      if (response.ok) {
        // Update the specific section index, not append
        const updatedSections = [...sections];
        const newSection = data.section;
        // Ensure contentHtml is generated if section has Ricos content
        if (!newSection.contentHtml && newSection.content && typeof newSection.content === 'object') {
          newSection.contentHtml = ricosToHtml(newSection.content);
        }
        updatedSections[currentSectionIndex] = newSection;
        setSections(updatedSections);
        
        // Move to next section
        if (currentSectionIndex < editableOutline.length - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
        }
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to write section`;
        console.error("Write section failed:", response.status, data);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to write section:", error);
      alert(`Error writing section: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setWritingSection(false);
    }
  };

  const regenerateSection = async (sectionIndex: number) => {
    if (!selectedDraft || !editableOutline[sectionIndex]) return;

    setWritingSection(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/write-section",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            sectionTitle: editableOutline[sectionIndex],
            sectionNumber: sectionIndex + 1,
            tone: "professional",
            targetAudience: "physiotherapy patients",
            targetWords: sectionTargetWords[sectionIndex] || 300,
          }),
        },
        1
      );

      if (response.ok) {
        // Update the specific section
        const updatedSections = [...sections];
        const newSection = data.section;
        // Ensure contentHtml is generated if section has Ricos content
        if (!newSection.contentHtml && newSection.content && typeof newSection.content === 'object') {
          newSection.contentHtml = ricosToHtml(newSection.content);
        }
        updatedSections[sectionIndex] = newSection;
        setSections(updatedSections);
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to regenerate section`;
        console.error("Regenerate section failed:", response.status, data);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to regenerate section:", error);
      alert(`Error regenerating section: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setWritingSection(false);
    }
  };

  const assembleBlog = async () => {
    if (!selectedDraft) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ 
            draftId: selectedDraft.id,
            assembleOnly: true,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
            selectedSourceIds,
          }),
        },
        1
      );

      if (response.ok) {
        console.log("Assembly successful! Response data:", data);
        console.log("Draft status after assembly:", data.draft?.status);
        alert("Blog post assembled successfully!");
        setSelectedDraft(data.draft);
        setAssembledBlog(data.blogPost); // Store assembled blog data
        // Regenerate outline to show in the UI
        generateOutline(data.draft.id, auth, numSections);
        loadDrafts(auth);
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to assemble`;
        console.error("Assembly failed:", errorMessage);
        alert(`Assembly failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to assemble blog:", error);
      alert(`Assembly error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const reapplyMetadata = async () => {
    if (!selectedDraft?.researchData) {
      alert("Run research first to generate metadata from your selections.");
      return;
    }

    if (!selectedDraft?.id) {
      alert("Draft ID is missing. Please reload the page and try again.");
      console.error("Missing draft ID:", selectedDraft);
      return;
    }

    setReapplyingMetadata(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            assembleOnly: true,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
            selectedSourceIds,
            refreshMetadata: true,
            preserveStatus: selectedDraft.status !== "assembled",
          }),
        },
        1
      );

      if (response.ok) {
        hydrateDraftEditor(data.draft);
        // Also update the drafts list and ensure the selected draft is updated
        await loadDrafts(auth);
        setSelectedDraft(data.draft);
      } else {
        const errorMessage =
          data?.error || `HTTP ${response.status}: Failed to refresh metadata`;
        console.error("Metadata refresh failed:", response.status, data);
        alert(`Metadata refresh failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to refresh metadata:", error);
      alert(
        `Unable to refresh metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setReapplyingMetadata(false);
    }
  };

  const publishBlog = async () => {
    if (!selectedDraft) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ 
            draftId: selectedDraft.id,
            metadata: {
              title: editableTitle,
              slug: editableSlug,
              excerpt: editableExcerpt,
              seoTitle: editableSeoTitle,
              seoDescription: editableSeoDescription,
              featuredImageUrl: editableFeaturedImageUrl,
            },
            content: editableContent,
            selectedSourceIds: selectedSourceIds,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
          }),
        },
        1
      );

      if (response.ok) {
        alert(`Published! View at: ${data.url}`);
        setSelectedDraft(null);
        setSections([]);
        setOutline([]);
        loadDrafts(auth);
        setActiveTab("list");
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to publish`;
        console.error("Publish failed:", errorMessage);
        alert(`Publish failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to publish:", error);
      alert(`Publish error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const completedSections = (selectedDraft?.sections || []).filter(Boolean);
  const canReapplyMetadata = !!selectedDraft?.researchData;
  const canWriteSections =
    !!selectedDraft &&
    (selectedDraft.status === "writing" || selectedDraft.status === "draft");

  // Simple markdown to HTML converter for preview
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks to paragraphs
    html = html.replace(/\n\n/g, "</p><p>");
    html = "<p>" + html + "</p>";

    // Lists
    html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    return html;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Blog Admin Dashboard
          </h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Blog Generator</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Blogs ({drafts.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Create New
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List Tab */}
        {activeTab === "list" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Blog Drafts
            </h2>
            <div className="grid gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    hydrateDraftEditor(draft);
                    if (draft.status !== "draft") {
                      generateOutline(draft.id, localStorage.getItem("admin_auth") || "");
                    } else {
                      setOutline([]);
                      setEditableOutline([]);
                      setSectionTargetWords([]);
                    }
                    setCurrentSectionIndex(0);
                    setActiveTab("edit");
                  }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {draft.topic}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Sections: {draft.sections?.length || 0} | Status:{" "}
                        <span className="font-medium capitalize">
                          {draft.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(draft.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          draft.status === "published"
                            ? "bg-green-100 text-green-800"
                            : draft.status === "assembled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {draft.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {drafts.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">
                    No blogs yet. Create a new one to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Blog Post
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={startNewBlog} className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., Kilmarnock, Ayrshire"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Topic and Sport */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="e.g., Sports Injury Recovery"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport
                    </label>
                    <input
                      type="text"
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value)}
                      placeholder="e.g., Football, Tennis, Running"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Number of Sections */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sections
                  </label>
                  <select
                    value={numSections}
                    onChange={(e) => setNumSections(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value={3}>3 sections</option>
                    <option value={4}>4 sections</option>
                    <option value={5}>5 sections</option>
                    <option value={6}>6 sections</option>
                    <option value={7}>7 sections</option>
                    <option value={8}>8 sections</option>
                    <option value={10}>10 sections</option>
                  </select>
                </div>

                {/* Content Options */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">Include in Generated Content:</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeChecklist}
                        onChange={(e) => setIncludeChecklist(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Recovery Checklist</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeFaq}
                        onChange={(e) => setIncludeFaq(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">FAQ Section</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeInternalCta}
                        onChange={(e) => setIncludeInternalCta(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Internal CTA (Call to Action)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? "Starting Research..." : "Start Blog"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === "edit" && selectedDraft && (
          <div className="space-y-6">
            {/* Draft Info & Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="bg-white/70 border border-white/60 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    Current Context
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      Topic: {editableDraftTopic || "Not set"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                      Location: {editableDraftLocation || "Not set"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                      Subject/Sport: {editableDraftSport || "Not set"}
                    </span>
                  </div>
                </div>

                {/* Location, Topic and Sport */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editableDraftLocation}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftLocation(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, location: value } : prev
                        );
                      }}
                      placeholder="e.g., Kilmarnock, Ayrshire"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={editableDraftTopic}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftTopic(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, topic: value } : prev
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                    <input
                      type="text"
                      value={editableDraftSport}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftSport(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, sport: value } : prev
                        );
                      }}
                      placeholder="e.g., Football, Tennis, Running"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={reapplyMetadata}
                    disabled={!canReapplyMetadata || reapplyingMetadata}
                    title={
                      !canReapplyMetadata
                        ? "Assemble the blog before refreshing metadata."
                        : undefined
                    }
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      !canReapplyMetadata || reapplyingMetadata
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {reapplyingMetadata ? "Reapplying metadata..." : "Reapply Metadata"}
                  </button>
                  <p className="text-xs text-gray-500">
                    Regenerates title, slug, and SEO fields using the selections above.
                  </p>
                </div>

                {/* Content Options */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2 uppercase">Content Options:</p>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeChecklist !== false}
                        disabled
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Checklist {selectedDraft?.includeChecklist !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeFaq !== false}
                        disabled
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">FAQs {selectedDraft?.includeFaq !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeInternalCta !== false}
                        disabled
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Internal CTA {selectedDraft?.includeInternalCta !== false && '✓'}</span>
                    </label>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-gray-600">
                    Status: <span className="font-semibold capitalize">{selectedDraft.status}</span>
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDraft(null);
                      setSections([]);
                      setOutline([]);
                      setActiveTab("list");
                    }}
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    ← Back to list
                  </button>
                </div>
              </div>
            </div>

            {/* Research Data */}
            {researchData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Research Data
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {researchData.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Sources Found ({researchData.sources.length})
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {researchData.sources.slice(0, 3).map((source, i) => (
                        <li key={i}>• {source.title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Source Selection & Research More */}
            {researchData && researchData.sources.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-end gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select Sources for Blog
                    </h3>
                    <label className="block text-sm text-gray-600 mb-2">
                      Search for more specific sources:
                    </label>
                    <input
                      type="text"
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      placeholder="e.g., 'neck pain exercises', 'physiotherapy recovery'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedDraft) return;
                      setLoading(true);
                      const auth = localStorage.getItem("admin_auth") || "";
                      try {
                        const searchTopic = researchQuery.trim() || selectedDraft.topic;
                        const response = await fetch("/api/blog/research", {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            "Authorization": auth,
                            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
                          },
                          body: JSON.stringify({ 
                            draftId: selectedDraft.id,
                            topic: searchTopic,
                            researchMore: true 
                          }),
                        });
                        if (!response.ok) throw new Error("Failed to research more sources");
                        
                        const data = await response.json();
                        setResearchData(data.research);
                        
                        // Update draft with new research data
                        if (selectedDraft) {
                          setSelectedDraft({
                            ...selectedDraft,
                            researchData: data.research,
                          });
                        }
                        // Clear the search input
                        setResearchQuery("");
                      } catch (error) {
                        console.error("Research error:", error);
                        alert("Failed to research more sources");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {loading ? "Searching..." : "Search Sources"}
                  </button>
                </div>
                <div className="space-y-3">
                  {researchData.sources.map((source: any, i: number) => {
                    // Use URL as stable identifier (same as backend)
                    const sourceId = source.url || `${source.title}-${i}`;
                    const isSelected = selectedSourceIds.includes(sourceId);
                    return (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                          isSelected 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const updatedIds = isSelected
                            ? selectedSourceIds.filter(id => id !== sourceId)
                            : [...selectedSourceIds, sourceId];

                          setSelectedSourceIds(updatedIds);
                          setSelectedDraft(prev =>
                            prev
                              ? {
                                  ...prev,
                                  selectedSourceIds: updatedIds,
                                }
                              : prev
                          );

                          if (selectedDraft?.id) {
                            persistSelectedSources(selectedDraft.id, updatedIds);
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 mt-1 mr-3 cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{source.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{source.content || source.snippet}</p>
                            {source.url && (
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {source.url}
                              </a>
                            )}
                            {source.source && (
                              <p className="text-xs text-gray-500 mt-1">Source: {source.source}</p>
                            )}
                          </div>
                          {isSelected && (
                            <span className="text-green-600 font-bold ml-2">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Outline & Target Words Per Section */}
            {selectedDraft && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Blog Outline (Editable)
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Sections:</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={numSections}
                        onChange={(e) => setNumSections(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-16 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateOutline}
                    disabled={generatingOutline}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {generatingOutline
                      ? "Generating..."
                      : outline.length > 0
                      ? "Regenerate Outline"
                      : "Generate Outline"}
                  </button>
                </div>
                {outline.length > 0 ? (
                  <ol className="space-y-3">
                    {editableOutline.map((section, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600 min-w-6">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={section}
                          onChange={(e) => {
                            const updated = [...editableOutline];
                            updated[i] = e.target.value;
                            setEditableOutline(updated);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Section title"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="100"
                            max="2000"
                            value={sectionTargetWords[i] || 300}
                            onChange={(e) => {
                              const updated = [...sectionTargetWords];
                              updated[i] = Math.max(100, parseInt(e.target.value) || 300);
                              setSectionTargetWords(updated);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-16 text-sm"
                          />
                          <span className="text-xs text-gray-600 whitespace-nowrap">words</span>
                        </div>
                        {sections[i] && (
                          <span className="ml-2 text-green-600 text-sm font-medium">✓</span>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600">
                    No outline yet. Click "Generate Outline" to create one using the latest research data.
                  </div>
                )}
              </div>
            )}

            {/* Written Sections */}
            {sections.filter(s => s).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Written Sections ({sections.filter(s => s).length}/{editableOutline.length || "?"})
                </h3>
                <div className="space-y-4">
                  {sections.map((section, i) => section && (
                    <div key={i} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {i + 1}. {section.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {section.wordCount} words
                          </p>
                          <p className="text-gray-700 mt-2 line-clamp-3">
                            {typeof section.content === 'string' 
                              ? section.content 
                              : section.contentHtml 
                                ? section.contentHtml.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                : 'No preview available'}
                          </p>
                        </div>
                        <div className="ml-3 flex flex-col gap-2 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedSectionIndex(i)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            View Full
                          </button>
                          <button
                            onClick={() => regenerateSection(i)}
                            disabled={writingSection}
                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                          >
                            {writingSection ? "..." : "Regenerate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Content Modal */}
            {expandedSectionIndex !== null && sections[expandedSectionIndex] && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {expandedSectionIndex + 1}. {sections[expandedSectionIndex].title}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setViewLinksMode(!viewLinksMode)}
                        className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                          viewLinksMode 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {viewLinksMode ? 'View Content' : 'View Links'}
                      </button>
                      <button
                        onClick={() => {
                          setExpandedSectionIndex(null);
                          setViewLinksMode(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6">
                    {viewLinksMode ? (
                      // Links View
                      (() => {
                        const links = extractLinksFromHtml(sections[expandedSectionIndex].contentHtml || '');
                        return links.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 font-medium mb-4">
                              Found {links.length} link{links.length !== 1 ? 's' : ''} in this section
                            </p>
                            {links.map((link, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="mb-2">
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Anchor Text</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {link.text}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">URL</p>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-xs break-all hover:underline"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            No links found in this section
                          </div>
                        );
                      })()
                    ) : (
                      // Content View
                      <>
                        <style jsx>{`
                          .section-content a {
                            color: #2563eb;
                            text-decoration: underline;
                            cursor: pointer;
                            font-weight: 500;
                          }
                          .section-content a:hover {
                            color: #1d4ed8;
                            text-decoration-thickness: 2px;
                          }
                          .section-content h3 {
                            margin-top: 1.5rem;
                            margin-bottom: 1rem;
                            font-size: 1.125rem;
                            font-weight: 600;
                            color: #111827;
                          }
                          .section-content h3:first-child {
                            margin-top: 0;
                          }
                          .section-content p {
                            margin-bottom: 1rem;
                            line-height: 1.6;
                            color: #374151;
                          }
                        `}</style>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-sm text-gray-600 mb-4">
                            {sections[expandedSectionIndex].wordCount} words
                          </p>
                          {typeof sections[expandedSectionIndex].content === 'string'
                            ? (
                                <div className="section-content text-gray-800 whitespace-pre-wrap leading-relaxed">
                                  {sections[expandedSectionIndex].content}
                                </div>
                              )
                            : sections[expandedSectionIndex].contentHtml
                            ? (
                                <div 
                                  className="section-content text-gray-800 leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: sections[expandedSectionIndex].contentHtml 
                                  }}
                                />
                              )
                            : (
                                <div className="text-gray-400">No content available</div>
                              )
                          }
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setExpandedSectionIndex(null);
                        setViewLinksMode(false);
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        regenerateSection(expandedSectionIndex);
                        setExpandedSectionIndex(null);
                        setViewLinksMode(false);
                      }}
                      disabled={writingSection}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                    >
                      {writingSection ? "Regenerating..." : "Regenerate & Close"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata & Content Editor */}
            {selectedDraft.status !== "draft" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Post Details
                </h3>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editableSlug}
                      onChange={(e) => setEditableSlug(e.target.value)}
                      placeholder="url-friendly-slug"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt (Summary)
                    </label>
                    <textarea
                      value={editableExcerpt}
                      onChange={(e) => setEditableExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Featured Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={editableFeaturedImageUrl}
                      onChange={(e) => setEditableFeaturedImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* SEO Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={editableSeoTitle}
                      onChange={(e) => setEditableSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      value={editableSeoDescription}
                      onChange={(e) => setEditableSeoDescription(e.target.value)}
                      rows={2}
                      placeholder="Meta description for search engines (160 chars)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Markdown Editor Toggle */}
                  <div>
                    <button
                      onClick={() => setShowMarkdownEditor(!showMarkdownEditor)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showMarkdownEditor ? "Hide" : "Show"} Markdown Editor
                    </button>
                  </div>

                  {/* Markdown Editor */}
                  {showMarkdownEditor && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Markdown Content
                        </label>
                        <textarea
                          value={editableContent}
                          onChange={(e) => setEditableContent(e.target.value)}
                          rows={15}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Live Preview
                        </label>
                        <div className="prose prose-sm max-w-none p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                          {editableContent && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: convertMarkdownToHtml(editableContent),
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Extras */}
            {selectedDraft.status === "assembled" && assembledBlog && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Extras
                </h3>
                <div className="space-y-6">
                  {/* FAQs */}
                  {assembledBlog.metadata?.faqs && assembledBlog.metadata.faqs.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Frequently Asked Questions</h4>
                      <div className="space-y-3">
                        {assembledBlog.metadata.faqs.map((faq: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium text-gray-900">{faq.question}</p>
                            <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recovery Checklist */}
                  {assembledBlog.metadata?.checklist && assembledBlog.metadata.checklist.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Recovery Checklist</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {assembledBlog.metadata.checklist.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Outbound Links */}
                  {assembledBlog.metadata?.outboundLinks && assembledBlog.metadata.outboundLinks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Sources & Further Reading
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {assembledBlog.metadata.outboundLinks.map((link: any, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-gray-500 mr-2">•</span>
                            <div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {link.title}
                              </a>
                              <p className="text-xs text-gray-500 mt-1">{link.url}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 flex-wrap">
                {canWriteSections && (
                  <>
                    {sections.length < editableOutline.length && (
                      <div>
                        <button
                          onClick={writeNextSection}
                          disabled={writingSection}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                        >
                          {writingSection
                            ? "Writing Section..."
                            : `Write Section ${currentSectionIndex + 1}`}
                        </button>
                        {writingSection && (
                          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              <p className="text-sm text-blue-700 font-medium">
                                Writing "{editableOutline[currentSectionIndex]}"...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {sections.length > 0 && sections.length === editableOutline.length && (
                      <button
                        onClick={assembleBlog}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                      >
                        {loading ? "Assembling..." : "Assemble Blog"}
                      </button>
                    )}
                  </>
                )}

                {selectedDraft.status === "assembled" && (
                  <button
                    onClick={publishBlog}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {loading ? "Publishing..." : "Publish to Wix"}
                  </button>
                )}

                {selectedDraft.status === "published" && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-gray-700">
                      Published on{" "}
                      {selectedDraft.publishedAt &&
                        new Date(selectedDraft.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
