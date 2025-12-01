'use client';

import { motion } from 'framer-motion';

type Context = 'study' | 'workout' | 'rest' | 'presleep' | 'commute' | 'stressRelief' | 'feelingGood';

interface ContextButtonsProps {
  selectedContext: Context | null;
  onSelectContext: (context: Context) => void;
}

const CONTEXTS: Array<{ id: Context; label: string; icon: string; color: string }> = [
  { id: 'study', label: 'Study', icon: '📚', color: 'from-blue-500 to-blue-600' },
  { id: 'workout', label: 'Workout', icon: '💪', color: 'from-red-500 to-orange-500' },
  { id: 'rest', label: 'Rest', icon: '🛋️', color: 'from-green-500 to-emerald-500' },
  { id: 'presleep', label: 'Pre-sleep', icon: '🌙', color: 'from-indigo-500 to-purple-500' },
  { id: 'commute', label: 'Commute', icon: '🚗', color: 'from-yellow-500 to-amber-500' },
  { id: 'stressRelief', label: 'Stress Relief', icon: '🧘', color: 'from-teal-500 to-cyan-500' },
  { id: 'feelingGood', label: 'Feeling Good', icon: '✨', color: 'from-pink-500 to-rose-500' },
];

export function ContextButtons({ selectedContext, onSelectContext }: ContextButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {CONTEXTS.map((context) => (
        <motion.button
          key={context.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectContext(context.id)}
          className={`
            px-5 py-3 rounded-xl
            flex items-center gap-2
            font-semibold text-sm
            transition-all duration-200
            ${selectedContext === context.id
              ? `bg-gradient-to-r ${context.color} text-white shadow-lg`
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
            }
          `}
        >
          <span className="text-lg">{context.icon}</span>
          <span>{context.label}</span>
          {selectedContext === context.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

export default ContextButtons;
export type { Context };
