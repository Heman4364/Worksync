import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { updateUserProfile } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import api from '../../services/api';
import { User, Shield, Key } from 'lucide-react';

export const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put(`/users/${user.id}`, { firstName, lastName, avatarUrl });
      dispatch(updateUserProfile(res.data));
      dispatch(addToast({ title: 'Success', message: 'Profile updated successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ title: 'Error', message: err.message || 'Update failed', type: 'error' }));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      dispatch(addToast({ title: 'Success', message: 'Password changed successfully', type: 'success' }));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      dispatch(addToast({ title: 'Error', message: err.message || 'Password update failed', type: 'error' }));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your account information and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader title="General Information" subtitle="Update your personal details" />
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <Button type="submit" loading={loadingProfile}>
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Role & Permissions Info */}
        <Card>
          <CardHeader title="Role & Access" subtitle="System authorization level" />
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  {user?.role?.replace('ROLE_', '') || 'ADMIN'}
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                  Method-level RBAC protected endpoint access
                </p>
              </div>
            </div>

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                Change Password
              </h4>

              <input
                type="password"
                required
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />

              <input
                type="password"
                required
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />

              <Button type="submit" size="sm" variant="secondary" loading={loadingPassword} className="w-full">
                Update Password
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
