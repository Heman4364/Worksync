import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  fetchKanbanTasks,
  updateTaskStatus,
  optimisticStatusChange,
  createTask,
  deleteTask,
  setSearchQuery,
  setFilterPriority,
} from '../../store/slices/taskSlice';
import { selectKanbanColumns } from '../../store/selectors/taskSelectors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import api from '../../services/api';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Trash2,
  Send,
  User,
  Clock,
} from 'lucide-react';

export const KanbanBoard = () => {
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const columns = useSelector(selectKanbanColumns);
  const { searchQuery, filterPriority, loading } = useSelector((state) => state.tasks);
  const projects = useSelector((state) => state.projects.entities);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchKanbanTasks(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = Number(draggableId);
    const newStatus = destination.droppableId;

    // 1. Optimistic UI update in Redux
    dispatch(optimisticStatusChange({ id: taskId, status: newStatus }));

    // 2. Persist update through backend API
    dispatch(updateTaskStatus({ id: taskId, status: newStatus })).catch(() => {
      // Rollback on error
      dispatch(optimisticStatusChange({ id: taskId, status: source.droppableId }));
      dispatch(addToast({ title: 'Error', message: 'Failed to update task status', type: 'error' }));
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    const firstProjectId = Object.keys(projects)[0] || 1;
    const project = taskProjectId ? Number(taskProjectId) : Number(firstProjectId);

    const res = await dispatch(
      createTask({
        projectId: project,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        status: 'TODO',
        dueDate: taskDueDate || null,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Task created successfully', type: 'success' }));
      setCreateModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
    }
  };

  const openCommentModal = async (task) => {
    setSelectedTask(task);
    setCommentModalOpen(true);
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setTaskComments(res.data);
    } catch (e) {
      setTaskComments([]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    try {
      const res = await api.post(`/tasks/${selectedTask.id}/comments`, { content: newCommentText });
      setTaskComments([...taskComments, res.data]);
      setNewCommentText('');
    } catch (e) {
      dispatch(addToast({ title: 'Error', message: 'Failed to add comment', type: 'error' }));
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
      dispatch(addToast({ title: 'Deleted', message: 'Task deleted', type: 'info' }));
    }
  };

  const columnConfig = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-400 dark:border-indigo-600' },
    { id: 'IN_REVIEW', title: 'In Review', color: 'border-amber-400 dark:border-amber-600' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-400 dark:border-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tasks Kanban</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop tasks between workflow columns to update real-time progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => dispatch(setFilterPriority(e.target.value))}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <Button onClick={() => setCreateModalOpen(true)} size="sm" icon={Plus}>
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnConfig.map((col) => {
            const taskList = columns[col.id] || [];

            return (
              <div
                key={col.id}
                className="flex flex-col bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 max-h-[calc(100vh-14rem)]"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{col.title}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {taskList.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Task Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-2.5 pr-1 transition-colors min-h-[150px] ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl' : ''
                      }`}
                    >
                      {taskList.map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(providedDrag, snapshotDrag) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              className={`p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-xs transition-all duration-200 cursor-grab active:cursor-grabbing group ${
                                snapshotDrag.isDragging
                                  ? 'shadow-xl ring-2 ring-indigo-500/40 rotate-1 scale-105'
                                  : 'hover:border-indigo-400/50 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01]'
                              }`}
                            >
                              {/* Task header */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge
                                  variant={
                                    task.priority === 'URGENT'
                                      ? 'danger'
                                      : task.priority === 'HIGH'
                                      ? 'warning'
                                      : task.priority === 'LOW'
                                      ? 'default'
                                      : 'primary'
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Title & Desc */}
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                  {task.description}
                                </p>
                              )}

                              {/* Footer: Due date & comments & Assignee */}
                              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                                <div className="flex items-center gap-2">
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.dueDate}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => openCommentModal(task)}
                                    className="flex items-center gap-1 hover:text-indigo-500 cursor-pointer"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                </div>

                                {task.assignedToName ? (
                                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                                    <User className="w-3 h-3 text-indigo-500" />
                                    {task.assignedToName.split(' ')[0]}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Unassigned</span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement OAuth Strategy"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe requirements and deliverables..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Comments Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title={selectedTask ? `Comments: ${selectedTask.title}` : 'Task Comments'}
      >
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
            {taskComments.length > 0 ? (
              taskComments.map((c) => (
                <div key={c.id} className="pt-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.authorName}</span>
                    <span className="text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No comments yet. Be the first to chime in.</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add your comment..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <Button size="sm" type="submit" icon={Send}>
              Send
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
