import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Info } from 'lucide-react';
import { VariationBadge } from './VariationBadge';
import { SparklineChart } from './SparklineChart';
import type { MetricNarrative } from '@/types/narrative';

interface AnimatedNarrativeCardProps {
  metric: MetricNarrative;
  delay?: number;
}

export function AnimatedNarrativeCard({ metric, delay = 0 }: AnimatedNarrativeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const getColorScheme = (type: string) => {
    switch (type) {
      case 'power':
        return {
          gradient: 'from-orange-500 to-red-500',
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          chart: '#FF6B35',
          glow: 'shadow-orange-500/20'
        };
      case 'aerodynamics':
        return {
          gradient: 'from-teal-500 to-cyan-500',
          bg: 'bg-teal-50',
          text: 'text-teal-700',
          chart: '#00C4A7',
          glow: 'shadow-teal-500/20'
        };
      case 'technique':
        return {
          gradient: 'from-purple-500 to-indigo-500',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          chart: '#8B5CF6',
          glow: 'shadow-purple-500/20'
        };
      case 'efficiency':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          text: 'text-green-700',
          chart: '#10B981',
          glow: 'shadow-green-500/20'
        };
      default:
        return {
          gradient: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          chart: '#6B7280',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const colors = getColorScheme(metric.type);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          mass: 1,
          delay: delay * 0.1
        }
      } : {}}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="mb-4 mx-4"
    >
      <Card 
        className={`overflow-hidden cursor-pointer border-0 shadow-lg transition-all duration-300 ${
          isHovered ? `shadow-xl ${colors.glow}` : 'shadow-md'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <motion.div layout transition={{ duration: 0.3 }}>
          <CardContent className="p-5 relative">
            
            {/* Header Row with Animations */}
            <motion.div 
              className="flex items-center justify-between mb-4"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center space-x-3 flex-1">
                <motion.div 
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl relative overflow-hidden`}
                  animate={{ 
                    rotate: isExpanded ? 360 : 0,
                    scale: isHovered ? 1.1 : 1 
                  }}
                  transition={{ 
                    rotate: { duration: 0.6, ease: "easeInOut" },
                    scale: { duration: 0.3 }
                  }}
                >
                  {/* Icon glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 rounded-xl`}
                    animate={{ opacity: isHovered ? 0.1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">{metric.icon}</span>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {metric.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <AnimatedCounter 
                      value={metric.value}
                      unit={metric.unit}
                      delay={delay * 0.1 + 0.5}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={isInView ? { scale: 1, rotate: 0 } : {}}
                      transition={{ 
                        delay: delay * 0.1 + 1, 
                        type: "spring", 
                        stiffness: 200 
                      }}
                    >
                      <VariationBadge change={metric.change} size="sm" />
                    </motion.div>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 ml-2"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </motion.div>

            {/* Interpretation with Typewriter Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: delay * 0.1 + 0.3 }}
              className="mb-4"
            >
              <TypewriterText 
                text={`"${metric.interpretation}"`}
                className="text-base sm:text-lg font-medium text-gray-900 mb-2"
                delay={delay * 0.1 + 0.5}
              />
              <p className="text-sm text-gray-600 leading-relaxed">
                {metric.context}
              </p>
            </motion.div>

            {/* Animated Sparkline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={isInView ? { width: "100%", opacity: 1 } : {}}
              transition={{ duration: 1, delay: delay * 0.1 + 0.8 }}
              className="mb-2"
            >
              <SparklineChart 
                data={metric.history}
                height={40} 
                color={colors.chart}
                gradient={true}
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                Evolución últimas 8 semanas
              </div>
            </motion.div>

            {/* Expanded Details with Animation */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className={`p-4 rounded-xl ${colors.bg} border-l-4 border-l-current ${colors.text}`}>
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1">Plan de Acción</h4>
                        <p className="text-sm leading-relaxed">
                          {metric.actionable || 
                           `Esta métrica indica tu progreso en ${metric.title.toLowerCase()}. 
                            Continúa monitoreando para ver tendencias a largo plazo.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}

// Animated Counter Component
interface AnimatedCounterProps {
  value: string;
  unit: string;
  delay?: number;
}

function AnimatedCounter({ value, unit, delay = 0 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value);

  useEffect(() => {
    if (isNaN(targetValue)) return;

    const timer = setTimeout(() => {
      let current = 0;
      const increment = targetValue / 30; // 30 frames
      const interval = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setDisplayValue(targetValue);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, 50);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [targetValue, delay]);

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xl sm:text-2xl font-bold text-gray-900">
        {value.includes('.') ? displayValue.toFixed(1) : Math.round(displayValue)}
      </span>
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  );
}

// Typewriter Text Component
interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

function TypewriterText({ text, className = '', delay = 0 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            if (prevIndex < text.length) {
              setDisplayText(text.substring(0, prevIndex + 1));
              return prevIndex + 1;
            } else {
              clearInterval(interval);
              return prevIndex;
            }
          });
        }, 30);

        return () => clearInterval(interval);
      }
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [text, delay, currentIndex]);

  return (
    <p className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}