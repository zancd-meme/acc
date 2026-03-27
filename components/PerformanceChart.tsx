import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface PerformanceChartProps {
  correct: number;
  total: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ correct, total }) => {
  const incorrect = total - correct;
  
  const data = [
    { name: '正确', value: correct },
    { name: '错误', value: incorrect },
  ];

  const COLORS = ['#10b981', '#ef4444']; // Emerald / Red

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 backdrop-blur-2xl rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col overflow-hidden group"
    >
      {/* Background Decor: Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      
      {/* Background Decor: Ambient Glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 px-5 py-3 border-b border-slate-100/80 bg-white/30 flex justify-between items-center backdrop-blur-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center">
          <span className="w-2 h-2 bg-indigo-500 rounded-sm mr-2 opacity-75"></span>
          性能指标监控
        </h3>
        <div className="flex space-x-1">
          <div className="w-1 h-1 rounded-full bg-slate-400 opacity-50"></div>
          <div className="w-1 h-1 rounded-full bg-slate-400 opacity-50"></div>
          <div className="w-1 h-1 rounded-full bg-slate-400 opacity-50"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-row relative z-10">
        {/* Chart Area */}
        <div className="flex-1 relative flex items-center justify-center py-4">
           
           {/* Animated Background Rings behind Chart */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 border border-dashed border-slate-200/60 rounded-full" 
              />
              <div className="absolute w-32 h-32 bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-full blur-2xl opacity-40" />
           </div>

           <div className="w-full h-full relative z-20">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index]} 
                      style={{ 
                        filter: `drop-shadow(0 0 8px ${COLORS[index]}40)`,
                        strokeWidth: 0
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#475569', fontWeight: 600 }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Data Side Panel */}
        <div className="w-48 flex flex-col justify-center space-y-6 border-l border-slate-100/60 pl-6 bg-gradient-to-l from-white/40 to-transparent backdrop-blur-[2px] pr-4">
           <div className="group/item">
             <div className="flex items-center mb-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] ring-2 ring-emerald-100"></div>
               <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider group-hover/item:text-emerald-600 transition-colors">正确数</span>
             </div>
             <div className="text-2xl font-mono font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors tracking-tight">{correct.toLocaleString()}</div>
           </div>
           
           <div className="group/item">
             <div className="flex items-center mb-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)] ring-2 ring-red-100"></div>
               <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider group-hover/item:text-red-600 transition-colors">错误数</span>
             </div>
             <div className="text-2xl font-mono font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors tracking-tight">{incorrect.toLocaleString()}</div>
           </div>

           <div className="pt-4 border-t border-slate-200/50">
             <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">总样本量</span>
             <div className="text-sm font-mono text-slate-500 font-semibold">{total.toLocaleString()}</div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;