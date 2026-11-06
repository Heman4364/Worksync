import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../store/slices/notificationSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  useEffect(() => {
    dispatch(fetchNotifications({ page: 0, size: 30 }));
  }, [dispatch]);

  const filtered = filter === 'UNREAD' ? notifications.filter((n) => !n.readStatus) : notifications;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Notification Center
            </h1>
            {unreadCount > 0 && <Badge variant="danger">{unreadCount} Unread</Badge>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time WebSocket alerts for task assignments, approvals, deadlines, and publishing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => dispatch(markAllNotificationsRead())}
            icon={CheckCheck}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'UNREAD'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-all flex items-start justify-between gap-4 ${
                !n.readStatus ? 'border-l-4 border-l-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <Badge
                    variant={
                      n.category === 'TASK'
                        ? 'primary'
                        : n.category === 'PROJECT'
                        ? 'purple'
                        : n.category === 'CONTENT'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {n.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.readStatus && (
                  <button
                    onClick={() => dispatch(markNotificationRead(n.id))}
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}
                {n.linkUrl && (
                  <Link
                    to={n.linkUrl}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">All caught up</h4>
            <p className="text-xs text-slate-400 mt-1">No notifications matching your filter.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
