import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={clsx(
      "fixed bottom-4 right-4 flex items-center p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full duration-300 z-[100]",
      bgColors[type]
    )}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-medium text-slate-800">
        {message}
      </div>
      <button
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 text-slate-400 hover:text-slate-500 rounded-lg focus:ring-2 focus:ring-slate-300"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
