import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardAnalytics } from '../../store/slices/analyticsSlice';
import { fetchKanbanTasks, updateTaskStatus, createTask, selectAllTasks } from '../../store/slices/taskSlice';
import { fetchProjects, selectAllProjects } from '../../store/slices/projectSlice';
import { fetchPosts } from '../../store/slices/postSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  Activity,
  Plus,
  Check,
  Filter,
  Sparkles,
  Layers,
  ExternalLink,
  Eye,
  Instagram,
  Linkedin,
  Twitter,
  ChevronRight,
  User,
  Shield,
  Briefcase,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import clsx from 'clsx';

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const { data, loading: analyticsLoading } = useSelector((state) => state.analytics);

  const allTasks = useSelector(selectAllTasks);
  const allProjects = useSelector(selectAllProjects);
  const { posts } = useSelector((state) => state.posts);

  // Interactive Dashboard States
  const [timeframe, setTimeframe] = useState('WEEK'); // 'WEEK', 'MONTH', 'QUARTER'
  const [taskFilter, setTaskFilter] = useState('PENDING'); // 'ALL', 'PENDING', 'URGENT', 'COMPLETED'
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [previewPostModalOpen, setPreviewPostModalOpen] = useState(false);
  const [selectedPostPreview, setSelectedPostPreview] = useState(null);

  // Quick Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newDueDate, setNewDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchDashboardAnalytics(activeWorkspaceId));
      dispatch(fetchKanbanTasks(activeWorkspaceId));
      dispatch(fetchProjects({ workspaceId: activeWorkspaceId, size: 20 }));
      dispatch(fetchPosts({ workspaceId: activeWorkspaceId, size: 10 }));
    }
  }, [dispatch, activeWorkspaceId]);

  // Interactive Task Toggle (1-Click Complete/Reopen)
  const handleToggleTaskStatus = async (task) => {
    const isCompleted = task.status === 'COMPLETED';
    const targetStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';

    try {
      await dispatch(updateTaskStatus({ id: task.id, status: targetStatus })).unwrap();
      dispatch(
        addToast({
          title: isCompleted ? 'Task Reopened' : 'Task Completed 🎉',
          message: `"${task.title}" updated to ${targetStatus}`,
          type: isCompleted ? 'info' : 'success',
        })
      );
      // Refresh dashboard analytics after status change
      dispatch(fetchDashboardAnalytics(activeWorkspaceId));
    } catch (e) {
      dispatch(addToast({ title: 'Error', message: 'Failed to update task status', type: 'error' }));
    }
  };

  // Interactive Quick Task Submit
  const handleQuickTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreatingTask(true);
    try {
      const projId = newProjectId || (allProjects.length > 0 ? allProjects[0].id : 1);
      await dispatch(
        createTask({
          title: newTitle,
          description: 'Created via interactive dashboard quick action.',
          projectId: Number(projId),
          priority: newPriority,
          status: 'TODO',
          dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        })
      ).unwrap();

      dispatch(addToast({ title: 'Task Created', message: `Added "${newTitle}"`, type: 'success' }));
      setNewTitle('');
      setQuickTaskModalOpen(false);
      dispatch(fetchDashboardAnalytics(activeWorkspaceId));
      dispatch(fetchKanbanTasks(activeWorkspaceId));
    } catch (err) {
      dispatch(addToast({ title: 'Error', message: 'Could not create task', type: 'error' }));
    } finally {
      setCreatingTask(false);
    }
  };

  // Filtered Task Checklist (Keep to top 4 priority items for clarity)
  const filteredChecklistTasks = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return [];
    return allTasks.filter((t) => {
      if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
      if (taskFilter === 'URGENT') return t.priority === 'URGENT' || t.priority === 'HIGH';
      if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
      return true;
    }).slice(0, 4);
  }, [allTasks, taskFilter]);

  // Open Post Preview Modal
  const handleOpenPostPreview = (post) => {
    setSelectedPostPreview(post);
    setPreviewPostModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Welcome & Quick Actions Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome back, {user?.firstName || 'Alex'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {user?.role?.replace('ROLE_', '') || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              BrightSpark Agency dashboard • 6 active initiatives and 24 scheduled workflow actions.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => setQuickTaskModalOpen(true)}
              size="sm"
              icon={Plus}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              Quick Task
            </Button>
            <Link to="/content-studio">
              <Button
                variant="secondary"
                size="sm"
                icon={Send}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                Create Post
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant="secondary"
                size="sm"
                icon={Layers}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                Kanban
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider px-2">Timeframe:</span>
          {['WEEK', 'MONTH', 'QUARTER'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={clsx(
                'px-3 py-1 rounded-lg transition-all',
                timeframe === tf
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tf === 'WEEK' ? 'Last 7 Days' : tf === 'MONTH' ? 'This Month' : 'Quarterly'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Workspace Sync</span>
        </div>
      </div>

      {/* Interactive Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div
          onClick={() => navigate('/projects')}
          className="group cursor-pointer p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.activeProjects || 4}
            </h3>
            <span className="text-xs text-slate-400">/ {data.totalProjects || 6} Total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Task Completion Rate */}
        <div
          onClick={() => navigate('/tasks')}
          className="group cursor-pointer p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-200 hover:border-emerald-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.taskCompletionRate || 37.5}%
            </h3>
            <span className="text-xs text-emerald-500 font-medium">{data.completedTasks || 9} Done</span>
          </div>
          {/* Mini Progress Bar */}
          <div className="mt-2.5 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${data.taskCompletionRate || 37.5}%` }}
            />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => setTaskFilter('PENDING')}
          className="group cursor-pointer p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-200 hover:border-amber-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.pendingTasks || 15}
            </h3>
            <span className="text-xs text-amber-500 font-medium">In Pipeline</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span>Filter Checklist</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Scheduled Posts */}
        <div
          onClick={() => navigate('/content-studio')}
          className="group cursor-pointer p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-200 hover:border-purple-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Content Drops</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.scheduledPosts || 3}
            </h3>
            <span className="text-xs text-purple-500 font-medium">Scheduled</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            <span>Open Studio</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Tasks Checklist & Project Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tasks Focus Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Today's Focus Checklist</h3>
                <p className="text-xs text-slate-400">Top 4 priority tasks • Click circle to complete</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg text-xs font-semibold">
                {[
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'URGENT', label: 'Urgent' },
                  { id: 'COMPLETED', label: 'Done' },
                  { id: 'ALL', label: 'All' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTaskFilter(f.id)}
                    className={clsx(
                      'px-2.5 py-1 rounded-md transition-colors',
                      taskFilter === f.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Task Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {filteredChecklistTasks.length > 0 ? (
                filteredChecklistTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={clsx(
                        'py-3 flex items-start gap-3 transition-all duration-200 rounded-lg px-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 group',
                        isDone && 'opacity-60'
                      )}
                    >
                      {/* Interactive Status Checkbox */}
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        title={isDone ? 'Mark as In Progress' : 'Mark as Completed'}
                        className={clsx(
                          'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        )}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={clsx(
                              'text-xs font-semibold text-slate-800 dark:text-slate-200 truncate',
                              isDone && 'line-through text-slate-400'
                            )}
                          >
                            {task.title}
                          </p>
                          <Badge
                            variant={
                              task.priority === 'URGENT'
                                ? 'danger'
                                : task.priority === 'HIGH'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span>{task.projectTitle || 'BrightSpark Campaign'}</span>
                          <span>•</span>
                          <span className="font-mono">Due: {task.dueDate}</span>
                        </div>
                      </div>

                      {/* Quick Navigate Link */}
                      <Link
                        to="/tasks"
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View on Kanban Board"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No tasks matching the selected filter.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Top {filteredChecklistTasks.length} focus items • {allTasks.filter((t) => t.status === 'COMPLETED').length} of {allTasks.length} tasks done
              </span>
              <Link to="/tasks" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Open Kanban Board <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          {/* Productivity Chart */}
          <Card>
            <CardHeader
              title="Weekly Productivity Trend"
              subtitle="Tasks created vs completed over the last 7 days"
              action={
                <Link to="/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                  Full Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyProductivity || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="created" fill="#818cf8" radius={[4, 4, 0, 0]} name="Tasks Created" />
                  <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Projects Portfolio & Content Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Initiatives Portfolio */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Initiatives</h3>
                <p className="text-xs text-slate-400">Current progress of 6 strategic projects</p>
              </div>
              <Link to="/projects" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4 mt-3">
              {allProjects.length > 0 ? (
                allProjects.slice(0, 5).map((p) => {
                  const progress = p.progressPercentage || 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate('/projects')}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {p.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Team: {p.teamName || 'Creative Squad'}
                          </p>
                        </div>
                        <Badge variant={p.status === 'ACTIVE' ? 'primary' : 'warning'}>
                          {p.status}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400 font-sans">Progress</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all duration-300',
                              progress >= 70 ? 'bg-emerald-500' : progress >= 40 ? 'bg-indigo-600' : 'bg-amber-500'
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No projects loaded.</p>
              )}
            </div>
          </Card>

          {/* Scheduled & Live Content Pipeline */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Content Pipeline</h3>
                <p className="text-xs text-slate-400">Cross-platform publishing queue</p>
              </div>
              <Link to="/content-studio">
                <Button size="sm" variant="ghost" className="text-xs text-indigo-600 dark:text-indigo-400">
                  Studio
                </Button>
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {[
                {
                  id: 1,
                  platform: 'LINKEDIN',
                  icon: Linkedin,
                  color: 'text-blue-500',
                  status: 'SCHEDULED',
                  title: 'Why We Replaced 2-Hour Meetings with 15-Min Coffee Syncs',
                  date: 'Thursday, 9:30 AM',
                },
                {
                  id: 2,
                  platform: 'X',
                  icon: Twitter,
                  color: 'text-slate-300',
                  status: 'SCHEDULED',
                  title: 'Sneak peek of what drops this Friday... It keeps coffee iced for 24h 🧊☕',
                  date: 'Friday, 11:00 AM',
                },
                {
                  id: 3,
                  platform: 'INSTAGRAM',
                  icon: Instagram,
                  color: 'text-pink-500',
                  status: 'PUBLISHED',
                  title: 'Morning routine bliss ✨ Grab your iced latte and crush today goals!',
                  date: 'Published Yesterday',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenPostPreview(item)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-xl cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Icon className={clsx('w-3.5 h-3.5', item.color)} />
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{item.platform}</span>
                      </div>
                      <Badge variant={item.status === 'PUBLISHED' ? 'success' : 'purple'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.date}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Live Workspace Audit Timeline & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadlines Calendar Widget */}
        <Card>
          <CardHeader
            title="Upcoming Deadlines"
            subtitle="Next scheduled milestone deliverables"
            action={
              <Link to="/calendar" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                Open Calendar <Calendar className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allTasks
              .filter((t) => t.status !== 'COMPLETED')
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Initiative: {task.projectTitle || 'BrightSpark Campaign'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={task.priority === 'URGENT' ? 'danger' : 'warning'}>
                      {task.priority}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{task.dueDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Live Audit Activity Log */}
        <Card>
          <CardHeader
            title="Recent Activity Trail"
            subtitle="Audited changes made by team members"
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{act.userName || 'System'}</span>{' '}
                      performed <span className="font-mono text-indigo-600 dark:text-indigo-400">{act.actionType}</span> on{' '}
                      <span className="font-medium">{act.entityType}</span>
                    </p>
                    {act.newValue && <p className="text-[11px] text-slate-400 truncate mt-0.5">{act.newValue}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent activity logged.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Task Creation Modal */}
      <Modal
        isOpen={quickTaskModalOpen}
        onClose={() => setQuickTaskModalOpen(false)}
        title="Create Quick Task"
      >
        <form onSubmit={handleQuickTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Record TikTok unboxing video"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project
              </label>
              <select
                value={newProjectId}
                onChange={(e) => setNewProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setQuickTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creatingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Post Preview Modal */}
      {selectedPostPreview && (
        <Modal
          isOpen={previewPostModalOpen}
          onClose={() => setPreviewPostModalOpen(false)}
          title={`Preview ${selectedPostPreview.platform} Post`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedPostPreview.platform} Drop
              </span>
              <Badge variant={selectedPostPreview.status === 'PUBLISHED' ? 'success' : 'purple'}>
                {selectedPostPreview.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {selectedPostPreview.title}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Scheduled For: {selectedPostPreview.date}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" onClick={() => setPreviewPostModalOpen(false)}>
                Close Preview
              </Button>
              <Link to="/content-studio">
                <Button size="sm" variant="secondary" icon={ExternalLink}>
                  Open in Studio
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
