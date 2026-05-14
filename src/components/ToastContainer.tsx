import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle className="toast-icon" style={{ color: 'var(--color-success)' }} />
          ) : (
            <AlertCircle className="toast-icon" style={{ color: 'var(--color-error)' }} />
          )}
          <span className="toast-message">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ marginLeft: 'auto', background: 'none', color: 'var(--color-white-subtle)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
