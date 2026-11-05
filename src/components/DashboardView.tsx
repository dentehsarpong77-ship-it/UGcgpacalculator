import React from 'react';
import {
  TrendingUp,
  BookCheck,
  Clock,
  Calendar,
} from 'lucide-react';
import type {
  Semester,
  SemesterCalculation,
  CgpaCalculation,
  StudentProfile,
} from '../types';

interface DashboardViewProps {
  semesters: Semester[];
  semesterCalculations: SemesterCalculation[];
  cgpaCalculation: CgpaCalculation;
  profile: StudentProfile;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  semesters,
  semesterCalculations,
  cgpaCalculation,
  profile,
  setActiveTab: _setActiveTab,
}) => {
  // Latest semester calculation
  const latestSemesterCalc = semesterCalculations.length > 0
    ? semesterCalculations[semesterCalculations.length - 1]
    : null;
  // const latestSemester = semesters.length > 0 ? semesters[semesters.length - 1] : null;

  // Grade counts for distribution chart
  const gradeCounts: Record<string, number> = {
    A: 0,
    'B+': 0,
    B: 0,
    'C+': 0,
    C: 0,
    'D+': 0,
    D: 0,
    E: 0,
    F: 0,
  };

  let totalGradedCourses = 0;
  for (const sem of semesters) {
    for (const c of sem.courses) {
      if (c.grade && gradeCounts[c.grade] !== undefined) {
        gradeCounts[c.grade]++;
        totalGradedCourses++;
      }
    }
  }

  // First class threshold progress
  const targetCgpa = profile.targetFgpa || 3.60;
  const progressPercent = Math.min(100, Math.max(0, (cgpaCalculation.cgpa / targetCgpa) * 100));

  // Level summaries (100, 200, 300, 400)
  const levels = [100, 200, 300, 400];

  return (
    <div className="space-y-6">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-br from-ugNavy-900 via-ugNavy-800 to-ugNavy-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-ugNavy-700">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-ugGold-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-ugGold-400 bg-ugGold-950/50 px-3 py-1 rounded-full border border-ugGold-500/30 uppercase tracking-widest">
                {profile.programme || 'Undergraduate'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hello, {profile.studentName ? profile.studentName.split(' ')[0] : 'Scholar'}
            </h1>
            <p className="text-sm text-ugNavy-200">
              {profile.college} &bull; Level {profile.currentLevel}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
              <div className="text-[10px] font-bold text-ugNavy-200 uppercase tracking-wider">CGPA</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {cgpaCalculation.cgpa.toFixed(2)}
              </div>
            </div>
            <div className="bg-ugGold-500/10 backdrop-blur-sm p-4 rounded-2xl border border-ugGold-500/20 text-center">
              <div className="text-[10px] font-bold text-ugGold-400 uppercase tracking-wider">Projected FGPA</div>
              <div className="text-3xl font-black text-ugGold-400 font-mono mt-1">
                {cgpaCalculation.projectedFgpa?.toFixed(2) || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Latest SGPA', value: latestSemesterCalc?.gpa.toFixed(2) || '0.00', icon: Calendar, color: 'text-blue-400' },
          { label: 'Credits Earned', value: cgpaCalculation.totalEligibleCredits, icon: BookCheck, color: 'text-emerald-400' },
          { label: 'Total GPT', value: cgpaCalculation.totalGpt.toFixed(1), icon: TrendingUp, color: 'text-indigo-400' },
          { label: 'Unresolved', value: cgpaCalculation.outstandingCoursesCount + cgpaCalculation.pendingCoursesCount, icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{stat.value}</p>
            </div>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Progress Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Level Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Level Performance</h2>
          <div className="grid grid-cols-2 gap-3">
            {levels.map((lvl) => {
              const data = cgpaCalculation.levelGpas[lvl];
              return (
                <div key={lvl} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Level {lvl}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{data?.gpa.toFixed(2) || 'N/A'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* First Class Progress */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">First Class Target (3.60)</h2>
            <span className="text-xs font-bold text-ugGold-600">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
            <div className="bg-ugGold-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {cgpaCalculation.cgpa >= 3.6 ? 'Currently at First Class Standing.' : `Need ${ (3.6 - cgpaCalculation.cgpa).toFixed(2) } more points.`}
          </p>
        </div>
      </div>
    </div>
  );
};
