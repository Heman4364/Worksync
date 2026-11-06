import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTeams, createTeam } from '../../store/slices/teamSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import { Users, Plus, Shield, UserPlus } from 'lucide-react';
import api from '../../services/api';

export const TeamList = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const teams = useSelector((state) => state.teams.teams);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Members modal
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchTeams(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!name) return;

    const res = await dispatch(
      createTeam({
        workspaceId: activeWorkspaceId,
        name,
        description,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Team created successfully', type: 'success' }));
      setCreateModalOpen(false);
      setName('');
      setDescription('');
    }
  };

  const openMembersModal = async (team) => {
    setSelectedTeam(team);
    setMemberModalOpen(true);
    try {
      const [membersRes, usersRes] = await Promise.all([
        api.get(`/teams/${team.id}/members`),
        api.get('/users'),
      ]);
      setTeamMembers(membersRes.data);
      setAllUsers(usersRes.data);
    } catch (e) {
      //
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedTeam) return;

    try {
      const res = await api.post(`/teams/${selectedTeam.id}/members`, {
        userId: Number(selectedUserId),
        roleInTeam: 'Member',
      });
      setTeamMembers([...teamMembers, res.data]);
      dispatch(addToast({ title: 'Added', message: 'Team member added', type: 'success' }));
      setSelectedUserId('');
    } catch (e) {
      dispatch(addToast({ title: 'Error', message: e.message || 'Could not add member', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Teams</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize members into functional squads and manage role permissions
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} size="sm" icon={Plus}>
          New Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{team.name}</h3>
                  <span className="text-[10px] text-slate-400">{team.memberCount || 0} members</span>
                </div>
              </div>

              {team.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {team.description}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => openMembersModal(team)} className="w-full" icon={Users}>
                Manage Members
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Team Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems Squad"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities and team scope..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Team Members Modal */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={selectedTeam ? `${selectedTeam.name} Members` : 'Team Members'}
      >
        <div className="space-y-4">
          <form onSubmit={handleAddMember} className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="">Select workspace user to add...</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
            <Button size="sm" type="submit" icon={UserPlus}>
              Add
            </Button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
            {teamMembers.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{m.userName}</span>
                  <p className="text-[10px] text-slate-400">{m.userEmail}</p>
                </div>
                <Badge variant="primary">{m.roleInTeam}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamList;
