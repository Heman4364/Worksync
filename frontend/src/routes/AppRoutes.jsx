import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Feature Views
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { Profile } from '../features/auth/Profile';
import { Dashboard } from '../features/dashboard/Dashboard';
import { KanbanBoard } from '../features/tasks/KanbanBoard';
import { ProjectList } from '../features/projects/ProjectList';
import { TeamList } from '../features/teams/TeamList';
import { ContentStudio } from '../features/content/ContentStudio';
import { DraftList } from '../features/drafts/DraftList';
import { CalendarView } from '../features/calendar/CalendarView';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { AutomationsView } from '../features/automations/AutomationsView';
import { KafkaReliabilityDashboard } from '../features/kafka/KafkaReliabilityDashboard';
import { AnalyticsView } from '../features/analytics/AnalyticsView';
import { SettingsView } from '../features/settings/SettingsView';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected SaaS App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<KanbanBoard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/content-studio" element={<ContentStudio />} />
          <Route path="/drafts" element={<DraftList />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/profile" element={<Profile />} />

          {/* Manager & Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="MANAGER" />}>
            <Route path="/automations" element={<AutomationsView />} />
          </Route>

          {/* Admin Only System Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/kafka-reliability" element={<KafkaReliabilityDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
