import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification, clearNotification } = useAuth();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/95 text-rose-900',
    info: 'border-sky-200 bg-sky-50/95 text-sky-900',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${borderStyles[notification.type]}`}>
        {icons[notification.type]}
        <div className="text-sm font-medium leading-relaxed flex-1">
          {notification.message}
        </div>
        <button
          onClick={clearNotification}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 rounded-md"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
