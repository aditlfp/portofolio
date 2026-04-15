'use client';

import { useEffect, useRef } from 'react';

export default function ScrollIndicator() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const totalHeightRef = useRef(0);

  useEffect(() => {
    let rafId: number | null = null;

    const measure = () => {
      totalHeightRef.current = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
    };

    const updateProgress = () => {
      const fill = fillRef.current;
      const label = labelRef.current;
      if (!fill) return;

      const totalHeight = totalHeightRef.current;
      const progress = totalHeight <= 0 ? 0 : Math.min(window.scrollY / totalHeight, 1);
      fill.style.setProperty('transform', `scaleY(${progress})`);
      if (label) {
        const offset = Math.round(progress * 18);
        label.style.transform = `perspective(240px) rotateY(-18deg) translate3d(0, ${offset}px, 0)`;
        label.style.opacity = `${0.38 + progress * 0.55}`;
      }
    };

    const handleScroll = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(updateProgress);
    };

    const handleResize = () => {
      measure();
      handleScroll();
    };

    const timeout = setTimeout(() => {
      measure();
      updateProgress();
    }, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  


  return (
    <div className="fixed right-6 top-1/2 z-40 hidden h-72 -translate-y-1/2 lg:flex flex-col items-center gap-5">
      <div className="scroll-track-shell relative flex h-40 w-5 items-center justify-center rounded-full border border-white/10 bg-black/20 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-y-2 w-[2px] rounded-full bg-white/10" />
        <div
          ref={fillRef}
          className="absolute inset-x-[calc(50%-1px)] top-2 h-[calc(100%-1rem)] w-[3px] origin-top rounded-full bg-[#666de0] shadow-[0_0_16px_rgba(79,70,229,0.8)] transition-transform duration-150 ease-out"
        />
      </div>
      <span
        ref={labelRef}
        className="scroll-perspective-label [writing-mode:vertical-lr] text-[11px] font-label text-white uppercase tracking-[0.42em]"
      >
        Perspective
      </span>
    </div>
  );
}
