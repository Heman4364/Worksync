import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs',
        hover && 'hover:border-slate-300 dark:hover:border-slate-700 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={clsx('flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4', className)}>
    <div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
