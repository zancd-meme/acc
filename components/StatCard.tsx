import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { LucideIcon, Pencil } from 'lucide-react';

export type StatCardTheme = 'indigo' | 'emerald' | 'amber' | 'pink' | 'blue' | 'slate';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  theme: StatCardTheme;
  delay?: number;
  isEditable?: boolean;
  onValueChange?: (newValue: number) => void;
}

const Counter: React.FC<{ value: number }> = ({ value }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 40, damping: 15 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return <span ref={ref} />;
};

const themeConfig: Record<StatCardTheme, { borderLeft: string, bg: string, text: string, icon: string, shadow: string }> = {
  indigo: {
    borderLeft: "border-indigo-500",
    bg: "from-white/95 to-indigo-100/60",
    text: "text-indigo-600",
    icon: "text-indigo-500",
    shadow: "hover:shadow-indigo-100"
  },
  emerald: {
    borderLeft: "border-emerald-500",
    bg: "from-white/95 to-emerald-100/60",
    text: "text-emerald-600",
    icon: "text-emerald-500",
    shadow: "hover:shadow-emerald-100"
  },
  amber: {
    borderLeft: "border-amber-500",
    bg: "from-white/95 to-amber-100/60",
    text: "text-amber-600",
    icon: "text-amber-500",
    shadow: "hover:shadow-amber-100"
  },
  pink: {
    borderLeft: "border-pink-500",
    bg: "from-white/95 to-pink-100/60",
    text: "text-pink-600",
    icon: "text-pink-500",
    shadow: "hover:shadow-pink-100"
  },
  blue: {
    borderLeft: "border-cyan-500",
    bg: "from-white/95 to-cyan-100/60",
    text: "text-cyan-600",
    icon: "text-cyan-500",
    shadow: "hover:shadow-cyan-100"
  },
  slate: {
    borderLeft: "border-slate-500",
    bg: "from-white/95 to-slate-100/60",
    text: "text-slate-600",
    icon: "text-slate-500",
    shadow: "hover:shadow-slate-100"
  }
};

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  theme = 'slate', 
  delay = 0,
  isEditable = false,
  onValueChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState<string | number>(value);
  const styles = themeConfig[theme];

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onValueChange) {
      const numValue = Number(localValue);
      if (!isNaN(numValue)) {
        onValueChange(numValue);
      } else {
        setLocalValue(value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const isNumber = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative flex flex-col p-5 rounded-lg border border-white/80 bg-gradient-to-br ${styles.bg} backdrop-blur-xl shadow-sm ${styles.shadow} transition-all duration-300 group overflow-hidden`}
    >
      {/* Tech Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.borderLeft}`} />
      
      {/* Decorative Plus */}
      <div className="absolute top-2 right-2 text-slate-200 opacity-50">+</div>

      <div className="flex items-center justify-between mb-3 pl-2">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${styles.icon}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{label}</span>
        </div>
        {isEditable && !isEditing && (
           <Pencil 
              className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-500" 
              onClick={() => setIsEditing(true)}
           />
        )}
      </div>
      
      <div className="pl-2">
        {isEditable && isEditing ? (
          <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-2xl font-mono font-bold bg-transparent border-b border-indigo-500 outline-none text-slate-700"
          />
        ) : (
          <div 
            className={`text-2xl font-mono font-bold tracking-tight text-slate-700 ${isEditable ? 'cursor-pointer hover:text-indigo-600 transition-colors' : ''}`}
            onClick={() => isEditable && setIsEditing(true)}
          >
            {isNumber && !isEditing ? <Counter value={value as number} /> : value}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;