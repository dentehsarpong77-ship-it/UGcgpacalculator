import React from 'react';
import {
  GraduationCap,
  Moon,
  Sun,
  Download,
  Upload,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  Menu,
  X,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import type { StudentProfile } from '../types';

interface NavbarProps {
  profile: StudentProfile;
  darkMode: boolean;
  toggleDarkMode: () => void;
  loadSampleData: () => void;
  exportJson: () => void;
  importJson: (json: string) => { success: boolean; message: string };
  exportCsv: () => void;
  onPrint: () => void;
  logout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  darkMode,
  toggleDarkMode,
  loadSampleData,
  exportJson,
  importJson,
  exportCsv,
  onPrint,
  logout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ugNavy-800 to-ugNavy-950 flex items-center justify-center text-white shadow-md shadow-ugNavy-950/20 border border-ugGold-500/30">
              <GraduationCap className="w-6 h-6 text-ugGold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-ugNavy-900 dark:text-white tracking-tight">
                  UG GPA <span className="text-ugGold-600 dark:text-ugGold-400">Planner</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ugNavy-100 dark:bg-ugNavy-900/80 text-ugNavy-800 dark:text-ugNavy-200 uppercase tracking-wider">
                  Legon
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Academic Grade, CGPA & Final GPA Projection Tool
              </p>
            </div>
          </div>

          {/* Student Quick Pill (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate">
              {profile.studentName || 'Student'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 dark:text-slate-300 font-mono">
              ID: {profile.studentId || 'N/A'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-ugGold-700 dark:text-ugGold-400 font-medium">
              L{profile.currentLevel || 100}
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Actions Dropdown / Buttons */}
            <button
              onClick={onPrint}
              title="Print official-style unofficial statement / Save PDF"
              className="p-2 rounded-lg text-slate-600 hover:text-ugNavy-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
              aria-label="Print Statement"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={exportCsv}
              title="Export records to CSV"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={exportJson}
              title="Backup records as JSON"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore records from JSON"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Restore</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={loadSampleData}
              title="Load UG sample courses & student data"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-ugNavy-50 dark:bg-ugNavy-900/60 text-ugNavy-700 dark:text-ugNavy-200 border border-ugNavy-200/60 dark:border-ugNavy-800 hover:bg-ugNavy-100 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-ugNavy-600 dark:text-ugNavy-400" />
              <span>Sample</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 hover:text-ugNavy-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-ugGold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 py-1 px-4 text-center">
        <p className="text-[11px] text-amber-900 dark:text-amber-300 font-medium flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Unofficial Student Planning Tool:</strong> Please confirm official grades, resit policies and degree classifications with the UG Academic Affairs Directorate and your faculty regulations.
          </span>
        </p>
      </div>

      {/* Mobile Menu Panel (Quick Actions) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          {/* Quick Tools */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { exportJson(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <Download className="w-5 h-5 text-blue-600 mb-1.5" />
              Backup JSON
            </button>
            <button
              onClick={() => { exportCsv(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1.5" />
              Export CSV
            </button>
            <button
              onClick={() => { loadSampleData(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="w-5 h-5 text-ugNavy-600 mb-1.5" />
              Load Sample
            </button>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300"
            >
              <LogOut className="w-5 h-5 text-rose-600 mb-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
