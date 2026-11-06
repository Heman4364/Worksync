import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
      {Icon && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h4>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
