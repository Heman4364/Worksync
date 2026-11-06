import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, toggleSidebar } from '../store/slices/uiSlice';
import { setActiveWorkspace, loginUser } from '../store/slices/authSlice';
import { Search, Bell, Sun, Moon, Menu, Building, ChevronDown, Check, Shield, Briefcase, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const user = useSelector((state) => state.auth.user);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const workspaces = [
    { id: 1, name: 'BrightSpark Agency', slug: 'brightspark' },
    { id: 2, name: 'Content Operations', slug: 'content-ops' },
  ];

  const quickRoles = [
    { name: 'Alex Mercer', role: 'Admin', email: 'admin@worksync.io', pass: 'admin123', icon: Shield, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Maya Lin', role: 'Manager', email: 'manager@worksync.io', pass: 'manager123', icon: Briefcase, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Leo Rivera', role: 'Employee', email: 'member@worksync.io', pass: 'member123', icon: User, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  ];

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleQuickSwitch = (role) => {
    dispatch(loginUser({ email: role.email, password: role.pass }));
    setSwitcherOpen(false);
  };

  return (
    <header className="h-16 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Sidebar Toggle & Workspace Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 transition-colors"
          >
            <Building className="w-4 h-4 text-indigo-500" />
            <span>{currentWorkspace.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    dispatch(setActiveWorkspace(ws.id));
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>{ws.name}</span>
                  {ws.id === currentWorkspace.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center w-80 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, campaigns, drafts..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Quick Switcher, Theme & Notifications */}
      <div className="flex items-center gap-2">
        {/* Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Switch Demo Role"
          >
            <span>Role:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {user?.role?.replace('ROLE_', '') || 'ADMIN'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {switcherOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role
              </div>
              <div className="space-y-1">
                {quickRoles.map((qr) => (
                  <button
                    key={qr.email}
                    onClick={() => handleQuickSwitch(qr)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <img src={qr.avatar} alt={qr.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {qr.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{qr.role}</p>
                    </div>
                    {user?.email === qr.email && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
