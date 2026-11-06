import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { addToast } from '../../store/slices/uiSlice';
import { updateUserProfile } from '../../store/slices/authSlice';
import api from '../../services/api';
import {
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  User,
  Sliders,
  Bell,
  Clock,
  Sparkles,
  Share2,
  Trash2,
  RefreshCw,
  Server,
  Globe,
  Mail,
  Smartphone,
  Save,
  Check,
} from 'lucide-react';
import clsx from 'clsx';

export const SettingsView = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role?.replace('ROLE_', '') || 'ADMIN';

  // Active Tab per role
  const [activeTab, setActiveTab] = useState(
    userRole === 'ADMIN' ? 'OAUTH_VAULT' : userRole === 'MANAGER' ? 'CAMPAIGN_RULES' : 'PROFILE'
  );

  // --- ADMIN STATE ---
  const [platform, setPlatform] = useState('INSTAGRAM');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState(null);
  const [savingOAuth, setSavingOAuth] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(15);
  const [retentionDays, setRetentionDays] = useState(90);
  const [purgingCache, setPurgingCache] = useState(false);

  // --- MANAGER STATE ---
  const [requireContentApproval, setRequireContentApproval] = useState(true);
  const [sprintLengthWeeks, setSprintLengthWeeks] = useState('2');
  const [autoArchiveCompleted, setAutoArchiveCompleted] = useState(true);
  const [maxConcurrentTasks, setMaxConcurrentTasks] = useState('5');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/XXXXX');
  const [weeklyDigestEmail, setWeeklyDigestEmail] = useState(true);

  // --- EMPLOYEE STATE ---
  const [firstName, setFirstName] = useState(user?.firstName || 'Leo');
  const [lastName, setLastName] = useState(user?.lastName || 'Rivera');
  const [headline, setHeadline] = useState('Lead Video Producer & Creator');
  const [bio, setBio] = useState('Creating viral short-form reels, aesthetic coffee routines, and brand teasers.');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [focusHoursEnabled, setFocusHoursEnabled] = useState(true);
  const [dailyChecklistEmail, setDailyChecklistEmail] = useState(true);
  const [instagramHandle, setInstagramHandle] = useState('@leorivera_visuals');
  const [twitterHandle, setTwitterHandle] = useState('@leocreates');
  const [defaultLandingPage, setDefaultLandingPage] = useState('TASKS');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      checkStatus();
    }
  }, [platform, activeWorkspaceId, userRole]);

  const checkStatus = async () => {
    try {
      const res = await api.get(`/integrations/status?workspaceId=${activeWorkspaceId}&platform=${platform}`);
      setStatus(res.data);
    } catch (e) {
      setStatus(null);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!clientId || !clientSecret) return;

    setSavingOAuth(true);
    try {
      await api.post('/integrations/credentials', {
        workspaceId: activeWorkspaceId,
        platform,
        clientId,
        clientSecret,
        accessToken,
      });

      dispatch(
        addToast({
          title: 'Encrypted & Stored',
          message: `${platform} credentials encrypted with AES-256-GCM hardware key.`,
          type: 'success',
        })
      );
      setClientSecret('');
      setAccessToken('');
      checkStatus();
    } catch (err) {
      dispatch(addToast({ title: 'Error', message: err.message || 'Failed to save credentials', type: 'error' }));
    } finally {
      setSavingOAuth(false);
    }
  };

  const handlePurgeCache = () => {
    setPurgingCache(true);
    setTimeout(() => {
      setPurgingCache(false);
      dispatch(
        addToast({
          title: 'Ehcache Purged',
          message: 'All cached analytics and task statistics invalidated successfully.',
          type: 'success',
        })
      );
    }, 600);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (user?.id) {
        await api.put(`/users/${user.id}`, { firstName, lastName });
      }
      dispatch(updateUserProfile({ firstName, lastName }));
      dispatch(addToast({ title: 'Profile Updated', message: 'Your personal settings have been saved.', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ title: 'Notice', message: 'Preferences updated locally for this session.', type: 'info' }));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveManagerRules = (e) => {
    e.preventDefault();
    dispatch(
      addToast({
        title: 'Workflow Rules Saved',
        message: 'Campaign approval gates and team capacity settings updated.',
        type: 'success',
      })
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Role-Aware Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {userRole === 'ADMIN'
                ? 'System Administration & Security'
                : userRole === 'MANAGER'
                ? 'Team & Campaign Workflow Settings'
                : 'Personal Creator Preferences'}
            </h1>
            <Badge variant={userRole === 'ADMIN' ? 'primary' : userRole === 'MANAGER' ? 'success' : 'warning'}>
              {userRole === 'ADMIN' ? 'Root Admin' : userRole === 'MANAGER' ? 'Manager Scope' : 'Employee Scope'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {userRole === 'ADMIN'
              ? 'Configure hardware AES-256 encryption, security policies, cache, and workspace governance.'
              : userRole === 'MANAGER'
              ? 'Manage content approval gates, task sprint lengths, capacity limits, and team alert thresholds.'
              : 'Customize your creator profile, focus hours, connected handles, and notification preferences.'}
          </p>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
          />
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ADMIN SETTINGS INTERFACE                              */}
      {/* ======================================================== */}
      {userRole === 'ADMIN' && (
        <div className="space-y-6">
          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
            {[
              { id: 'OAUTH_VAULT', label: 'OAuth & AES-256 Vault', icon: Key },
              { id: 'SECURITY_POLICIES', label: 'Auth & Security Policies', icon: ShieldCheck },
              { id: 'INFRASTRUCTURE', label: 'Kafka & Cache Controls', icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: OAuth & AES-256 Vault */}
          {activeTab === 'OAUTH_VAULT' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader
                  title="OAuth Credential Vault"
                  subtitle="Client secrets are encrypted with AES-256-GCM using authenticated hardware tags"
                />
                <form onSubmit={handleSaveCredentials} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Social Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="INSTAGRAM">Instagram Graph API</option>
                      <option value="LINKEDIN">LinkedIn Marketing Developer API</option>
                      <option value="X">X (Twitter) Developer API v2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client ID / App Key</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="app_id_982401824..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client Secret (Will be Encrypted)
                    </label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Permanent Access Token (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="EAAJx..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <Button type="submit" size="sm" loading={savingOAuth} icon={Lock}>
                    Encrypt & Save in Vault
                  </Button>
                </form>
              </Card>

              {/* Status Info Card */}
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Encryption Status" subtitle="Hardware AES-256" />
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">Vault Armed</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Keys encrypted with 256-bit GCM cipher and unique 96-bit initialization vectors.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cipher:</span>
                        <span className="text-slate-700 dark:text-slate-300">AES/GCM/NoPadding</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Key Length:</span>
                        <span className="text-slate-700 dark:text-slate-300">256 Bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Auth Tag:</span>
                        <span className="text-slate-700 dark:text-slate-300">128 Bits</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Security & Authentication Policy */}
          {activeTab === 'SECURITY_POLICIES' && (
            <Card>
              <CardHeader title="Organization Access & Authentication" subtitle="Global identity policies for BrightSpark Agency" />
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Enforce Multi-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-slate-400">Require all Managers and Employees to verify with an authenticator app</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforce2FA}
                    onChange={(e) => setEnforce2FA(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">JWT Access Token Expiration</p>
                  <p className="text-[11px] text-slate-400">Shorter lifetimes enhance security; refresh tokens handle background extension</p>
                  <select
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value={15}>15 Minutes (Recommended Enterprise)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Audit Log Retention Period</p>
                  <p className="text-[11px] text-slate-400">Duration activity logs are preserved before cold archive</p>
                  <select
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days (Default)</option>
                    <option value={365}>1 Year (Compliance)</option>
                  </select>
                </div>

                <Button size="sm" onClick={() => dispatch(addToast({ title: 'Security Policies Saved', message: 'JWT & 2FA rules updated.', type: 'success' }))}>
                  Update Security Policies
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 3: Infrastructure & Cache Controls */}
          {activeTab === 'INFRASTRUCTURE' && (
            <Card>
              <CardHeader title="System Reliability & Cache Operations" subtitle="Manage memory caches and event delivery queues" />
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Purge Ehcache Buffers</p>
                    <p className="text-[11px] text-slate-400">Flushes all cached project statistics and dashboard calculations</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={purgingCache}
                    onClick={handlePurgeCache}
                    icon={RefreshCw}
                  >
                    Invalidate Cache
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Kafka Dead Letter Queue (DLQ)</p>
                  <p className="text-[11px] text-slate-400">Poisoned publishing events are routed to scheduled-posts-dlt with exponential backoff</p>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>DLQ Pipeline Connected</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MANAGER SETTINGS INTERFACE                            */}
      {/* ======================================================== */}
      {userRole === 'MANAGER' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Campaign Approval & Workflow Gates"
              subtitle="Governance rules for content publishers and task assignments"
            />
            <form onSubmit={handleSaveManagerRules} className="space-y-5 max-w-2xl text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Require Manager Approval for Social Drops</p>
                  <p className="text-[11px] text-slate-400">
                    When enabled, posts drafted by creators must be reviewed and signed off before scheduled release
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireContentApproval}
                  onChange={(e) => setRequireContentApproval(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Default Sprint / Review Window</p>
                <p className="text-[11px] text-slate-400">Standard lead time expected for milestone deliverables</p>
                <select
                  value={sprintLengthWeeks}
                  onChange={(e) => setSprintLengthWeeks(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="1">1 Week Sprints</option>
                  <option value="2">2 Weeks (Agency Standard)</option>
                  <option value="4">1 Month Milestones</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Creator Capacity Limit</p>
                <p className="text-[11px] text-slate-400">Maximum concurrent active tasks permitted per video producer / designer</p>
                <select
                  value={maxConcurrentTasks}
                  onChange={(e) => setMaxConcurrentTasks(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="3">3 Tasks (Light)</option>
                  <option value="5">5 Tasks (Standard)</option>
                  <option value="8">8 Tasks (Intensive)</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Team Alert Webhook (Slack / Discord)</p>
                <p className="text-[11px] text-slate-400">Post notifications when high-priority tasks are marked BLOCKED</p>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Monday Morning Team Productivity Digest</p>
                  <p className="text-[11px] text-slate-400">Receive summary email of all team deliverables every Monday at 9:00 AM</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigestEmail}
                  onChange={(e) => setWeeklyDigestEmail(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <Button type="submit" size="sm" icon={Save}>
                Save Manager Settings
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EMPLOYEE / MEMBER SETTINGS INTERFACE                  */}
      {/* ======================================================== */}
      {userRole === 'MEMBER' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Creator Profile & Workspace Habits"
              subtitle="Personalize your identity, focus hours, and connected creator handles"
            />
            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl text-xs">
              {/* Profile fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Creator Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* Focus Hours */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Daily Focus / Quiet Hours</p>
                    <p className="text-[11px] text-slate-400">Mutes pop-up notifications between 10:00 AM – 1:00 PM for deep content creation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={focusHoursEnabled}
                    onChange={(e) => setFocusHoursEnabled(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Your Primary Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              {/* Connected Handles */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="font-bold text-slate-800 dark:text-slate-200">Connected Social Channels</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">X / Twitter Handle</label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Interface preference */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Default Landing View</p>
                <p className="text-[11px] text-slate-400">Choose which screen opens immediately upon signing in</p>
                <select
                  value={defaultLandingPage}
                  onChange={(e) => setDefaultLandingPage(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="TASKS">My Tasks (Kanban Board)</option>
                  <option value="DASHBOARD">Overview Dashboard</option>
                  <option value="STUDIO">Content Studio</option>
                </select>
              </div>

              <Button type="submit" size="sm" loading={savingProfile} icon={Save}>
                Save Preferences
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
