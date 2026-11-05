import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Target,
  FileText,
  Sliders,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type { CgpaCalculation } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cgpaCalculation: CgpaCalculation;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  cgpaCalculation,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      id: 'semesters',
      label: 'My Courses & Semesters',
      icon: BookOpen,
      description: 'L100 - L400 records',
    },
    {
      id: 'fgpa',
      label: 'FGPA Projection Planner',
      icon: Calculator,
      description: '1:1:2:2 Degree Weighting',
    },
    {
      id: 'simulator',
      label: 'First Class Simulator',
      icon: Target,
      description: 'Target 3.60+ Scenarios',
    },
    {
      id: 'statement',
      label: 'Results Statement',
      icon: FileText,
      description: 'Printable Academic Report',
    },
    {
      id: 'settings',
      label: 'Settings & Regulations',
      icon: Sliders,
      description: 'Grading scale & Resit policy',
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-4">
        {/* Navigation list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-sm space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-ugNavy-800 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-ugNavy-950/60 text-ugGold-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs leading-tight">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      isActive ? 'text-ugNavy-200' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Academic Standing Card */}
        <div className="bg-gradient-to-br from-ugNavy-900 to-ugNavy-950 rounded-2xl p-4 text-white border border-ugNavy-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ugGold-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Degree Standing
            </span>
            {cgpaCalculation.isProvisional && (
              <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                PROVISIONAL
              </span>
            )}
          </div>
          <div className="text-xl font-extrabold tracking-tight mb-1 text-white">
            {cgpaCalculation.degreeClassification.title}
          </div>
          <p className="text-xs text-ugNavy-200 line-clamp-2 mb-3">
            {cgpaCalculation.degreeClassification.description}
          </p>

          <div className="pt-2 border-t border-ugNavy-800/80 flex items-center justify-between text-xs">
            <span className="text-ugNavy-300">CGPA:</span>
            <span className="font-mono font-bold text-ugGold-400 text-sm">
              {cgpaCalculation.cgpa > 0 ? cgpaCalculation.cgpa.toFixed(2) : '0.00'} / 4.00
            </span>
          </div>
        </div>

        {/* Regulation note */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-ugNavy-600 dark:text-ugNavy-400 shrink-0 mt-0.5" />
          <span>
            UG Academic Regulations: Undergrad degrees require a minimum CGPA of 1.00 for a Pass Degree and 3.60 for First Class Honours.
          </span>
        </div>
      </div>
    </aside>
  );
};
