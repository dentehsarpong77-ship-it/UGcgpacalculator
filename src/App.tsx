import { useState, useEffect } from 'react';
import { useAcademicRecords } from './hooks/useAcademicRecords';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { SemestersView } from './components/SemestersView';
import { FgpaPlannerView } from './components/FgpaPlannerView';
import { FirstClassSimulatorView } from './components/FirstClassSimulatorView';
import { ResultsStatementView } from './components/ResultsStatementView';
import { SettingsView } from './components/SettingsView';
import { GraduationCap } from 'lucide-react';

export function App() {
  const { studentEmail, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    semesters,
    settings,
    semesterCalculations,
    cgpaCalculation,
    addCourse,
    updateCourse,
    deleteCourse,
    addSemester,
    deleteSemester,
    bulkAddCourses,
    updateProfile,
    updateResitPolicy,
    updateLevelWeights,
    updateGradingScale,
    toggleDarkMode,
    loadSampleData,
    clearAllData,
    exportJson,
    importJson,
    exportCsv,
    loading,
  } = useAcademicRecords(studentEmail);

  useEffect(() => {
    if (!loading && studentEmail && settings.profile.studentName !== studentEmail.split('@')[0]) {
      updateProfile({ studentName: studentEmail.split('@')[0] });
    }
  }, [loading, studentEmail, settings.profile.studentName, updateProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        Loading your academic records...
      </div>
    );
  }

  const handlePrint = () => {
    setActiveTab('statement');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!studentEmail) {
    return <LoginView onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        profile={settings.profile}
        darkMode={settings.darkMode}
        toggleDarkMode={toggleDarkMode}
        loadSampleData={loadSampleData}
        exportJson={exportJson}
        importJson={importJson}
        exportCsv={exportCsv}
        onPrint={handlePrint}
        logout={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-12">
        <div className="flex gap-8 items-start">
          <div className="no-print hidden md:block">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              cgpaCalculation={cgpaCalculation}
            />
          </div>

          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardView
                semesters={semesters}
                semesterCalculations={semesterCalculations}
                cgpaCalculation={cgpaCalculation}
                profile={settings.profile}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'semesters' && (
              <SemestersView
                semesters={semesters}
                semesterCalculations={semesterCalculations}
                gradingScale={settings.gradingScale}
                addCourse={addCourse}
                updateCourse={updateCourse}
                deleteCourse={deleteCourse}
                addSemester={addSemester}
                deleteSemester={deleteSemester}
                bulkAddCourses={bulkAddCourses}
              />
            )}

            {activeTab === 'fgpa' && (
              <FgpaPlannerView
                cgpaCalculation={cgpaCalculation}
                levelWeights={settings.levelWeights}
                updateLevelWeights={updateLevelWeights}
                profile={settings.profile}
              />
            )}

            {activeTab === 'simulator' && (
              <FirstClassSimulatorView
                cgpaCalculation={cgpaCalculation}
                gradingScale={settings.gradingScale}
              />
            )}

            {activeTab === 'statement' && (
              <ResultsStatementView
                semesters={semesters}
                semesterCalculations={semesterCalculations}
                cgpaCalculation={cgpaCalculation}
                profile={settings.profile}
                gradingScale={settings.gradingScale}
                onPrint={handlePrint}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                profile={settings.profile}
                updateProfile={updateProfile}
                resitPolicy={settings.resitPolicy}
                updateResitPolicy={updateResitPolicy}
                gradingScale={settings.gradingScale}
                updateGradingScale={updateGradingScale}
                loadSampleData={loadSampleData}
                clearAllData={clearAllData}
                exportJson={exportJson}
                importJson={importJson}
                exportCsv={exportCsv}
              />
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-ugGold-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              UG GPA Planner &bull; University of Ghana, Legon
            </span>
          </div>
          <div>
            Built for student academic tracking &bull; Data saved locally in browser
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
