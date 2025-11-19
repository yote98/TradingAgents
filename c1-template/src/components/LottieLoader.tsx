"use client";

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieLoaderProps {
  message?: string;
  size?: number;
}

export default function LottieLoader({ message = "Analyzing...", size = 200 }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation data
    fetch('/loading.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  if (!animationData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
        {message && <p className="text-gray-400 text-sm">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div style={{ width: size, height: size }}>
        <Lottie 
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
      {message && (
        <p className="text-gray-400 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
