'use client';

import { useState, useEffect } from 'react';

interface Draft {
  id: string;
  topic: string;
  status: string;
  sections?: any[];
  researchData?: any;
  createdAt: string;
  publishedAt?: string;
  wixPostId?: string;
}

export default function AdminPublish() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch published posts on mount
  useEffect(() => {
    const fetchPublishedPosts = async () => {
      try {
        const password = prompt('Enter admin password to view drafts:');
        if (!password) return;

        const response = await fetch('/api/blog/publish', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${password}`,
          },
        });

        if (!response.ok) {
          setError('Failed to fetch posts');
          return;
        }

        const data = await response.json();
        setDrafts(data.posts || []);
      } catch (err) {
        setError(`Failed to load posts: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    fetchPublishedPosts();
  }, []);

  const handlePublish = async () => {
    if (!selectedDraft) {
      setError('Please select a draft to publish');
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      const password = prompt('Enter admin password to publish:');
      if (!password) {
        setError('Admin password required');
        setIsPublishing(false);
        return;
      }

      const response = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          update: !!selectedDraft.wixPostId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Publishing failed: ${data.error || 'Unknown error'}`);
        if (data.details) {
          setError(prev => `${prev}\n\nWix Details:\nStatus: ${data.details.status}\n${JSON.stringify(data.details.data, null, 2)}`);
        }
      } else {
        setSuccess(`✅ Published successfully!\nPost ID: ${data.postId}\nURL: ${data.url}`);
        setSelectedDraft(null);
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📝 Blog Publisher</h1>
          <p className="text-slate-600 mb-6">Publish drafts to your Wix blog</p>

          {drafts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-slate-600">No drafts available. Create a draft first.</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">📋 Available Drafts</h2>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <button
                      key={draft.id}
                      onClick={() => setSelectedDraft(draft)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedDraft?.id === draft.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{draft.topic}</div>
                      <div className="text-sm text-slate-600">
                        Status: {draft.status} | Created: {new Date(draft.createdAt).toLocaleDateString()}
                      </div>
                      {draft.wixPostId && (
                        <div className="text-xs text-green-600 mt-1">✓ Published on Wix (ID: {draft.wixPostId})</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDraft && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">📄 Selected Draft</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-blue-700">Title:</span>
                      <p className="text-blue-600">{selectedDraft.topic}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">Status:</span>
                      <p className="text-blue-600">{selectedDraft.status}</p>
                    </div>
                    {selectedDraft.sections && (
                      <div>
                        <span className="font-semibold text-blue-700">Sections:</span>
                        <p className="text-blue-600">{selectedDraft.sections.length} sections</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold mb-2">❌ Error</p>
              <pre className="text-red-700 text-xs whitespace-pre-wrap overflow-auto max-h-40 font-mono">
                {error}
              </pre>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold mb-2">✅ Success</p>
              <pre className="text-green-700 text-sm whitespace-pre-wrap font-mono">
                {success}
              </pre>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublishing || !selectedDraft}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              isPublishing || !selectedDraft
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#1e3a8a] hover:bg-blue-800 active:scale-95'
            }`}
          >
            {isPublishing ? '⏳ Publishing...' : '🚀 Publish to Wix'}
          </button>

          <p className="text-xs text-slate-500 mt-4 text-center">
            This will publish the selected draft to your Wix blog. Admin password required.
          </p>
        </div>
      </div>
    </div>
  );
}
