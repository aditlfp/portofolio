'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CustomCursor = dynamic(() => import('./CustomCursor'), {
  ssr: false,
  loading: () => null,
});

export default function GlobalEnhancements() {
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const schedule = (callback: () => void) => {
      if (typeof win.requestIdleCallback === 'function' && typeof win.cancelIdleCallback === 'function') {
        const idleId = win.requestIdleCallback(() => callback(), { timeout: 1200 });
        return () => win.cancelIdleCallback?.(idleId);
      }

      const timeoutId = win.setTimeout(callback, 700);
      return () => win.clearTimeout(timeoutId);
    };

    const cancel = schedule(() => setShowCursor(true));
    return cancel;
  }, []);

  return showCursor ? <CustomCursor /> : null;
}
