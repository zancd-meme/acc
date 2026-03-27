import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchScoreData } from './services/mockApi';
import { ScoreData } from './types';
import AccuracyGauge from './components/AccuracyGauge';
import StatCard from './components/StatCard';
import PerformanceChart from './components/PerformanceChart';
import { 
  CheckCircle2, 
  Target, 
  Trophy, 
  User, 
  Loader2,
  Activity,
  FileText,
  Leaf,
  BarChart3,
  GripHorizontal,
  Cpu,
  Scan,
  LayoutGrid,
  Layers,
  Newspaper,
  MessageSquare
} from 'lucide-react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';

// Basic source types
type SourceType = 'contract' | 'esg' | 'report' | 'news' | 'opinion';

// Navigation Item Structure
interface NavItemData {
  id: string;
  type: 'single' | 'multi';
  sources: SourceType[];
  label: string;
}

const SOURCE_ID_MAP: Record<SourceType, string> = {
  contract: '22',
  esg: '2',
  report: '3',
  news: '14',
  opinion: '15'
};

const getSourceIcon = (source: SourceType) => {
  switch (source) {
    case 'esg': return Leaf;
    case 'report': return BarChart3;
    case 'contract': return FileText;
    case 'news': return Newspaper;
    case 'opinion': return MessageSquare;
    default: return FileText;
  }
};

const getSourceColor = (source: SourceType) => {
  switch (source) {
    case 'esg': return 'text-emerald-500';
    case 'report': return 'text-cyan-500';
    case 'contract': return 'text-indigo-500';
    case 'news': return 'text-orange-500';
    case 'opinion': return 'text-rose-500';
    default: return 'text-slate-500';
  }
};

const getSourceLabel = (source: SourceType) => {
  switch (source) {
    case 'esg': return 'ESG';
    case 'report': return '年报';
    case 'contract': return '合同';
    case 'news': return '新闻';
    case 'opinion': return '舆情';
    default: return '';
  }
};

const getChipStyles = (source: SourceType) => {
  switch (source) {
    case 'esg': return 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    case 'report': return 'bg-cyan-50/50 border-cyan-200 text-cyan-700 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]';
    case 'contract': return 'bg-indigo-50/50 border-indigo-200 text-indigo-700 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]';
    case 'news': return 'bg-orange-50/50 border-orange-200 text-orange-700 hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]';
    case 'opinion': return 'bg-rose-50/50 border-rose-200 text-rose-700 hover:shadow-[0_0_10px_rgba(244,63,94,0.3)]';
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

// Helper for dynamic button styles
const getItemClasses = (item: NavItemData, isActive: boolean, isTarget: boolean) => {
  // Removed 'transition-all' and 'scale' transforms to prevent conflict with Framer Motion layout and jumping
  const baseClasses = "relative flex flex-col px-4 py-3 rounded-lg cursor-grab active:cursor-grabbing transition-colors border select-none mb-3 overflow-hidden group";
  
  // Highlighting for drag target
  if (isTarget) {
    // We use Framer Motion 'animate' for scale instead of CSS class to avoid layout jumps
    return `${baseClasses} bg-white/80 border-violet-400 ring-2 ring-violet-200 ring-offset-1 shadow-lg z-10`;
  }

  if (item.type === 'multi') {
    return `${baseClasses} ${isActive 
      ? 'bg-violet-50/80 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
      : 'bg-white/40 border-slate-200 hover:border-violet-300'}`;
  }

  const source = item.sources[0];
  switch (source) {
    case 'contract':
      return `${baseClasses} ${isActive 
        ? 'bg-indigo-50/80 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
        : 'bg-white/40 border-slate-200 hover:border-indigo-300'}`;
    case 'esg':
      return `${baseClasses} ${isActive 
        ? 'bg-emerald-50/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
        : 'bg-white/40 border-slate-200 hover:border-emerald-300'}`;
    case 'report':
      return `${baseClasses} ${isActive 
        ? 'bg-cyan-50/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
        : 'bg-white/40 border-slate-200 hover:border-cyan-300'}`;
    case 'news':
      return `${baseClasses} ${isActive 
        ? 'bg-orange-50/80 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
        : 'bg-white/40 border-slate-200 hover:border-orange-300'}`;
    case 'opinion':
      return `${baseClasses} ${isActive 
        ? 'bg-rose-50/80 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
        : 'bg-white/40 border-slate-200 hover:border-rose-300'}`;
    default:
      return `${baseClasses} bg-white`;
  }
};

const getActiveTextColor = (item: NavItemData, isActive: boolean) => {
  if (!isActive) return 'text-slate-500';
  
  if (item.type === 'multi') return 'text-violet-700';

  switch (item.sources[0]) {
    case 'contract': return 'text-indigo-700';
    case 'esg': return 'text-emerald-700';
    case 'report': return 'text-cyan-700';
    case 'news': return 'text-orange-700';
    case 'opinion': return 'text-rose-700';
    default: return 'text-slate-700';
  }
};

const roundToTwoDecimals = (num: number) => {
  return Math.round(num * 100) / 100;
};

// Enhanced Background Effects Component
const BackgroundEffects = () => {
  // Generate stable random values for particles using useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      size: Math.random() > 0.7 ? 3 : 2,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-slate-50">
       {/* Deep Space Gradient Base */}
       <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100" />

       {/* Enhanced Tech Grid */}
       <div 
         className="absolute inset-0 opacity-[0.06]" 
         style={{
           backgroundImage: `
             linear-gradient(to right, #4f46e5 1px, transparent 1px),
             linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
           `,
           backgroundSize: '40px 40px',
           maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
         }}
       />
       
       {/* Moving Scanline Overlay */}
       <motion.div
         initial={{ top: '-10%' }}
         animate={{ top: '120%' }}
         transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
         className="absolute inset-x-0 h-48 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent skew-y-12"
       />

       {/* Large Pulsing Orbs */}
       <motion.div 
         animate={{ 
           scale: [1, 1.15, 1],
           opacity: [0.15, 0.25, 0.15],
           rotate: [0, 5, 0],
         }}
         transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
         className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-indigo-600/15 rounded-full blur-[100px] mix-blend-multiply"
       />
       
       <motion.div 
         animate={{ 
           scale: [1, 1.2, 1],
           opacity: [0.1, 0.2, 0.1],
           x: [0, -30, 0]
         }}
         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
         className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/15 rounded-full blur-[100px] mix-blend-multiply"
       />

       {/* Floating Data Particles */}
       {particles.map((p) => (
         <motion.div
           key={p.id}
           className="absolute bg-indigo-400 rounded-sm shadow-[0_0_4px_rgba(99,102,241,0.4)]"
           style={{ 
             left: p.left, 
             top: p.top, 
             width: p.size, 
             height: p.size 
           }}
           animate={{ 
             y: [0, -120],
             opacity: [0, p.opacity, 0]
           }}
           transition={{ 
             duration: p.duration, 
             repeat: Infinity, 
             delay: p.delay, 
             ease: "linear"
           }}
         />
       ))}

       {/* Decorative HUD Elements */}
       <div className="absolute top-1/3 left-[10%] w-32 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30" />
       <div className="absolute bottom-1/3 right-[10%] w-32 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30" />
       <div className="absolute top-[15%] right-[15%] w-2 h-2 border border-indigo-300/30 rounded-full" />
       <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-indigo-300/20 rounded-full" />
    </div>
  );
};

const App: React.FC = () => {
  // Navigation State
  const [navItems, setNavItems] = useState<NavItemData[]>([
    { id: 'contract', type: 'single', sources: ['contract'], label: '合同' },
    { id: 'esg', type: 'single', sources: ['esg'], label: 'ESG' },
    { id: 'report', type: 'single', sources: ['report'], label: '年报' },
    { id: 'news', type: 'single', sources: ['news'], label: '新闻' },
    { id: 'opinion', type: 'single', sources: ['opinion'], label: '舆情' },
  ]);

  const [activeId, setActiveId] = useState<string>('contract');
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  // Data State
  const [data, setData] = useState<ScoreData | null>(null);
  const [sourceCache, setSourceCache] = useState<Partial<Record<SourceType, ScoreData>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [benchmark, setBenchmark] = useState<number>(0);

  // Refs for collision detection
  const navItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const sidebarRef = useRef<HTMLElement>(null);

  // Initial Data Load (for sidebar badges only)
  useEffect(() => {
    const initData = async () => {
      try {
        const [contractRes, esgRes, reportRes, newsRes, opinionRes] = await Promise.all([
          fetchScoreData('22'),
          fetchScoreData('2'),
          fetchScoreData('3'),
          fetchScoreData('14'),
          fetchScoreData('15')
        ]);

        const newCache = {
          contract: contractRes.data,
          esg: esgRes.data,
          report: reportRes.data,
          news: newsRes.data,
          opinion: opinionRes.data
        };
        setSourceCache(newCache);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    initData();
  }, []);

  // Fetch active data when selection changes or fusion occurs
  useEffect(() => {
    const fetchActiveData = async () => {
      const currentItem = navItems.find(item => item.id === activeId);
      if (!currentItem) return;

      setLoading(true);
      
      // Get IDs for current selection
      const typeIds = currentItem.sources
        .map(s => SOURCE_ID_MAP[s])
        .filter(Boolean)
        .join(',');

      try {
        const response = await fetchScoreData(typeIds);
        if (response.code === 200 || response.code === 20000) {
            setData(response.data);
            setBenchmark(response.data.baseScore);
            
            // If single item, update cache for sidebar accuracy badge to keep it fresh
            if (currentItem.type === 'single') {
                const source = currentItem.sources[0];
                setSourceCache(prev => ({
                    ...prev,
                    [source]: response.data
                }));
            }
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveData();
  }, [activeId, navItems]);

  // --- Drag & Merge Logic ---

  // Improved Collision Detection: Check if pointer is inside a target's bounding box
  const checkCollision = (point: { x: number; y: number }, draggedItemId: string): string | null => {
     let targetId: string | null = null;
     
     // We iterate over all refs to see which one contains the pointer
     navItemRefs.current.forEach((el, id) => {
       if (id === draggedItemId) return;
       if (!el) return;
       
       const rect = el.getBoundingClientRect();
       
       // Check if pointer is within the element's bounds
       if (
         point.x >= rect.left && 
         point.x <= rect.right && 
         point.y >= rect.top && 
         point.y <= rect.bottom
       ) {
          targetId = id;
       }
     });
     return targetId;
  };

  const handleDragStart = (item: NavItemData) => {
    setDraggedItemId(item.id);
  };

  const handleDrag = (event: any, info: PanInfo, draggedItem: NavItemData) => {
    const targetId = checkCollision(info.point, draggedItem.id);
    if (targetId !== mergeTargetId) {
      setMergeTargetId(targetId);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo, draggedItem: NavItemData) => {
    setDraggedItemId(null);
    const targetId = checkCollision(info.point, draggedItem.id);
    setMergeTargetId(null);

    if (targetId) {
      const targetItem = navItems.find(item => item.id === targetId);
      if (targetItem) {
        mergeItems(draggedItem, targetItem);
      }
    }
  };

  const mergeItems = (itemA: NavItemData, itemB: NavItemData) => {
    // Combine sources, removing duplicates
    const combinedSources = Array.from(new Set([...itemA.sources, ...itemB.sources]));
    
    const newGroup: NavItemData = {
      id: `group-${Date.now()}`,
      type: 'multi',
      sources: combinedSources,
      label: '多源融合分析'
    };

    setNavItems(prev => {
      // Logic to preserve position: replace itemB with newGroup, remove itemA
      const mapped = prev.map(item => {
        if (item.id === itemB.id) return newGroup;
        if (item.id === itemA.id) return null;
        return item;
      });
      return mapped.filter(Boolean) as NavItemData[];
    });
    setActiveId(newGroup.id);
  };

  // --- Drag & Split Logic ---

  const handleChipDragEnd = (event: any, info: PanInfo, source: SourceType) => {
    // Check if dropped in sidebar area (width is 72 tailwind = 18rem = 288px)
    // Using a safe threshold to detect drop back into sidebar
    if (info.point.x < 288) {
      extractSourceFromGroup(source, activeId, info.point.y);
    }
  };

  // Improved Split Logic with Insertion Index Calculation
  const extractSourceFromGroup = (source: SourceType, groupId: string, dropY: number) => {
    const currentGroup = navItems.find(i => i.id === groupId);
    let nextActiveId = groupId;
    
    // Determine where to insert based on Y position
    let insertIndex = navItems.length; // Default to end
    
    // Find index to insert at
    // We iterate through current items and find the first one whose middle point is below the drop point
    let minDistance = Infinity;
    let closestIndex = -1;

    // Convert Map iterator to Array for index access
    const itemIds = navItems.map(item => item.id);
    
    // Simple heuristic: loop through refs to find closest vertical match
    itemIds.forEach((id, index) => {
        const el = navItemRefs.current.get(id);
        if (el) {
            const rect = el.getBoundingClientRect();
            // If dropping above this item (dropY < center), this is a candidate for insertion
            if (dropY < (rect.top + rect.height / 2)) {
                 if (closestIndex === -1) closestIndex = index;
            }
        }
    });

    if (closestIndex !== -1) {
        insertIndex = closestIndex;
    }

    setNavItems(prev => {
      const groupIndex = prev.findIndex(i => i.id === groupId);
      if (groupIndex === -1) return prev; // Should not happen

      const group = prev[groupIndex];
      const remainingSources = group.sources.filter(s => s !== source);

      // Create the new item that was dragged out
      const newItem: NavItemData = {
        id: source,
        type: 'single',
        sources: [source],
        label: getSourceLabel(source)
      };

      // Create the updated group (or degraded single item)
      let updatedGroupOrItem: NavItemData | null = null;
      
      if (remainingSources.length === 1) {
        const lastSource = remainingSources[0];
        updatedGroupOrItem = {
          id: lastSource, // Use source ID to maintain stability if it degrades
          type: 'single',
          sources: [lastSource],
          label: getSourceLabel(lastSource)
        };
      } else if (remainingSources.length > 1) {
        updatedGroupOrItem = {
          ...group,
          sources: remainingSources
        };
      }

      // Reconstruct array
      // 1. Remove the old group
      const tempItems = prev.filter(i => i.id !== groupId);
      
      // 2. Insert updated group (if valid) back at its original position to maintain stability
      if (updatedGroupOrItem) {
         tempItems.splice(groupIndex, 0, updatedGroupOrItem);
      }
      
      // 3. Insert the NEW dragged item at the calculated drop index
      // Need to adjust index if the group removal shifted things
      let adjustedInsertIndex = insertIndex;
      
      // Safety check bounds
      if (adjustedInsertIndex > tempItems.length) adjustedInsertIndex = tempItems.length;
      
      tempItems.splice(adjustedInsertIndex, 0, newItem);
      
      // Determine what should be active
      if (updatedGroupOrItem) {
          nextActiveId = updatedGroupOrItem.id;
      } else {
          nextActiveId = newItem.id;
      }
      
      return tempItems;
    });

    // We set active ID outside the state updater to ensure it picks up the ID change
    setTimeout(() => {
        if (currentGroup) {
             const remaining = currentGroup.sources.filter(s => s !== source);
             if (remaining.length === 1) {
                 setActiveId(remaining[0]);
             } else {
                 setActiveId(groupId);
             }
        }
    }, 0);
  };

  const calculateAvgAccuracy = (sources: SourceType[]) => {
    let totalC = 0;
    let totalT = 0;
    sources.forEach(s => {
      const d = sourceCache[s];
      if (d) {
        totalC += d.correctCount;
        totalT += d.totalCount;
      }
    });
    if (totalT === 0) return '0.00';
    const rawRate = (totalC / totalT) * 100;
    return roundToTwoDecimals(rawRate).toFixed(2);
  };

  // --- Render Helpers ---

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="relative">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-16 h-16 border-t-2 border-b-2 border-cyan-500 rounded-full"
             />
             <motion.div 
               animate={{ rotate: -180 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 w-16 h-16 border-r-2 border-l-2 border-indigo-500 rounded-full opacity-50 scale-75"
             />
          </div>
        </div>
      );
    }

    if (!data) return <div className="p-10 text-center font-mono text-slate-400">错误：无数据流</div>;

    const currentItem = navItems.find(item => item.id === activeId);
    const isMulti = currentItem?.type === 'multi';

    return (
      <div className="max-w-7xl mx-auto relative min-h-screen">
          {/* Fusion Flash Effect */}
          <AnimatePresence>
            {isMulti && (
              <motion.div
                key="fusion-flash"
                initial={{ opacity: 0.6, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-violet-400/30 to-cyan-400/30 rounded-full blur-[120px] -z-10 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Decorative Corner Markers for Main Content */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-slate-300/50 -translate-x-4 -translate-y-2 pointer-events-none opacity-50 hidden lg:block" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-slate-300/50 translate-x-4 -translate-y-2 pointer-events-none opacity-50 hidden lg:block" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-bottom-2 border-slate-300/50 -translate-x-4 translate-y-4 pointer-events-none opacity-50 hidden lg:block" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-slate-300/50 translate-x-4 translate-y-4 pointer-events-none opacity-50 hidden lg:block" />

          <header className="mb-8 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem?.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gradient-to-br from-white to-slate-100 border border-slate-200 shadow-sm rounded-lg relative overflow-hidden">
                    {/* Icon Glow */}
                    <div className="absolute inset-0 bg-blue-400/10 blur-md"></div>
                    {isMulti ? <Layers className="w-6 h-6 text-violet-500 relative z-10" /> : <Scan className="w-6 h-6 text-indigo-500 relative z-10" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                      {currentItem ? (
                        currentItem.type === 'single' ? `${currentItem.label}精度评分` : currentItem.label
                      ) : '系统就绪'}
                      {isMulti && (
                        <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-mono bg-violet-100 text-violet-600 border border-violet-200 tracking-widest uppercase shadow-sm">
                          融合模式
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">
                      将不同评分按钮叠在一起即可融合
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Decorative Scanner Line Divider */}
            <div className="w-full h-px bg-slate-200 relative mt-5 mb-2 overflow-hidden">
               <motion.div 
                 className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"
                 animate={{ left: ['-50%', '150%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               />
               <div className="absolute left-0 top-0 h-full w-2 bg-slate-300"></div>
               <div className="absolute right-0 top-0 h-full w-2 bg-slate-300"></div>
            </div>

            {/* Draggable Source Chips */}
            <AnimatePresence>
              {currentItem?.type === 'multi' && (
                <motion.div 
                  key="chips-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <div className="flex flex-wrap gap-4 p-5 bg-white/90 backdrop-blur-md rounded-xl border border-white/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <LayoutGrid className="w-16 h-16 text-slate-400" />
                    </div>
                    <div className="w-full text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center relative z-10">
                       <LayoutGrid className="w-3 h-3 mr-2" /> 活动数据源
                    </div>
                    {currentItem.sources.map((source) => {
                      const Icon = getSourceIcon(source);
                      const styleClass = getChipStyles(source);
                      return (
                        <motion.div 
                          drag
                          dragSnapToOrigin
                          dragElastic={1}
                          dragMomentum={false}
                          onDragEnd={(e, info) => handleChipDragEnd(e, info, source)}
                          whileDrag={{ zIndex: 100, cursor: 'grabbing', scale: 1.05 }}
                          key={source}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: { type: "spring", stiffness: 400, damping: 25 }
                          }}
                          className={`flex items-center px-4 py-2.5 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-colors transition-shadow duration-200 select-none relative z-10 ${styleClass}`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="text-sm font-bold tracking-wide mr-3">{getSourceLabel(source)}</span>
                          <GripHorizontal className="w-3.5 h-3.5 opacity-40" />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 h-full min-h-[360px]">
               <AccuracyGauge percentage={data.accuracyRate} benchmark={benchmark} />
            </div>
            <div className="lg:col-span-2 h-full min-h-[360px]">
              <PerformanceChart correct={data.correctCount} total={data.totalCount} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              label="总样本数" 
              value={data.totalCount} 
              icon={Target} 
              theme="indigo"
              delay={0.05}
            />
            <StatCard 
              label="正确计数" 
              value={data.correctCount} 
              icon={CheckCircle2} 
              theme="emerald"
              delay={0.1}
            />
            <StatCard 
              label="基准分数" 
              value={benchmark} 
              icon={Trophy} 
              theme="amber"
              delay={0.15}
              isEditable={true}
              onValueChange={setBenchmark}
            />
             <StatCard 
              label="数据类型 ID" 
              value={data.typeIds.length > 3 ? `${data.typeIds.length} 组` : data.typeIds.join(', ')} 
              icon={Activity} 
              theme="blue"
              delay={0.2}
            />
          </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900 overflow-hidden">
      
      <BackgroundEffects />

      {/* Sidebar Navigation */}
      <aside 
        ref={sidebarRef}
        className="w-72 bg-white/90 backdrop-blur-xl border-r border-white/50 flex flex-col fixed inset-y-0 left-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-100 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-30 rounded-full"></div>
            <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
             <span className="block text-sm font-bold text-slate-800 tracking-wider uppercase">
               精度评分
             </span>
             <span className="block text-[10px] font-mono text-indigo-500 tracking-[0.2em]">
               分析系统 V1.0
             </span>
          </div>
        </div>

        {/* Added overflow-x-hidden to prevent horizontal scrollbar flicker during scaling */}
        <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div className="mb-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono opacity-70">
            检测模块
          </div>
          <AnimatePresence>
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            const isTarget = mergeTargetId === item.id;
            const isDragged = draggedItemId === item.id;
            const avgAcc = calculateAvgAccuracy(item.sources);
            const itemClasses = getItemClasses(item, isActive, isTarget);
            const textColor = getActiveTextColor(item, isActive);
            
            return (
              <motion.div
                layout={!isDragged} // Fix Jitter by disabling layout during drag
                key={item.id}
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: isTarget ? 1.05 : 1, 
                  x: 0, 
                  y: 0, // Fix Reset by explicit animation control
                  zIndex: isTarget ? 10 : 0
                }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                ref={(el) => {
                  if (el) navItemRefs.current.set(item.id, el);
                  else navItemRefs.current.delete(item.id);
                }}
                drag
                dragSnapToOrigin
                dragElastic={0.2}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }} // Smooth snappy reset
                onDragStart={() => handleDragStart(item)}
                onDrag={(e, info) => handleDrag(e, info, item)}
                onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                whileDrag={{ zIndex: 50, cursor: 'grabbing', scale: 1.05 }}
                onClick={() => setActiveId(item.id)}
                className={itemClasses}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'multi' ? 'bg-violet-500' : 'bg-indigo-500'}`} 
                  />
                )}

                <div className="flex items-center w-full">
                  {item.type === 'single' ? (
                     React.createElement(getSourceIcon(item.sources[0]), {
                       className: `w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'} ${textColor}`
                     })
                  ) : (
                    <div className="flex -space-x-2 mr-3 flex-shrink-0">
                      {item.sources.map(s => {
                         const SIcon = getSourceIcon(s);
                         return (
                           <div key={s} className="bg-white rounded-full p-0.5 border border-slate-100 shadow-sm relative z-0">
                             <SIcon className={`w-3.5 h-3.5 ${getSourceColor(s)}`} />
                           </div>
                         )
                      })}
                    </div>
                  )}
                  
                  <span className={`font-medium text-sm truncate ${textColor} tracking-tight`}>
                    {item.label}
                  </span>

                  {item.type === 'multi' && (
                    <div className="ml-auto">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                          {avgAcc}%
                        </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
          
          {navItems.length === 0 && (
             <div className="text-center p-6 mx-2 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
               <span className="text-xs font-mono text-slate-400">未检测到模块</span>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white/40 backdrop-blur-sm">
           <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm">
              <div className="h-9 w-9 rounded bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-inner flex-shrink-0">
                 <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3 overflow-hidden">
                 <p className="text-xs font-mono font-bold text-slate-600 truncate">
                   用户ID: {data ? data.userId : '未知'}
                 </p>
                 <div className="flex items-center mt-1">
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">在线</span>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8 overflow-y-auto relative z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;