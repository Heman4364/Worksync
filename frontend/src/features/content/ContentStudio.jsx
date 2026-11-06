import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSelectedPlatform,
  setContent,
  setMediaUrls,
  setScheduledAt,
  setSimulationMode,
  validatePostStrategy,
  createPost,
  clearPostForm,
} from '../../store/slices/postSlice';
import { createDraft } from '../../store/slices/draftSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { addToast } from '../../store/slices/uiSlice';
import {
  Instagram,
  Linkedin,
  Twitter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Save,
  Send,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Layers,
} from 'lucide-react';

export const ContentStudio = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const user = useSelector((state) => state.auth.user);
  const {
    selectedPlatform,
    content,
    mediaUrls,
    scheduledAt,
    simulationMode,
    validation,
    loading,
    successMessage,
  } = useSelector((state) => state.posts);

  // Trigger Strategy Pattern validation with 250ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(validatePostStrategy({ platform: selectedPlatform, content, mediaUrls }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, selectedPlatform, content, mediaUrls]);

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      dispatch(addToast({ title: 'Notice', message: 'Please write some content before saving draft', type: 'info' }));
      return;
    }

    const title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    const res = await dispatch(
      createDraft({
        workspaceId: activeWorkspaceId,
        platform: selectedPlatform,
        title,
        content,
        tags: selectedPlatform.toLowerCase(),
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Draft Saved', message: 'Authoritative draft persisted to backend', type: 'success' }));
    }
  };

  const handlePublishOrSchedule = async () => {
    if (!validation.valid) {
      dispatch(addToast({ title: 'Validation Error', message: 'Resolve errors before scheduling post', type: 'error' }));
      return;
    }

    const res = await dispatch(
      createPost({
        workspaceId: activeWorkspaceId,
        platform: selectedPlatform,
        content,
        mediaUrls,
        scheduledAt: scheduledAt || null,
        simulationMode,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Post processed through Kafka Reliability Pipeline', type: 'success' }));
    }
  };

  const platforms = [
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'text-pink-600', max: 2200 },
    { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', max: 3000 },
    { id: 'X', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-900 dark:text-white', max: 280 },
  ];

  const currentPlatformConfig = platforms.find((p) => p.id === selectedPlatform) || platforms[0];

  const charPercentage = Math.min(100, Math.round((validation.characterCount / validation.maxCharacters) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Content Studio</h1>
            <Badge variant="purple">Strategy Pattern</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compose, validate with platform-specific strategies, preview live, and schedule via Kafka
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSaveDraft} icon={Save}>
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={handlePublishOrSchedule}
            loading={loading}
            disabled={!validation.valid || !content.trim()}
            icon={Send}
          >
            {scheduledAt ? 'Schedule Post' : 'Publish Post'}
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {successMessage}
          </span>
          <Button variant="ghost" size="sm" onClick={() => dispatch(clearPostForm())}>
            Compose New
          </Button>
        </div>
      )}

      {/* Main Grid: Composer on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            {/* Platform Selector Buttons */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Target Platform:</span>
              {platforms.map((p) => {
                const isSelected = selectedPlatform === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => dispatch(setSelectedPlatform(p.id))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Content Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Post Copy</label>
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className={
                      validation.characterCount > validation.maxCharacters
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {validation.characterCount} / {validation.maxCharacters}
                  </span>
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        charPercentage > 90 ? 'bg-rose-500' : charPercentage > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${charPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Playful Emoji Quick Bar */}
              <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1.5 mr-1 flex items-center gap-1">
                  <span>Quick Emojis</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
                {['☕', '🔥', '🚀', '🎉', '✨', '💡', '📸', '❤️', '👀', '💯', '👇', '🎯'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => dispatch(setContent((content || '') + ' ' + emoji))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:scale-125 transition-all text-sm select-none"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <textarea
                rows={6}
                value={content}
                onChange={(e) => dispatch(setContent(e.target.value))}
                placeholder={`Write your ${currentPlatformConfig.name} post... Use #hashtags and @mentions.`}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />

              {/* Media URL attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Media / Image URL (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={mediaUrls}
                    onChange={(e) => dispatch(setMediaUrls(e.target.value))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Scheduling & Kafka Simulator Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Schedule Publication
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => dispatch(setScheduledAt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Kafka Pipeline Simulation
                  </label>
                  <select
                    value={simulationMode}
                    onChange={(e) => dispatch(setSimulationMode(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="NONE">Standard (No Failure)</option>
                    <option value="TEMPORARY">Simulate Temporary Failure (Retries 2x)</option>
                    <option value="PERMANENT">Simulate Permanent Failure (Routes to DLQ)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Validation Feedback Card */}
          <Card>
            <CardHeader
              title={`${currentPlatformConfig.name} Strategy Validation`}
              subtitle="Real-time compliance checks via Strategy Pattern"
            />
            <div className="space-y-2 text-xs">
              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  {validation.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  {validation.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 rounded-lg flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {validation.valid && validation.errors.length === 0 && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Content satisfies all {currentPlatformConfig.name} strategy validation rules!</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Live Platform Preview"
              subtitle={`Simulated ${currentPlatformConfig.name} client render`}
            />

            {/* Platform Mock Mockup */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-4">
              {/* Account header */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {user ? `${user.firstName} ${user.lastName}` : 'WorkSync Official'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">@worksync_hq &bull; Just now</p>
                </div>
              </div>

              {/* Content text */}
              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {content || <span className="text-slate-400 italic">Your post copy will appear here...</span>}
              </p>

              {/* Media image preview if provided */}
              {mediaUrls && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img src={mediaUrls} alt="Media" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Social interaction footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
                <span>Like</span>
                <span>Comment</span>
                <span>Repost</span>
                <span>Share</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
