import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Target,
  FileText,
  Sliders,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'semesters', label: 'Courses', icon: BookOpen },
    { id: 'fgpa', label: 'FGPA', icon: Calculator },
    { id: 'simulator', label: 'Target', icon: Target },
    { id: 'statement', label: 'Results', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-ugNavy-800 dark:text-ugGold-400 font-bold bg-ugGold-100/50 dark:bg-ugGold-900/20'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
