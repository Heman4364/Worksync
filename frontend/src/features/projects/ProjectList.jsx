import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProjects,
  createProject,
  deleteProject,
  selectAllProjects,
} from '../../store/slices/projectSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import { FolderKanban, Plus, Clock, Users, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectList = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const user = useSelector((state) => state.auth.user);
  const projects = useSelector(selectAllProjects);
  const teams = useSelector((state) => state.teams.teams);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PLANNING');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchProjects({ workspaceId: activeWorkspaceId }));
    }
  }, [dispatch, activeWorkspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;

    const res = await dispatch(
      createProject({
        workspaceId: activeWorkspaceId,
        teamId: teamId ? Number(teamId) : null,
        managerId: user?.id,
        title,
        description,
        status,
        priority,
        dueDate: dueDate || null,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Project created successfully', type: 'success' }));
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this project and all its associated tasks?')) {
      dispatch(deleteProject(id));
      dispatch(addToast({ title: 'Deleted', message: 'Project deleted', type: 'info' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Projects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage initiatives, deadlines, milestone goals, and cross-functional teams
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} size="sm" icon={Plus}>
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge
                  variant={
                    project.status === 'COMPLETED'
                      ? 'success'
                      : project.status === 'ACTIVE'
                      ? 'primary'
                      : project.status === 'ON_HOLD'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {project.status}
                </Badge>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{project.title}</h3>
              {project.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {project.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${project.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due: {project.dueDate || 'Flexible'}
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {project.completedTasks || 0} / {project.totalTasks || 0} tasks
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Platform Expansion"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Strategic goals and objectives..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectList;
