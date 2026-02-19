import { useState } from 'react';

export default function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  function show(message: string, type: 'info' | 'success' | 'error' = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }
  function Toast() {
    if (!toast) return null;
    let color = 'bg-blue-100 text-blue-800 border-blue-200';
    if (toast.type === 'success') color = 'bg-green-100 text-green-800 border-green-200';
    if (toast.type === 'error') color = 'bg-red-100 text-red-800 border-red-200';
    return (
      <div className={`fixed bottom-4 right-4 z-50 border p-4 rounded shadow-lg ${color}`}>{toast.message}</div>
    );
  }
  return { show, Toast };
}
