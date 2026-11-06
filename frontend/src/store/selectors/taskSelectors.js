import { createSelector } from '@reduxjs/toolkit';
import { selectAllTasks } from '../slices/taskSlice';

const selectSearchQuery = (state) => state.tasks.searchQuery;
const selectFilterPriority = (state) => state.tasks.filterPriority;

// Memoized filtered tasks selector
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectSearchQuery, selectFilterPriority],
  (tasks, query, priority) => {
    return tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title?.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase());

      const matchesPriority = priority === 'ALL' || task.priority === priority;

      return matchesQuery && matchesPriority;
    });
  }
);

// Memoized grouped tasks by status for Kanban Board
export const selectKanbanColumns = createSelector([selectFilteredTasks], (tasks) => {
  const columns = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    COMPLETED: [],
  };

  tasks.forEach((task) => {
    if (columns[task.status]) {
      columns[task.status].push(task);
    } else {
      columns.TODO.push(task);
    }
  });

  return columns;
});

// Memoized task statistics selector
export const selectTaskStatistics = createSelector([selectAllTasks], (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReview = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    inReview,
    todo,
    completionRate,
  };
});
