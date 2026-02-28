import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { PageType, Language, NavItem } from '../types';

interface BottomNavProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  language: Language;
  navItems: NavItem[];
  onReorder: (items: NavItem[]) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onPageChange, language, navItems, onReorder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setIsEditing(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 800);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto ios-blur border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-8 z-40 transition-all duration-300 ${isEditing ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2"
        >
          <span>正在编辑位置</span>
          <button onClick={() => setIsEditing(false)} className="bg-white/20 rounded-full p-0.5">
            <span className="material-symbols-outlined !text-xs">done</span>
          </button>
        </motion.div>
      )}

      <Reorder.Group 
        axis="x" 
        values={navItems} 
        onReorder={onReorder}
        className="flex justify-between items-center w-full"
      >
        {navItems.slice(0, 2).map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            dragListener={isEditing}
            onPointerDown={handleTouchStart}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className={`flex flex-col items-center gap-1 cursor-pointer select-none touch-none ${currentPage === item.id ? 'text-primary' : 'text-slate-400'} ${isEditing ? 'animate-pulse' : ''}`}
            onClick={() => !isEditing && onPageChange(item.id)}
          >
            <span className={`material-symbols-outlined text-[26px] ${currentPage === item.id ? 'filled-icon' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{language === 'zh' ? item.label : item.labelEn}</span>
          </Reorder.Item>
        ))}

        <div className="relative -top-6 px-2">
          <button
            onClick={() => !isEditing && onPageChange('add')}
            className={`size-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform border-[4px] border-white dark:border-slate-900 ${isEditing ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>

        {navItems.slice(2).map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            dragListener={isEditing}
            onPointerDown={handleTouchStart}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className={`flex flex-col items-center gap-1 cursor-pointer select-none touch-none ${currentPage === item.id ? 'text-primary' : 'text-slate-400'} ${isEditing ? 'animate-pulse' : ''}`}
            onClick={() => !isEditing && onPageChange(item.id)}
          >
            <span className={`material-symbols-outlined text-[26px] ${currentPage === item.id ? 'filled-icon' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{language === 'zh' ? item.label : item.labelEn}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </nav>
  );
};
