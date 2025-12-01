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
  moodState = 'No data yet',
  emotionalProfile = 'Connect EEG device to begin',
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-50 overflow-y-auto"
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">My UI</h2>
                    <p className="text-sm text-gray-400">EEG Analysis Summary</p>
                  </div>
                </div>
                
                {/* Mood State */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Current Mood
                  </h3>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-lg font-bold text-white">{moodState}</p>
                    <p className="text-sm text-gray-300 mt-1">{emotionalProfile}</p>
                  </div>
                </div>
                
                {/* Scores */}
                {recentScores && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Preference Scores
                    </h3>
                    <div className="space-y-3">
                      <ScoreBar label="Engagement" value={recentScores.engagement} color="purple" />
                      <ScoreBar label="Arousal" value={recentScores.arousal} color="pink" />
                      <ScoreBar label="Valence" value={recentScores.valence} color="green" />
                      <ScoreBar label="Overall" value={recentScores.overallPreference} color="blue" />
                    </div>
                  </div>
                )}
                
                {/* HRV Data */}
                {hrvData && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      HRV Metrics
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
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Brain Wave Activity
                  </h3>
                  <div className="bg-gray-800/50 rounded-xl p-4 h-32 flex items-center justify-center border border-gray-700/50">
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
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#9333ea" />
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
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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
    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white">
        {value}
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default Sidebar;
