import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg animate-in slide-in-from-right"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />}

          <div className="flex-1 text-sm">
            {toast.title && <p className="font-semibold text-slate-900 dark:text-slate-100">{toast.title}</p>}
            <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
