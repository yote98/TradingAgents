'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import C1Chat to avoid SSR issues
const C1ChatSection = dynamic(
  () => import('../C1ChatSection'),
  { ssr: false }
);

export default function AIChatSection() {
  return (
    <div className="h-full w-full">
      <C1ChatSection />
    </div>
  );
}
