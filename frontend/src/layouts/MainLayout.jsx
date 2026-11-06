import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from '../components/Toast';
import { wsService } from '../services/websocket';
import { receiveNotification } from '../store/slices/notificationSlice';
import { addToast } from '../store/slices/uiSlice';
import clsx from 'clsx';

export const MainLayout = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    // Connect WebSocket
    wsService.connect((notification) => {
      dispatch(receiveNotification(notification));
      dispatch(
        addToast({
          title: notification.title,
          message: notification.message,
          type: 'info',
        })
      );
    });

    return () => {
      wsService.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar />

      <div
        className={clsx(
          'flex-1 flex flex-col transition-all duration-200',
          sidebarOpen ? 'pl-64' : 'pl-18'
        )}
      >
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default MainLayout;
