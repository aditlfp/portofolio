'use client';

import { useEffect, useMemo, useState } from 'react';
import AppIcon from '@/components/ui/AppIcon';

const greetingMessages = ['Welcome', 'Hello', 'Hola', 'Bonjour', 'Ciao', 'Hallo', 'Salam'];

export default function SplashScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const activeMessage = useMemo(() => greetingMessages[messageIndex], [messageIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % greetingMessages.length);
    }, 260);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen fixed inset-0 z-[9999] flex items-center justify-center bg-surface text-on-surface">
      <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/25 bg-primary/5 shadow-[0_0_70px_rgba(79,70,229,0.2)]">
          <AppIcon name="bolt" className="text-[3rem] text-primary" />
        </div>
        <div className="space-y-3">
          <div className="overflow-hidden">
            <p className="splash-message text-3xl font-bold tracking-tight text-primary">
              {activeMessage}
            </p>
          </div>
          <p className="max-w-sm text-sm text-on-surface-variant">
            Preparing a fast, responsive portfolio experience.
          </p>
        </div>
      </div>
    </div>
  );
}
