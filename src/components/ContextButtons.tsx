'use client';

import { motion } from 'framer-motion';

type Context = 'study' | 'workout' | 'rest' | 'presleep' | 'commute' | 'stressRelief' | 'feelingGood';

interface ContextButtonsProps {
  selectedContext: Context | null;
  onSelectContext: (context: Context) => void;
}

const CONTEXTS: Array<{ id: Context; label: string; icon: string; color: string }> = [
  { id: 'study', label: '공부', icon: '📚', color: 'from-blue-400 to-blue-500' },
  { id: 'workout', label: '운동', icon: '💪', color: 'from-red-400 to-orange-400' },
  { id: 'rest', label: '휴식', icon: '🛋️', color: 'from-green-400 to-emerald-400' },
  { id: 'presleep', label: '취침 전', icon: '🌙', color: 'from-indigo-400 to-purple-400' },
  { id: 'commute', label: '이동 중', icon: '🚗', color: 'from-yellow-400 to-amber-400' },
  { id: 'stressRelief', label: '스트레스 해소', icon: '🧘', color: 'from-teal-400 to-cyan-400' },
  { id: 'feelingGood', label: '기분 좋음', icon: '✨', color: 'from-pink-400 to-rose-400' },
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
              : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-300'
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
