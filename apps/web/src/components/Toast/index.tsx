import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const colors = {
    success: { bg: '#22c55e22', border: '#22c55e', text: '#22c55e' },
    error: { bg: '#ef444422', border: '#ef4444', text: '#ef4444' },
    info: { bg: '#38bdf822', border: '#38bdf8', text: '#38bdf8' }
  };

  const color = colors[type];

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      background: color.bg, border: `1px solid ${color.border}`,
      color: color.text, padding: '12px 24px', borderRadius: 12,
      fontWeight: 600, fontSize: '0.9rem', zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {message}
    </div>
  );
}
