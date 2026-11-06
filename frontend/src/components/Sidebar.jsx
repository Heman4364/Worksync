import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  PenTool,
  FileText,
  Calendar,
  Bell,
  BarChart3,
  Cpu,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const userRole = user?.role?.replace('ROLE_', '') || 'ADMIN';

  const allNavItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Projects', path: '/projects', icon: FolderKanban, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', path: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Content Studio', path: '/content-studio', icon: PenTool, badge: 'Strategy', roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Drafts', path: '/drafts', icon: FileText, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Calendar', path: '/calendar', icon: Calendar, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Automations', path: '/automations', icon: Zap, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Kafka Reliability', path: '/kafka-reliability', icon: Cpu, highlight: true, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-xs',
        sidebarOpen ? 'w-64' : 'w-18'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">WorkSync</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {userRole === 'ADMIN' ? 'Admin Portal' : userRole === 'MANAGER' ? 'Manager Hub' : 'Member Workspace'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors group relative',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200',
                item.highlight && !isActive && 'text-indigo-600 dark:text-indigo-400 font-semibold'
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="truncate flex-1">{item.name}</span>}

            {sidebarOpen && item.badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}

            {sidebarOpen && item.count > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
            />
            {sidebarOpen && (
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Alex Mercer'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      userRole === 'ADMIN' ? 'bg-indigo-500' : userRole === 'MANAGER' ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    {userRole === 'ADMIN' ? 'ADMIN' : userRole === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE'}
                  </p>
                </div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
