import { createSlice } from '@reduxjs/toolkit';

const storedTheme = localStorage.getItem('worksync_theme') || 'light';
if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: storedTheme,
    sidebarOpen: true,
    activeModal: null, // modal name string or null
    toasts: [],
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('worksync_theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    addToast: (state, action) => {
      const id = Date.now();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleTheme, toggleSidebar, setSidebarOpen, openModal, closeModal, addToast, removeToast } =
  uiSlice.actions;

export default uiSlice.reducer;
