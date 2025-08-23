import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { MetricStoryCard } from './MetricStoryCard';
import { useGestureHandlers } from '@/hooks/narrative/useGestureHandlers';
import type { MetricNarrative } from '@/types/narrative';

interface GestureEnhancedCardProps {
  metric: MetricNarrative;
  showHints?: boolean;
}

export function GestureEnhancedCard({ metric, showHints = false }: GestureEnhancedCardProps) {
  const [hasSeenHints, setHasSeenHints] = useState(false);
  const { gestureState, handleSwipeLeft, handleSwipeRight, resetGestureState } = useGestureHandlers();
  const [actionMessage, setActionMessage] = useState<string>('');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const result = handleSwipeLeft(metric);
      setActionMessage(result.message);
      setTimeout(() => setActionMessage(''), 3000);
    },
    onSwipedRight: (eventData) => {
      const result = handleSwipeRight(metric);
      setActionMessage(result.message);
      setTimeout(() => setActionMessage(''), 3000);
    },
    trackMouse: true,
    delta: 60,
    preventScrollOnSwipe: true,
    trackTouch: true
  });

  return (
    <div className="relative" {...swipeHandlers}>
      <MetricStoryCard metric={metric} />
      
      {/* Action Message Overlay */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10"
          >
            <Badge className="bg-blue-600 text-white px-3 py-1 shadow-lg">
              {actionMessage}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gesture Hints */}
      <AnimatePresence>
        {showHints && !hasSeenHints && gestureState.type === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-between px-4 z-20"
            onClick={() => setHasSeenHints(true)}
          >
            <motion.div
              animate={{ x: [-10, 0, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2 text-white bg-black/50 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Comparar</span>
            </motion.div>
            
            <motion.div
              animate={{ x: [10, 0, 10] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="flex items-center space-x-2 text-white bg-black/50 px-3 py-2 rounded-lg"
            >
              <span className="text-sm font-medium">Historial</span>
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe State Overlays */}
      <AnimatePresence>
        {gestureState.type === 'compare' && (
          <SwipeOverlay 
            direction="left" 
            icon={<ArrowLeft className="h-6 w-6" />}
            text="Comparando actividades..."
            color="bg-blue-500"
          />
        )}
        {gestureState.type === 'history' && (
          <SwipeOverlay 
            direction="right" 
            icon={<ArrowRight className="h-6 w-6" />}
            text="Mostrando evolución..."
            color="bg-green-500"
          />
        )}
        {gestureState.type === 'refresh' && (
          <SwipeOverlay 
            direction="down" 
            icon={<RotateCcw className="h-6 w-6 animate-spin" />}
            text="Actualizando datos..."
            color="bg-purple-500"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SwipeOverlayProps {
  direction: 'left' | 'right' | 'up' | 'down';
  icon: React.ReactNode;
  text: string;
  color: string;
}

function SwipeOverlay({ direction, icon, text, color }: SwipeOverlayProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -100, opacity: 0 };
      case 'right': return { x: 100, opacity: 0 };
      case 'up': return { y: -100, opacity: 0 };
      case 'down': return { y: 100, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getInitialPosition()}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`absolute inset-0 ${color} rounded-lg flex items-center justify-center z-30`}
    >
      <div className="text-white text-center">
        <div className="mb-2 flex justify-center">
          {icon}
        </div>
        <div className="text-sm font-medium">
          {text}
        </div>
      </div>
    </motion.div>
  );
}