'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  moodState?: string;
  emotionalProfile?: string;
  recentScores?: {
    engagement: number;
    arousal: number;
    valence: number;
    overallPreference: number;
  };
  hrvData?: {
    sdnn: number;
    rmssd: number;
    lfHf: number;
  };
}

export function Sidebar({
  moodState = '데이터 없음',
  emotionalProfile = 'EEG 기기를 연결하세요',
  recentScores,
  hrvData,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hover trigger area */}
      <div
        className="fixed left-0 top-0 h-full w-4 z-40"
        onMouseEnter={() => setIsOpen(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200 z-50 overflow-y-auto shadow-xl"
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#C5D93D] flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black">My UI</h2>
                    <p className="text-sm text-gray-500">EEG 분석 요약</p>
                  </div>
                </div>
                
                {/* Mood State */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    현재 상태
                  </h3>
                  <div className="bg-[#E8F5A3] rounded-xl p-4 border border-[#C5D93D]/30">
                    <p className="text-lg font-bold text-black">{moodState}</p>
                    <p className="text-sm text-gray-600 mt-1">{emotionalProfile}</p>
                  </div>
                </div>
                
                {/* Scores */}
                {recentScores && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      선호도 점수
                    </h3>
                    <div className="space-y-3">
                      <ScoreBar label="몰입도" value={recentScores.engagement} color="green" />
                      <ScoreBar label="각성도" value={recentScores.arousal} color="yellow" />
                      <ScoreBar label="정서가" value={recentScores.valence} color="blue" />
                      <ScoreBar label="종합" value={recentScores.overallPreference} color="gray" />
                    </div>
                  </div>
                )}
                
                {/* HRV Data */}
                {hrvData && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      HRV 지표
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <MetricCard label="SDNN" value={hrvData.sdnn.toFixed(1)} unit="ms" />
                      <MetricCard label="RMSSD" value={hrvData.rmssd.toFixed(1)} unit="ms" />
                      <MetricCard label="LF/HF" value={hrvData.lfHf.toFixed(2)} />
                    </div>
                  </div>
                )}
                
                {/* Brain Wave Visualization Placeholder */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    뇌파 활동
                  </h3>
                  <div className="bg-[#D4D4D4] rounded-xl p-4 h-32 flex items-center justify-center border border-gray-300">
                    <svg className="w-full h-full" viewBox="0 0 200 60">
                      <motion.path
                        d="M 0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#C5D93D" />
                          <stop offset="50%" stopColor="#8B9A2B" />
                          <stop offset="100%" stopColor="#C5D93D" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    green: 'from-[#C5D93D] to-[#8B9A2B]',
    yellow: 'from-yellow-400 to-yellow-500',
    blue: 'from-blue-400 to-blue-500',
    gray: 'from-gray-500 to-gray-600',
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-black font-medium">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-[#D4D4D4] rounded-lg p-3 text-center border border-gray-300">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-black">
        {value}
        {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default Sidebar;
