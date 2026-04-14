'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      return undefined;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return undefined;
    }

    let visible = false;

    const paint = () => {
      rafRef.current = null;
      cursor.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
    };

    const requestPaint = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(paint);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      if (!visible) {
        visible = true;
        cursor.dataset.visible = 'true';
      }
      requestPaint();
    };

    const handleMouseLeave = () => {
      visible = false;
      cursor.dataset.visible = 'false';
      cursor.dataset.active = 'false';
    };

    const handlePointerState = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('.cursor-pointer, button, a, input, textarea, select, .cursor-interactive');
      cursor.dataset.active = interactive ? 'true' : 'false';
    };

    document.body.classList.add('custom-cursor-active');
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', handleMouseLeave, { passive: true });
    document.addEventListener('pointerover', handlePointerState, { passive: true });
    document.addEventListener('pointerout', handlePointerState, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      document.removeEventListener('pointerover', handlePointerState);
      document.removeEventListener('pointerout', handlePointerState);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" data-active="false" data-visible="false" />;
}
