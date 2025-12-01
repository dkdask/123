'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const controls = useAnimation();

  const handleSwipeUp = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);
    controls.start({
      y: typeof window !== 'undefined' ? -window.innerHeight : -1000,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeInOut' },
    }).then(() => {
      router.push('/onboarding/likes');
    });
  }, [controls, hasStarted, router]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -100 || info.velocity.y < -500) {
      handleSwipeUp();
    } else {
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSwipeUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipeUp]);

  return (
    <motion.div
      className="min-h-screen bg-[#E8E8E8] flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {/* Decorative yellow-green blob shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large curved shape on left */}
        <svg className="absolute -left-20 top-0 h-full w-[600px]" viewBox="0 0 400 800" fill="none">
          <path
            d="M-100 0 C 200 200, 350 400, 200 600 C 50 800, -100 800, -100 800 L -100 0"
            fill="#E8F5A3"
            opacity="0.8"
          />
        </svg>
        
        {/* Large curved shape on right */}
        <svg className="absolute right-0 top-1/4 w-[500px] h-[600px]" viewBox="0 0 400 600" fill="none">
          <path
            d="M200 0 C 400 100, 450 300, 300 450 C 150 600, 400 600, 400 600 L 400 0 L 200 0"
            fill="#E8F5A3"
            opacity="0.6"
          />
        </svg>
        
        {/* Small circle top right */}
        <div className="absolute top-20 right-40 w-32 h-32 rounded-full bg-[#E8F5A3] opacity-70" />
        
        {/* Small circle bottom right */}
        <div className="absolute bottom-40 right-20 w-24 h-24 rounded-full bg-[#E8F5A3] opacity-60" />
      </div>

      <motion.div
        className="text-center z-10 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-7xl md:text-8xl font-bold mb-6 text-black"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          NeuroTune
        </motion.h1>

        {/* Korean Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-700 mb-16"
        >
          EEG로 찾는 나만의 음악 취향
        </motion.p>

        {/* Start button - click to navigate */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleSwipeUp}
          className="px-8 py-3 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
        >
          시작하기
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
