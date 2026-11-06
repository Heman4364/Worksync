import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAutomations,
  createAutomation,
  toggleAutomation,
} from '../../store/slices/automationSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import { Zap, Plus, ArrowRight, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

export const AutomationsView = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const { rules, loading } = useSelector((state) => state.automations);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('TASK_ASSIGNED');
  const [actionType, setActionType] = useState('NOTIFY_ASSIGNEE');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchAutomations(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;

    const res = await dispatch(
      createAutomation({
        workspaceId: activeWorkspaceId,
        name,
        triggerEvent,
        actionType,
        conditionJson: '{}',
        actionPayloadJson: '{}',
        enabled: true,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Automation rule created', type: 'success' }));
      setCreateModalOpen(false);
      setName('');
    }
  };

  const handleToggle = (id) => {
    dispatch(toggleAutomation(id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Workflow Automations
            </h1>
            <Badge variant="purple">Event Engine</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automate repetitive team workflows, milestone notifications, and publishing pipelines
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} size="sm" icon={Plus}>
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${rule.enabled ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                  <Badge variant="primary">{rule.triggerEvent}</Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <Badge variant="success">{rule.actionType}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(rule.id)}
                className="cursor-pointer"
                title={rule.enabled ? 'Disable' : 'Enable'}
              >
                {rule.enabled ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Automation Rule">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Notify manager on task completion"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trigger Event</label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="TASK_ASSIGNED">When Task is Assigned</option>
                <option value="TASK_COMPLETED">When Task is Completed</option>
                <option value="POST_FAILED">When Scheduled Post Fails</option>
                <option value="PROJECT_READY">When All Tasks Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action to Execute</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="NOTIFY_ASSIGNEE">Notify Assignee</option>
                <option value="NOTIFY_MANAGER">Notify Project Manager</option>
                <option value="NOTIFY_POST_FAILURE">Notify Post Author & DLQ</option>
                <option value="DISPATCH_KAFKA">Trigger Kafka Async Event</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AutomationsView;
