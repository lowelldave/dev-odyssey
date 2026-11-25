import { useEffect } from 'react';
import { useStore } from '../../store';

/** Shows the latest store toast for a few seconds. The live region is always mounted so it is announced. */
export default function ToastHost() {
  const toast = useStore((s) => s.toast);
  const dismiss = useStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(dismiss, 4000);
    return () => window.clearTimeout(id);
  }, [toast, dismiss]);

  return (
    <div role="status" aria-live="polite" className="toast-host">
      {toast && (
        <div key={toast.id} className="jr-toast">
          {toast.text}
        </div>
      )}
    </div>
  );
}
