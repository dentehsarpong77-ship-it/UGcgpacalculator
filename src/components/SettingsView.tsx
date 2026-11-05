import React, { useState } from 'react';
import {
  Sliders,
  User,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  RotateCcw,
  Database,
  Lock,
} from 'lucide-react';
import type {
  StudentProfile,
  ResitPolicy,
  GradeScaleItem,
} from '../types';
import { DEFAULT_UG_GRADING_SCALE } from '../utils/gradingSystem';

interface SettingsViewProps {
  profile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  resitPolicy: ResitPolicy;
  updateResitPolicy: (policy: ResitPolicy) => void;
  gradingScale: GradeScaleItem[];
  updateGradingScale: (scale: GradeScaleItem[]) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  exportJson: () => void;
  importJson: (json: string) => { success: boolean; message: string };
  exportCsv: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  updateProfile,
  resitPolicy,
  updateResitPolicy,
  gradingScale,
  updateGradingScale,
  loadSampleData,
  clearAllData,
  exportJson,
  importJson,
  exportCsv,
}) => {
  const [scaleState, setScaleState] = useState<GradeScaleItem[]>(gradingScale);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleGradePointChange = (index: number, newPoint: number) => {
    const updated = [...scaleState];
    updated[index].gradePoint = newPoint;
    setScaleState(updated);
    updateGradingScale(updated);
  };

  const handleResetGradingScale = () => {
    setScaleState(DEFAULT_UG_GRADING_SCALE);
    updateGradingScale(DEFAULT_UG_GRADING_SCALE);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importJson(content);
      alert(res.message);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-ugNavy-700 dark:text-ugNavy-300" />
          Settings, Regulations & Data Backup
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Configure your student profile, academic grading rules, resit handling policies, and manage your local data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Profile Information
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.studentName}
                onChange={(e) => updateProfile({ studentName: e.target.value })}
                placeholder="e.g. Kofi Mensah Boateng"
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student ID Number
                </label>
                <input
                  type="text"
                  value={profile.studentId}
                  onChange={(e) => updateProfile({ studentId: e.target.value })}
                  placeholder="e.g. 10984521"
                  className="w-full p-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Level
                </label>
                <select
                  value={profile.currentLevel}
                  onChange={(e) => updateProfile({ currentLevel: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={100}>Level 100</option>
                  <option value={200}>Level 200</option>
                  <option value={300}>Level 300</option>
                  <option value={400}>Level 400</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Programme of Study
              </label>
              <input
                type="text"
                value={profile.programme}
                onChange={(e) => updateProfile({ programme: e.target.value })}
                placeholder="e.g. BSc. Computer Science"
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College / Faculty
              </label>
              <input
                type="text"
                value={profile.college}
                onChange={(e) => updateProfile({ college: e.target.value })}
                placeholder="e.g. College of Basic and Applied Sciences (CBAS)"
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Resit & Repeat Handling Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-ugGold-600 dark:text-ugGold-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Resit & Repeated Course Policy
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose how multiple attempts for the same course code are treated in CGPA calculations:
          </p>

          <div className="space-y-2 text-xs">
            {[
              {
                id: 'replace',
                label: 'Replace Original Attempt (Recommended UG Practice)',
                desc: 'The latest passing attempt replaces the previous failed grade in CGPA calculations, preventing duplicate credit counting.',
              },
              {
                id: 'keep_highest',
                label: 'Keep Highest Grade',
                desc: 'Takes the highest grade point achieved across all attempts.',
              },
              {
                id: 'keep_both',
                label: 'Count Both Attempts',
                desc: 'Counts credits and grade points for all attempts in total CGPA.',
              },
              {
                id: 'average',
                label: 'Average Both Attempts',
                desc: 'Averages the grade points earned across multiple attempts of the course.',
              },
            ].map((policy) => (
              <label
                key={policy.id}
                className={`block p-3 rounded-xl border cursor-pointer transition ${
                  resitPolicy === policy.id
                    ? 'bg-ugNavy-50 dark:bg-ugNavy-950/60 border-ugNavy-300 dark:border-ugNavy-700 text-ugNavy-900 dark:text-white'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resitPolicy"
                    value={policy.id}
                    checked={resitPolicy === policy.id}
                    onChange={() => updateResitPolicy(policy.id as ResitPolicy)}
                    className="accent-ugNavy-800"
                  />
                  <span className="font-bold">{policy.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5 mt-1">
                  {policy.desc}
                </p>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Undergraduate Grading Scale Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              University of Ghana Undergraduate Grading Scale
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified against UG Academic Regulations. You can inspect or customize grade point mappings below.
            </p>
          </div>
          <button
            onClick={handleResetGradingScale}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-ugNavy-800 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard UG Scale
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 px-3">Mark Range (%)</th>
                <th className="py-2 px-3">Letter Grade</th>
                <th className="py-2 px-3">Grade Point</th>
                <th className="py-2 px-3">Academic Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {scaleState.map((item, idx) => (
                <tr key={item.grade} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-mono">
                    {item.minMark} – {item.maxMark}%
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {item.grade}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="4.0"
                      value={item.gradePoint}
                      onChange={(e) => handleGradePointChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 text-center font-mono font-bold text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Backup & Privacy Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Storage, Privacy & Backups
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              100% Private & Stored Locally
            </div>
            <p>
              Your academic grades and personal information are stored exclusively in your browser's LocalStorage. No data is transmitted to external servers without your consent.
            </p>
            <p>
              To ensure you never lose your records when clearing your browser cache, download a JSON backup regularly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Export Backup (JSON)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              Restore Backup (JSON)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Export Records (CSV)
            </button>

            <button
              onClick={loadSampleData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-ugNavy-50 dark:bg-ugNavy-950 text-ugNavy-800 dark:text-ugNavy-200 border border-ugNavy-200 dark:border-ugNavy-800 hover:bg-ugNavy-100 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Data
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL courses and semesters? This action cannot be undone.')) {
                  clearAllData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
