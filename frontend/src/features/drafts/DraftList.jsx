import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDrafts,
  deleteDraft,
  updateDraft,
  setDraftSearchQuery,
  setDraftSelectedPlatform,
} from '../../store/slices/draftSlice';
import { selectAllDrafts } from '../../store/slices/draftSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import { Search, Filter, Edit3, Trash2, FileText, Send, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setContent, setSelectedPlatform } from '../../store/slices/postSlice';

export const DraftList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const drafts = useSelector(selectAllDrafts);
  const { searchQuery, selectedPlatform, loading } = useSelector((state) => state.drafts);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPlatform, setEditPlatform] = useState('INSTAGRAM');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(
        fetchDrafts({
          workspaceId: activeWorkspaceId,
          platform: selectedPlatform,
          query: searchQuery,
        })
      );
    }
  }, [dispatch, activeWorkspaceId, selectedPlatform, searchQuery]);

  const handleOpenEdit = (draft) => {
    setEditingDraft(draft);
    setEditTitle(draft.title);
    setEditContent(draft.content);
    setEditPlatform(draft.platform);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDraft) return;

    const res = await dispatch(
      updateDraft({
        id: editingDraft.id,
        data: {
          workspaceId: activeWorkspaceId,
          platform: editPlatform,
          title: editTitle,
          content: editContent,
        },
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Draft updated successfully', type: 'success' }));
      setEditModalOpen(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this draft?')) {
      dispatch(deleteDraft(id));
      dispatch(addToast({ title: 'Deleted', message: 'Draft removed', type: 'info' }));
    }
  };

  const handleLoadInStudio = (draft) => {
    dispatch(setSelectedPlatform(draft.platform));
    dispatch(setContent(draft.content));
    navigate('/content-studio');
  };

  const platforms = ['ALL', 'INSTAGRAM', 'LINKEDIN', 'X'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Draft Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative persistent content drafts with Redux Toolkit entity adapters
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setDraftSearchQuery(e.target.value))}
              placeholder="Search drafts..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => dispatch(setDraftSelectedPlatform(p))}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedPlatform === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drafts Grid */}
      {drafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={draft.platform === 'INSTAGRAM' ? 'purple' : draft.platform === 'LINKEDIN' ? 'primary' : 'default'}>
                    {draft.platform}
                  </Badge>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{draft.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {draft.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="ghost" onClick={() => handleLoadInStudio(draft)} icon={Send}>
                  Open in Studio
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(draft)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No drafts found</h4>
          <p className="text-xs text-slate-400 mt-1">Write copy in Content Studio and save it as a draft to see it here.</p>
        </Card>
      )}

      {/* Edit Draft Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Draft">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
            <select
              value={editPlatform}
              onChange={(e) => setEditPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="INSTAGRAM">Instagram</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="X">X (Twitter)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content</label>
            <textarea
              rows={5}
              required
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Draft
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DraftList;
