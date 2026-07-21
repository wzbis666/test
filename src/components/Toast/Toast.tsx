import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export interface ToastData {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

let toastId = 0;
let addToastFn: ((t: ToastData) => void) | null = null;

export function showToast(message: string, action?: ToastData['action']) {
  if (addToastFn) {
    addToastFn({ id: ++toastId, message, action });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToastFn = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          <span>{t.message}</span>
          {t.action && (
            <button className={styles.action} onClick={t.action.onClick}>
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
