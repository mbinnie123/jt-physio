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
  url?: string;
}

export default function AdminPublish() {
  const [allPosts, setAllPosts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  // Separate published from unpublished
  const publishedPosts = allPosts.filter((p) => p.status === 'published');
  const draftPosts = allPosts.filter((p) => p.status !== 'published');

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const password = prompt('Enter admin password to view posts:');
        if (!password) return;

        setAdminPassword(password);

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
        setAllPosts(data.drafts || []);
      } catch (err) {
        setError(`Failed to load posts: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    fetchPosts();
  }, []);

  const handlePublish = async () => {
    if (!selectedDraft) {
      setError('Please select a post to publish');
      return;
    }

    if (!adminPassword) {
      setError('Admin password required');
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`,
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
        const action = selectedDraft.wixPostId ? '🔄 Updated' : '✅ Published';
        setSuccess(`${action} successfully!\nPost ID: ${data.postId}\nURL: ${data.url}`);
        
        // Refresh the list
        const refreshResponse = await fetch('/api/blog/publish', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminPassword}`,
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setAllPosts(refreshData.drafts || []);
        }
        
        setSelectedDraft(null);
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditPublished = (post: Draft) => {
    setActiveTab('drafts');
    setSelectedDraft(post);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">📝 Blog Publisher</h1>
            <p className="text-blue-100">Manage your published posts and unpublished drafts</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'published'
                  ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 Published Posts ({publishedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✍️ Draft Posts ({draftPosts.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Published Posts Tab */}
            {activeTab === 'published' && (
              <div>
                {publishedPosts.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                    <p className="text-slate-600 text-lg">No published posts yet.</p>
                    <p className="text-slate-500 text-sm mt-2">Publish your first draft to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publishedPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
                          selectedDraft?.id === post.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-lg">{post.topic}</h3>
                            <div className="text-sm text-slate-600 mt-1 space-y-1">
                              <p>
                                📅 Published:{' '}
                                {post.publishedAt
                                  ? new Date(post.publishedAt).toLocaleDateString()
                                  : 'Unknown'}
                              </p>
                              {post.wixPostId && (
                                <p>
                                  🆔 Wix ID: <code className="bg-slate-100 px-2 py-1 rounded text-xs">{post.wixPostId}</code>
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditPublished(post)}
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold whitespace-nowrap"
                          >
                            ✏️ Edit & Republish
                          </button>
                        </div>
                        {post.sections && (
                          <div className="text-xs text-slate-500 mt-2">
                            💾 {post.sections.length} sections saved
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Draft Posts Tab */}
            {activeTab === 'drafts' && (
              <div>
                {draftPosts.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                    <p className="text-slate-600 text-lg">No draft posts yet.</p>
                    <p className="text-slate-500 text-sm mt-2">Create a new draft to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {draftPosts.map((draft) => (
                      <button
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft)}
                        className={`w-full text-left border-2 rounded-lg p-5 transition-all ${
                          selectedDraft?.id === draft.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-lg">{draft.topic}</div>
                            <div className="text-sm text-slate-600 mt-2 space-y-1">
                              <p>📝 Status: <span className="font-medium capitalize">{draft.status}</span></p>
                              <p>
                                ⏰ Created:{' '}
                                {new Date(draft.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {draft.sections && (
                            <div className="ml-4 text-right">
                              <p className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold">
                                {draft.sections.length} sections
                              </p>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Post Details */}
            {selectedDraft && (
              <div className="mt-8 border-t-2 border-slate-200 pt-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">📄 Selected Post</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Title</p>
                      <p className="text-slate-900 font-medium">{selectedDraft.topic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Status</p>
                      <p className="text-slate-900 font-medium capitalize">{selectedDraft.status}</p>
                    </div>
                    {selectedDraft.sections && (
                      <div>
                        <p className="text-sm text-blue-600 font-semibold">Sections</p>
                        <p className="text-slate-900 font-medium">{selectedDraft.sections.length} sections ready</p>
                      </div>
                    )}
                    {selectedDraft.publishedAt && (
                      <div>
                        <p className="text-sm text-blue-600 font-semibold">Last Published</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(selectedDraft.publishedAt).toLocaleDateString()} at{' '}
                          {new Date(selectedDraft.publishedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 font-semibold mb-2">❌ Error</p>
                    <pre className="text-red-700 text-xs whitespace-pre-wrap overflow-auto max-h-40 font-mono">
                      {error}
                    </pre>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 font-semibold mb-2">✅ Success</p>
                    <pre className="text-green-700 text-sm whitespace-pre-wrap font-mono">
                      {success}
                    </pre>
                  </div>
                )}

                {/* Publish Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !selectedDraft}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                      isPublishing || !selectedDraft
                        ? 'bg-slate-400 cursor-not-allowed'
                        : selectedDraft.wixPostId
                        ? 'bg-amber-500 hover:bg-amber-600 active:scale-95'
                        : 'bg-green-500 hover:bg-green-600 active:scale-95'
                    }`}
                  >
                    {isPublishing
                      ? '⏳ Publishing...'
                      : selectedDraft.wixPostId
                      ? '🔄 Republish to Wix'
                      : '🚀 Publish to Wix'}
                  </button>
                  <button
                    onClick={() => setSelectedDraft(null)}
                    className="py-3 px-6 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                  {selectedDraft.wixPostId
                    ? '🔄 This will update the existing published post on your Wix blog'
                    : '✅ This will create a new post on your Wix blog'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
