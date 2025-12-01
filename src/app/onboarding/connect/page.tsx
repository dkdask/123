'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

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
        return 'Connect your EEG device to begin';
      case 'searching':
        return 'Searching for devices...';
      case 'found':
        return 'Device found! Initiating connection...';
      case 'connecting':
        return 'Establishing secure connection...';
      case 'connected':
        return 'Connection complete!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 flex flex-col items-center justify-center p-6">
      {/* Brain Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-64 h-64 mb-8"
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
          className="absolute inset-0 rounded-full border-4 border-dashed border-purple-500/30"
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
          className="absolute inset-8 rounded-full border-4 border-dashed border-pink-500/30"
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
            absolute inset-16 rounded-full flex items-center justify-center
            ${connectionState === 'connected' 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-purple-500 to-pink-600'
            }
            shadow-2xl shadow-purple-500/30
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
              className="absolute inset-16 rounded-full bg-purple-500"
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
              className="absolute inset-16 rounded-full bg-pink-500"
            />
          </>
        )}
      </motion.div>

      {/* Status Text */}
      <motion.div
        key={connectionState}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-4">
          EEG Device Connection
        </h1>
        <p className="text-xl text-gray-300">
          {getStatusMessage()}
        </p>
      </motion.div>

      {/* Device Info (shown when found/connecting/connected) */}
      {(connectionState === 'found' || connectionState === 'connecting' || connectionState === 'connected') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-4 mb-8 flex items-center gap-4 border border-gray-700/50"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">NeuroTune EEG Headband</p>
            <p className="text-gray-400 text-sm">Model: NT-2024 • Signal: Strong</p>
          </div>
          {connectionState === 'connected' && (
            <div className="ml-auto">
              <span className="flex items-center gap-2 text-green-400 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Connected
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {connectionState === 'idle' && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleConnect}
            className="w-full"
          >
            Connect Device
          </Button>
        )}
        
        {connectionState === 'connected' && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            className="w-full"
            rightIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Continue to Evaluation
          </Button>
        )}
        
        <button
          onClick={() => router.push('/onboarding/dislikes')}
          className="text-gray-400 hover:text-white transition-colors text-center"
        >
          ← Back to Genre Selection
        </button>
        
        {/* Skip for demo */}
        <button
          onClick={() => router.push('/main')}
          className="text-gray-500 hover:text-gray-300 transition-colors text-center text-sm mt-4"
        >
          Skip to Main Page (Demo)
        </button>
      </div>
    </div>
  );
}
