import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface AccuracyGaugeProps {
  percentage: number;
  benchmark?: number;
}

const Counter: React.FC<{ value: number }> = ({ value }) => {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 60, damping: 20 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest * 100) / 100;
        ref.current.textContent = rounded.toFixed(2);
      }
    });
  }, [springValue]);

  return <span ref={ref} className="font-mono">{value.toFixed(2)}</span>;
};

const AccuracyGauge: React.FC<AccuracyGaugeProps> = ({ percentage }) => {
  const size = 280;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 20; // Reduced radius for outer ring space
  const circumference = 2 * Math.PI * radius;

  const circleVariants = {
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset: circumference - (percentage / 100) * circumference,
      transition: { duration: 1.5, ease: "easeOut" as const }
    }
  };

  const getStatus = (p: number) => {
    if (p >= 90) return { color: "#10b981", shadow: "rgba(16,185,129,0.5)", text: "极佳" };
    if (p >= 75) return { color: "#06b6d4", shadow: "rgba(6,182,212,0.5)", text: "良好" };
    if (p >= 60) return { color: "#f59e0b", shadow: "rgba(245,158,11,0.5)", text: "一般" };
    return { color: "#ef4444", shadow: "rgba(239,68,68,0.5)", text: "需优化" };
  };

  const { color: strokeColor, shadow: shadowColor, text: statusText } = getStatus(percentage);

  // Generate tick marks
  const ticks = Array.from({ length: 40 }).map((_, i) => {
    const angle = (i / 40) * 360;
    return (
      <div
        key={i}
        className="absolute w-1 h-2 bg-slate-200 origin-bottom"
        style={{
          bottom: '50%',
          left: '50%',
          transform: `translateX(-50%) rotate(${angle}deg) translateY(-${radius + 20}px)`,
          opacity: i % 5 === 0 ? 1 : 0.4
        }}
      />
    );
  });

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-xl rounded-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full overflow-hidden group">
      
      {/* Decorative corner brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-300/50 rounded-tl-sm"></div>
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-300/50 rounded-tr-sm"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-300/50 rounded-bl-sm"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-300/50 rounded-br-sm"></div>

      <div className="relative" style={{ width: size, height: size }}>
        
        {/* Rotating Outer Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-dashed border-slate-300 opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="absolute inset-4 rounded-full border border-dotted border-slate-300 opacity-30"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* Static Ticks */}
        <div className="absolute inset-0 rounded-full">{ticks}</div>

        <motion.svg 
          width={size} 
          height={size} 
          className="relative z-10 drop-shadow-xl"
          initial={{ rotate: -90 }}
          animate={{ rotate: 270 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="butt"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ filter: `drop-shadow(0 0 8px ${shadowColor})` }}
          />
        </motion.svg>
        
        {/* Center HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="text-center bg-white/50 backdrop-blur-sm p-4 rounded-full shadow-inner border border-white/50">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
              实时准确率
            </span>
            <span className="text-4xl font-bold text-slate-800 tracking-tighter flex items-baseline justify-center">
              <Counter value={percentage} /><span className="text-lg ml-1 text-slate-500 font-sans">%</span>
            </span>
            <div 
              className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-sm border inline-block tracking-widest"
              style={{ 
                color: strokeColor, 
                borderColor: strokeColor,
                backgroundColor: `${strokeColor}10`
              }}
            >
              {statusText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyGauge;