import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import taskReducer from '../store/slices/taskSlice';
import projectReducer from '../store/slices/projectSlice';
import draftReducer from '../store/slices/draftSlice';
import calendarReducer from '../store/slices/calendarSlice';
import postReducer from '../store/slices/postSlice';
import teamReducer from '../store/slices/teamSlice';
import notificationReducer from '../store/slices/notificationSlice';
import analyticsReducer from '../store/slices/analyticsSlice';
import kafkaReducer from '../store/slices/kafkaSlice';
import automationReducer from '../store/slices/automationSlice';
import uiReducer from '../store/slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    projects: projectReducer,
    drafts: draftReducer,
    calendar: calendarReducer,
    posts: postReducer,
    teams: teamReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
    kafka: kafkaReducer,
    automations: automationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
