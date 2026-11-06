import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { InteractiveMascot } from '../../components/InteractiveMascot';
import { Button } from '../../components/Button';
import { Mail, Lock, Shield, Briefcase, User, ArrowRight, Eye, EyeOff, Server, Check } from 'lucide-react';
import { getBaseApiUrl } from '../../services/api';
import clsx from 'clsx';

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@worksync.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // Focus tracking for interactive mascot
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(() => localStorage.getItem('worksync_api_url') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveApiUrl = () => {
    if (apiUrlInput.trim()) {
      localStorage.setItem('worksync_api_url', apiUrlInput.trim());
    } else {
      localStorage.removeItem('worksync_api_url');
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const roleConfigs = {
    ADMIN: {
      id: 'ADMIN',
      label: 'Admin',
      icon: Shield,
      name: 'Alex Mercer',
      email: 'admin@worksync.io',
      password: 'admin123',
      title: 'System Administrator',
      scope: 'Full workspace controls, system settings, & Kafka Hub',
      glowColor: 'from-indigo-500 via-purple-500 to-indigo-500',
      activeRing: 'ring-indigo-500/40 text-indigo-400 border-indigo-500/40',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
    },
    MANAGER: {
      id: 'MANAGER',
      label: 'Manager',
      icon: Briefcase,
      name: 'Maya Lin',
      email: 'manager@worksync.io',
      password: 'manager123',
      title: 'Project & Campaign Lead',
      scope: 'Project planning, task assignments, & content review',
      glowColor: 'from-emerald-500 via-teal-500 to-cyan-500',
      activeRing: 'ring-emerald-500/40 text-emerald-400 border-emerald-500/40',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
    },
    EMPLOYEE: {
      id: 'EMPLOYEE',
      label: 'Employee',
      icon: User,
      name: 'Leo Rivera',
      email: 'member@worksync.io',
      password: 'member123',
      title: 'Team Member',
      scope: 'Task updates, board progress, & draft creation',
      glowColor: 'from-amber-500 via-orange-500 to-rose-500',
      activeRing: 'ring-amber-500/40 text-amber-400 border-amber-500/40',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
    },
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const config = roleConfigs[roleKey];
    setEmail(config.email);
    setPassword(config.password);
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const activeConfig = roleConfigs[selectedRole];

  return (
    <div className="w-full max-w-md mx-auto relative pt-4">
      {/* Interactive Mascot Peeking at the Form */}
      <InteractiveMascot
        isEmailFocused={isEmailFocused}
        isPasswordFocused={isPasswordFocused}
        showPassword={showPassword}
        role={selectedRole}
      />

      {/* Main Glass Card with Glowing Animated Neon Border */}
      <div className="relative group">
        {/* Animated Glow Backdrop */}
        <div
          className={clsx(
            'absolute -inset-0.5 rounded-3xl bg-gradient-to-r opacity-60 blur-md transition-all duration-500 group-hover:opacity-80',
            activeConfig.glowColor
          )}
        />

        {/* Inner Card Content */}
        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">WorkSync Portal</h2>
            <p className="text-xs text-slate-400">
              Select your role panel or enter custom credentials
            </p>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
              {Object.values(roleConfigs).map((role) => {
                const isSelected = selectedRole === role.id;
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={clsx(
                      'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200',
                      isSelected
                        ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Role Meta Card */}
            <div className="p-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center justify-between text-left">
              <div>
                <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{activeConfig.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({activeConfig.email})</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[280px]">
                  {activeConfig.scope}
                </p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                1-Click
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-900 text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className={clsx(
                'w-full py-2.5 font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]',
                activeConfig.btnColor
              )}
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Practical Account Signup & Hint */}
          <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Want your own organization?{' '}
              <a
                href="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Create a Free Workspace
              </a>
            </p>
            <p className="text-[11px] text-slate-500">
              Focus password to see peek-a-boo • Toggle eye to peek 👁️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
