import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardAnalytics } from '../../store/slices/analyticsSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Send } from 'lucide-react';

export const AnalyticsView = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const { data, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchDashboardAnalytics(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  const platformData = [
    { name: 'Instagram', value: data.postsByPlatform?.INSTAGRAM || 0, color: '#ec4899' },
    { name: 'LinkedIn', value: data.postsByPlatform?.LINKEDIN || 0, color: '#2563eb' },
    { name: 'X', value: data.postsByPlatform?.X || 0, color: '#0f172a' },
  ];

  const statusData = [
    { name: 'Completed', value: data.completedTasks, color: '#10b981' },
    { name: 'Pending', value: data.pendingTasks, color: '#6366f1' },
    { name: 'Overdue', value: data.overdueTasks, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Productivity & Content Analytics
          </h1>
          <Badge variant="primary">Ehcache Optimized</Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          High-performance analytics powered by Ehcache Spring Cache and optimized JPQL queries
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-slate-500">Overall Task Completion</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.taskCompletionRate}%</h3>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Team Velocity
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total Tasks Managed</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.totalTasks}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{data.completedTasks} completed</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Content Posts Published</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.contentPostsCreated}</h3>
          <p className="text-[11px] text-purple-600 mt-1">{data.scheduledPosts} queued</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total Projects</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.totalProjects}</h3>
          <p className="text-[11px] text-indigo-600 mt-1">{data.activeProjects} active</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity */}
        <Card>
          <CardHeader title="Task Velocity & Completion" subtitle="Weekly performance trends" />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyProductivity || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Content Distribution */}
        <Card>
          <CardHeader title="Content Publishing Distribution" subtitle="Posts published by social platform" />
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsView;
