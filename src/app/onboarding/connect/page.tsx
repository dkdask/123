'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type ConnectionState = 'idle' | 'searching' | 'found' | 'connecting' | 'connected';

export default function ConnectPage() {
  const router = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const handleConnect = () => {
    setConnectionState('searching');
    
    // Simulate device search
    setTimeout(() => {
      setConnectionState('found');
    }, 2000);
    
    // Simulate connection
    setTimeout(() => {
      setConnectionState('connecting');
    }, 3000);
    
    // Connection complete
    setTimeout(() => {
      setConnectionState('connected');
    }, 4500);
  };

  const handleContinue = () => {
    router.push('/onboarding/evaluate');
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'idle':
        return 'EEG 기기를 연결하세요';
      case 'searching':
        return '기기 검색 중...';
      case 'found':
        return '기기를 찾았습니다! 연결 중...';
      case 'connecting':
        return '안전한 연결 수립 중...';
      case 'connected':
        return '연결 완료!';
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative yellow-green blob shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -left-32 top-0 h-full w-[500px]" viewBox="0 0 400 800" fill="none">
          <path
            d="M-100 0 C 200 200, 300 400, 150 600 C 0 800, -100 800, -100 800 L -100 0"
            fill="#E8F5A3"
            opacity="0.7"
          />
        </svg>
        <svg className="absolute right-0 top-1/4 w-[400px] h-[500px]" viewBox="0 0 400 500" fill="none">
          <path
            d="M200 0 C 400 100, 450 250, 300 400 C 150 550, 400 500, 400 500 L 400 0 L 200 0"
            fill="#E8F5A3"
            opacity="0.5"
          />
        </svg>
        <div className="absolute top-32 right-1/4 w-40 h-40 rounded-full bg-[#E8F5A3] opacity-50" />
        <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-[#E8F5A3] opacity-60" />
      </div>

      {/* Brain Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-64 h-64 mb-8 z-10"
      >
        {/* Outer ring */}
        <motion.div
          animate={{
            rotate: connectionState !== 'idle' ? 360 : 0,
          }}
          transition={{
            duration: 3,
            repeat: connectionState !== 'idle' && connectionState !== 'connected' ? Infinity : 0,
            ease: 'linear',
          }}
          className="absolute inset-0 rounded-full border-4 border-dashed border-[#C5D93D]/50"
        />
        
        {/* Inner rings */}
        <motion.div
          animate={{
            rotate: connectionState !== 'idle' ? -360 : 0,
          }}
          transition={{
            duration: 2,
            repeat: connectionState !== 'idle' && connectionState !== 'connected' ? Infinity : 0,
            ease: 'linear',
          }}
          className="absolute inset-8 rounded-full border-4 border-dashed border-[#C5D93D]/30"
        />
        
        {/* Center icon */}
        <motion.div
          animate={{
            scale: connectionState === 'connected' ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: connectionState === 'connected' ? 0 : 0,
          }}
          className={`
            absolute inset-16 rounded-full flex items-center justify-center shadow-xl
            ${connectionState === 'connected' 
              ? 'bg-[#C5D93D]' 
              : 'bg-gray-400'
            }
          `}
        >
          {connectionState === 'connected' ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </motion.svg>
          ) : (
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </motion.div>
        
        {/* Pulse effects */}
        {connectionState !== 'idle' && connectionState !== 'connected' && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-16 rounded-full bg-[#C5D93D]"
            />
            <motion.div
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
              className="absolute inset-16 rounded-full bg-[#C5D93D]"
            />
          </>
        )}
      </motion.div>

      {/* Status Text */}
      <motion.div
        key={connectionState}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl font-bold text-black mb-4">
          EEG 기기 연결
        </h1>
        <p className="text-xl text-gray-700">
          {getStatusMessage()}
        </p>
      </motion.div>

      {/* Device Info (shown when found/connecting/connected) */}
      {(connectionState === 'found' || connectionState === 'connecting' || connectionState === 'connected') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-8 flex items-center gap-4 border border-gray-200 shadow-lg z-10"
        >
          <div className="w-12 h-12 bg-[#C5D93D] rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <p className="text-black font-medium">NeuroTune EEG Headband</p>
            <p className="text-gray-500 text-sm">Model: NT-2024 • Signal: Strong</p>
          </div>
          {connectionState === 'connected' && (
            <div className="ml-auto">
              <span className="flex items-center gap-2 text-[#C5D93D] text-sm font-medium">
                <span className="w-2 h-2 bg-[#C5D93D] rounded-full animate-pulse" />
                Connected
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md z-10">
        {connectionState === 'idle' && (
          <button
            onClick={handleConnect}
            className="w-full px-8 py-3 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            기기 연결
          </button>
        )}
        
        {connectionState === 'connected' && (
          <button
            onClick={handleContinue}
            className="w-full px-8 py-3 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            평가 시작하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => router.push('/onboarding/dislikes')}
          className="text-gray-600 hover:text-black transition-colors text-center"
        >
          ← 장르 선택으로 돌아가기
        </button>
        
        {/* Skip for demo */}
        <button
          onClick={() => router.push('/main')}
          className="text-gray-400 hover:text-gray-600 transition-colors text-center text-sm mt-4"
        >
          메인 페이지로 건너뛰기 (데모)
        </button>
      </div>
    </div>
  );
}
