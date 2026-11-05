import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Award,
  ShieldAlert,
} from 'lucide-react';
import type {
  CgpaCalculation,
  GradeScaleItem,
} from '../types';
import {
  calculateRequiredTargetGpa,
  simulateGradeMix,
} from '../utils/calculationEngine';

interface FirstClassSimulatorViewProps {
  cgpaCalculation: CgpaCalculation;
  gradingScale: GradeScaleItem[];
}

export const FirstClassSimulatorView: React.FC<FirstClassSimulatorViewProps> = ({
  cgpaCalculation,
  gradingScale,
}) => {
  // Target GPA selection
  const [targetCgpa, setTargetCgpa] = useState<number>(3.60);
  const [remainingCredits, setRemainingCredits] = useState<number>(36);

  // Grade mix simulation sliders (how many courses of each grade)
  const [numA, setNumA] = useState<number>(3);
  const [numBPlus, setNumBPlus] = useState<number>(2);
  const [numB, setNumB] = useState<number>(1);
  const [numCPlus, setNumCPlus] = useState<number>(0);
  const [numC, setNumC] = useState<number>(0);
  const [courseCreditVal, setCourseCreditVal] = useState<number>(3);

  // Run calculation
  const targetResult = calculateRequiredTargetGpa(
    cgpaCalculation.cgpa,
    cgpaCalculation.totalEligibleCredits,
    targetCgpa,
    remainingCredits,
    4.0
  );

  // Run mix simulation
  const mixGradeCredits: Record<string, number> = {
    A: numA * courseCreditVal,
    'B+': numBPlus * courseCreditVal,
    B: numB * courseCreditVal,
    'C+': numCPlus * courseCreditVal,
    C: numC * courseCreditVal,
  };

  const mixSimulationResult = simulateGradeMix(mixGradeCredits, gradingScale);

  // Projected new CGPA after the simulated semester
  const simulatedNewTotalCredits = cgpaCalculation.totalEligibleCredits + mixSimulationResult.totalCredits;
  const simulatedNewTotalGpt = cgpaCalculation.totalGpt + mixSimulationResult.totalGpt;
  const simulatedNewCgpa =
    simulatedNewTotalCredits > 0 ? simulatedNewTotalGpt / simulatedNewTotalCredits : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ugGold-100 dark:bg-ugGold-950 text-ugGold-800 dark:text-ugGold-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Target GPA Goal Simulator
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              First Class & Honours Goal Simulator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Simulate future semester course grade combinations (A, B+, B) to test mathematical feasibility and see how your cumulative standing responds.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Current Standing
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {cgpaCalculation.cgpa > 0 ? cgpaCalculation.cgpa.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Completed Credits
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {cgpaCalculation.totalEligibleCredits}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Planning Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-ugGold-500" />
            Set Target Objective
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Desired Cumulative CGPA
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[3.60, 3.70, 3.80].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetCgpa(val)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition border ${
                    targetCgpa === val
                      ? 'bg-ugNavy-800 text-white border-ugNavy-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {val.toFixed(2)}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1.0"
              max="4.0"
              step="0.01"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 3.6)}
              className="w-full text-xs font-mono font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Remaining Credits
            </label>
            <input
              type="number"
              min="1"
              max="140"
              step="1"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(parseFloat(e.target.value) || 1)}
              className="w-full text-xs font-mono font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Typical UG degree has ~120 - 138 total credits.
            </p>
          </div>

          {/* Target Feasibility Box */}
          <div
            className={`p-4 rounded-xl border ${
              targetResult.isAchievable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1">
              Required Average in Remaining Credits
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              {targetResult.requiredGpa > 0 ? targetResult.requiredGpa.toFixed(2) : '0.00'}
              <span className="text-xs font-sans font-normal ml-1">/ 4.00</span>
            </div>
            <p className="text-xs mt-2 leading-relaxed">
              {targetResult.message}
            </p>
          </div>
        </div>

        {/* What-If Semester Mix Builder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Simulate an Upcoming Semester Grade Mix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust the sliders below to test combinations of grades (e.g. 4 A's and 2 B+'s) and preview the impact on your CGPA.
            </p>
          </div>

          {/* Course Credit weight selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Standard Credits per Course:</span>
            {[2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourseCreditVal(c)}
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  courseCreditVal === c
                    ? 'bg-ugNavy-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {c} Credits
              </button>
            ))}
          </div>

          {/* Grade count steppers */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Grade A */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                Grade A (4.0)
              </div>
              <div className="text-2xl font-bold font-mono my-1 text-slate-900 dark:text-white">
                {numA}
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setNumA(Math.max(0, numA - 1))}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setNumA(numA + 1)}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Grade B+ */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                Grade B+ (3.5)
              </div>
              <div className="text-2xl font-bold font-mono my-1 text-slate-900 dark:text-white">
                {numBPlus}
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setNumBPlus(Math.max(0, numBPlus - 1))}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setNumBPlus(numBPlus + 1)}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Grade B */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-xs font-extrabold text-sky-600 dark:text-sky-400">
                Grade B (3.0)
              </div>
              <div className="text-2xl font-bold font-mono my-1 text-slate-900 dark:text-white">
                {numB}
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setNumB(Math.max(0, numB - 1))}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setNumB(numB + 1)}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Grade C+ */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                Grade C+ (2.5)
              </div>
              <div className="text-2xl font-bold font-mono my-1 text-slate-900 dark:text-white">
                {numCPlus}
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setNumCPlus(Math.max(0, numCPlus - 1))}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setNumCPlus(numCPlus + 1)}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Grade C */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
                Grade C (2.0)
              </div>
              <div className="text-2xl font-bold font-mono my-1 text-slate-900 dark:text-white">
                {numC}
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setNumC(Math.max(0, numC - 1))}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setNumC(numC + 1)}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-700 font-bold border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Outcome Card */}
          <div className="p-4 bg-gradient-to-r from-ugNavy-900 to-ugNavy-950 text-white rounded-xl border border-ugNavy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-ugGold-400 font-bold uppercase tracking-wider">
                Simulated Semester Outcome
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {mixSimulationResult.projectedGpa.toFixed(2)}
                </span>
                <span className="text-xs text-ugNavy-200">
                  term GPA ({mixSimulationResult.totalCredits} credits)
                </span>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 sm:border-l border-ugNavy-800 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] text-ugNavy-300 font-semibold uppercase tracking-wider block">
                Projected New Cumulative CGPA
              </span>
              <span className="text-3xl font-extrabold font-mono text-ugGold-400">
                {simulatedNewCgpa.toFixed(2)}
              </span>
              <span className="text-xs text-ugNavy-200 block">
                {simulatedNewCgpa >= cgpaCalculation.cgpa ? (
                  <span className="text-emerald-400">
                    +{(simulatedNewCgpa - cgpaCalculation.cgpa).toFixed(2)} increase
                  </span>
                ) : (
                  <span className="text-rose-400">
                    {(simulatedNewCgpa - cgpaCalculation.cgpa).toFixed(2)} decrease
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimers & Advice Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Academic Note on FGPA Projections:</p>
          <p>
            Projections are mathematical simulations based on hypothetical grades and standard credit weights. Actual final degree awards depend on satisfying core university requirements (e.g. UGRC requirements), clearing all required resits, fulfilling faculty/departmental prerequisites, and receiving official ratification from the University of Ghana Academic Affairs Directorate.
          </p>
        </div>
      </div>
    </div>
  );
};
