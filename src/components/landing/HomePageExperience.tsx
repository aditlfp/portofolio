'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import SplashScreen from '@/components/ui/SplashScreen';

const ScrollIndicator = dynamic(() => import('./ScrollIndicator'), {
  ssr: false,
  loading: () => null,
});

type Stage = 'splash' | 'skeleton' | 'content';

const SPLASH_DURATION_MS = 850;
const SKELETON_DURATION_MS = 180;

export default function HomePageExperience({
  children,
  skeleton,
}: {
  children: React.ReactNode;
  skeleton: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>('splash');

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setStage('skeleton');
    }, SPLASH_DURATION_MS);

    const contentTimer = window.setTimeout(() => {
      setStage('content');
    }, SPLASH_DURATION_MS + SKELETON_DURATION_MS);

    return () => {
      window.clearTimeout(splashTimer);
      window.clearTimeout(contentTimer);
    };
  }, []);

  if (stage === 'splash') {
    return <SplashScreen />;
  }

  if (stage === 'skeleton') {
    return <>{skeleton}</>;
  }

  return (
    <>
      {children}
      <ScrollIndicator />
    </>
  );
}
