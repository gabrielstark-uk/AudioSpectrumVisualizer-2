
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getClasses = () => {
    const baseClasses = "fixed bottom-4 right-4 flex items-center p-4 rounded-md shadow-lg z-50 max-w-md";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 border border-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border border-yellow-200`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border border-blue-200`;
    }
  };

  return (
    <div className={getClasses()}>
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1 hover:bg-gray-200 transition-colors"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; props: ToastProps }>>([]);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, props: { ...props, onClose: () => removeToast(id) } }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(({ id, props }) => (
        <Toast key={id} {...props} />
      ))}
    </div>
  );

  return { showToast, removeToast, ToastContainer };
};
