import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type {
  CgpaCalculation,
  LevelWeights,
  StudentProfile,
} from '../types';
import {
  calculateFgpa,
  calculateRequiredRemainingLevelAverage,
} from '../utils/calculationEngine';
import { DEFAULT_UG_LEVEL_WEIGHTS } from '../utils/gradingSystem';

interface FgpaPlannerViewProps {
  cgpaCalculation: CgpaCalculation;
  levelWeights: LevelWeights;
  updateLevelWeights: (weights: LevelWeights) => void;
  profile: StudentProfile;
}

export const FgpaPlannerView: React.FC<FgpaPlannerViewProps> = ({
  cgpaCalculation,
  levelWeights,
  updateLevelWeights,
  profile,
}) => {
  // User overrides for what-if projections
  const [overrides, setOverrides] = useState<Record<number, number>>({});

  // Target FGPA
  const [targetFgpa, setTargetFgpa] = useState<number>(profile.targetFgpa || 3.60);

  const getLevelGpa = (lvl: number): number => {
    if (overrides[lvl] !== undefined) return overrides[lvl];
    return cgpaCalculation.levelGpas[lvl]?.gpa || 0;
  };

  const setLevelGpa = (lvl: number, val: number) => {
    setOverrides((prev) => ({ ...prev, [lvl]: val }));
  };

  // Projected FGPA using active inputs
  const simulatedLevelGpas: Record<number, number> = {
    100: getLevelGpa(100),
    200: getLevelGpa(200),
    300: getLevelGpa(300),
    400: getLevelGpa(400),
  };

  const fgpaResult = calculateFgpa(simulatedLevelGpas, levelWeights);

  // Determine completed levels from actual records
  const actuallyCompletedLevels = Object.entries(cgpaCalculation.levelGpas)
    .filter(([, data]) => data.credits > 0 && !data.isProvisional)
    .map(([lvl, data]) => ({ level: Number(lvl), gpa: data.gpa }));

  const remainingLevels = [100, 200, 300, 400].filter(
    (lvl) => !actuallyCompletedLevels.some((c) => c.level === lvl)
  );

  const requiredAnalysis = calculateRequiredRemainingLevelAverage(
    actuallyCompletedLevels,
    levelWeights,
    targetFgpa,
    remainingLevels.length > 0 ? remainingLevels : [400]
  );

  const handleResetWeights = () => {
    updateLevelWeights(DEFAULT_UG_LEVEL_WEIGHTS);
    setOverrides({});
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ugGold-100 dark:bg-ugGold-950 text-ugGold-800 dark:text-ugGold-300">
                Official UG Weighting 1:1:2:2
              </span>
              <span className="text-xs text-slate-400">Total Weight: 6</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Final Grade Point Average (FGPA) Projection Planner
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              At the University of Ghana, degree classifications are calculated by weighting Level 100 & 200 at weight 1, and Level 300 & 400 at weight 2. Test future semester projections and see what average you need for your target class.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Projected FGPA</span>
            <span className="text-3xl font-extrabold text-ugNavy-800 dark:text-ugGold-400 font-mono">
              {fgpaResult.fgpa !== null ? fgpaResult.fgpa.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-400 block">/ 4.00</span>
          </div>
        </div>

        {/* Live Formula Display */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-blue-600 dark:text-blue-400">Formula: </span>
            <span>{fgpaResult.formulaString}</span>
          </div>
          <button
            onClick={handleResetWeights}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-sans shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Weights
          </button>
        </div>
      </div>

      {/* Level Weight & GPA Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[100, 200, 300, 400].map((lvl) => {
          const currentWeight = levelWeights[lvl] || 1;
          const currentGpa = getLevelGpa(lvl);
          const setGpa = (val: number) => setLevelGpa(lvl, val);

          const actualData = cgpaCalculation.levelGpas[lvl];
          const isActual = actualData && actualData.credits > 0;

          return (
            <div
              key={lvl}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm space-y-4 ${
                isActual
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Level {lvl}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {isActual ? `${actualData.credits} credits completed` : 'Projected / Future'}
                  </span>
                </div>
                {/* Weight editor */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400">Wt:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={currentWeight}
                    onChange={(e) =>
                      updateLevelWeights({
                        ...levelWeights,
                        [lvl]: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-10 text-center font-mono font-bold text-xs p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* GPA Input */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Level GPA</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {currentGpa.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4.0"
                  step="0.01"
                  value={currentGpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value))}
                  className="w-full accent-ugNavy-800 dark:accent-ugGold-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.00</span>
                  <span>Pass: 1.00</span>
                  <span>First: 3.60</span>
                  <span>4.00</span>
                </div>
              </div>

              {/* Numerical Direct Input */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px]">Direct Entry:</span>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={currentGpa || ''}
                  onChange={(e) => setGpa(Math.min(4, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-16 text-center font-mono font-bold text-xs p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Target FGPA Roadmap Calculator Card */}
      <div className="bg-gradient-to-br from-ugNavy-900 via-ugNavy-800 to-ugNavy-950 rounded-2xl p-6 text-white border border-ugNavy-700 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="text-xs font-bold text-ugGold-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Target Standing Roadmap
            </span>
            <h2 className="text-xl font-bold">
              What Average Do You Need to Graduate with Your Goal?
            </h2>
            <p className="text-xs text-ugNavy-200">
              Based on your completed levels ({actuallyCompletedLevels.map((l) => `L${l.level}`).join(', ') || 'None'}), this calculates the average GPA required in remaining levels under official UG 1:1:2:2 rules.
            </p>
          </div>

          {/* Goal Selector */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-ugNavy-200 mb-1">
                Target FGPA
              </label>
              <select
                value={targetFgpa}
                onChange={(e) => setTargetFgpa(parseFloat(e.target.value))}
                className="bg-ugNavy-950 text-white font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-ugNavy-700"
              >
                <option value={3.60}>3.60 &bull; First Class Honours</option>
                <option value={3.70}>3.70 &bull; Strong First Class</option>
                <option value={3.80}>3.80 &bull; High Distinction</option>
                <option value={3.25}>3.25 &bull; Second Class Upper</option>
                <option value={3.00}>3.00 &bull; Second Class Upper Floor</option>
                <option value={2.50}>2.50 &bull; Second Class Lower</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result analysis banner */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1 bg-white/10 p-4 rounded-xl text-center">
            <span className="text-[11px] text-ugNavy-200 block uppercase tracking-wider font-semibold">
              Required Remaining Average
            </span>
            <span
              className={`text-3xl font-extrabold font-mono tracking-tight ${
                requiredAnalysis.isAchievable ? 'text-ugGold-400' : 'text-rose-400'
              }`}
            >
              {requiredAnalysis.requiredAverage > 0
                ? requiredAnalysis.requiredAverage.toFixed(2)
                : '0.00'}
            </span>
            <span className="text-xs text-ugNavy-300 block mt-0.5">
              across remaining levels
            </span>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              {requiredAnalysis.isAchievable ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <h3 className="font-bold text-sm text-white">
                {requiredAnalysis.isAchievable
                  ? 'Mathematically Achievable Goal!'
                  : 'Goal Exceeds Maximum Grade Scale'}
              </h3>
            </div>
            <p className="text-xs text-ugNavy-200">
              {requiredAnalysis.message}
            </p>
            <p className="text-[11px] text-ugGold-300 italic">
              Notice: Calculations assume standard credit distribution and remain subject to the student's applicable faculty regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
