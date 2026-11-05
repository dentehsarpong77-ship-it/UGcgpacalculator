import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  Semester,
  Course,
  CourseStatus,
  GradeScaleItem,
  SemesterCalculation,
} from '../types';
import { getGradePoint } from '../utils/gradingSystem';

interface SemestersViewProps {
  semesters: Semester[];
  semesterCalculations: SemesterCalculation[];
  gradingScale: GradeScaleItem[];
  addCourse: (semesterId: string, course: Omit<Course, 'id'>) => void;
  updateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (semesterId: string, courseId: string) => void;
  addSemester: (level: number, semesterNumber: 1 | 2, academicYear: string, title?: string) => void;
  deleteSemester: (semesterId: string) => void;
  bulkAddCourses: (semesterId: string, courses: Array<Omit<Course, 'id'>>) => void;
}

export const SemestersView: React.FC<SemestersViewProps> = ({
  semesters,
  semesterCalculations,
  gradingScale,
  addCourse,
  updateCourse,
  deleteCourse,
  addSemester,
  deleteSemester,
  bulkAddCourses,
}) => {
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});

  // Add Semester Modal State
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [newSemLevel, setNewSemLevel] = useState<number>(100);
  const [newSemNumber, setNewSemNumber] = useState<1 | 2>(1);
  const [newSemYear, setNewSemYear] = useState('2024/2025');

  // Bulk Add Modal State
  const [bulkSemesterId, setBulkSemesterId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');

  // Course Deletion Confirmation State
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{
    semesterId: string;
    courseId: string;
    courseCode: string;
  } | null>(null);

  // Toggle semester expand
  const toggleExpand = (semId: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semId]: !prev[semId],
    }));
  };

  // Filtered semesters
  const filteredSemesters = semesters.filter((s) =>
    levelFilter === 'all' ? true : s.level === levelFilter
  );

  // Helper to check for duplicate course codes within a semester
  const getDuplicateCodes = (courses: Course[]) => {
    const counts = new Map<string, number>();
    for (const c of courses) {
      const code = c.code.trim().toUpperCase();
      if (code) {
        counts.set(code, (counts.get(code) || 0) + 1);
      }
    }
    const duplicates = new Set<string>();
    counts.forEach((cnt, code) => {
      if (cnt > 1) duplicates.add(code);
    });
    return duplicates;
  };

  // Handle Bulk Add Submit
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSemesterId || !bulkText.trim()) return;

    const lines = bulkText.trim().split('\n');
    const parsedCourses: Array<Omit<Course, 'id'>> = [];

    for (const line of lines) {
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const code = parts[0] || 'COURSE';
        const title = parts[1] || 'Course Title';
        const credits = parseFloat(parts[2]) || 3;
        const grade = parts[3] ? parts[3].toUpperCase() : null;
        const mark = parts[4] ? parseFloat(parts[4]) : null;

        parsedCourses.push({
          code,
          title,
          credits,
          grade,
          mark,
          status: 'completed',
        });
      }
    }

    if (parsedCourses.length > 0) {
      bulkAddCourses(bulkSemesterId, parsedCourses);
      setBulkSemesterId(null);
      setBulkText('');
    }
  };

  // Handle Add New Empty Course
  const handleAddNewCourseRow = (semesterId: string) => {
    addCourse(semesterId, {
      code: '',
      title: '',
      credits: 3,
      grade: null,
      mark: null,
      status: 'completed',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Level Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Course & Semester Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course codes, credit hours, marks, resits and outstanding results across Levels 100 to 400.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                levelFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-ugNavy-800 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Levels
            </button>
            {[100, 200, 300, 400].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  levelFilter === lvl
                    ? 'bg-white dark:bg-slate-900 text-ugNavy-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                L{lvl}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddSemesterModal(true)}
            className="flex items-center gap-1.5 bg-ugNavy-800 hover:bg-ugNavy-900 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Semester</span>
          </button>
        </div>
      </div>

      {/* Semesters List */}
      <div className="space-y-5">
        {filteredSemesters.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Semesters in this Level
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your semester record to begin tracking courses, grades and calculate SGPA and CGPA.
            </p>
            <button
              onClick={() => setShowAddSemesterModal(true)}
              className="inline-flex items-center gap-1.5 bg-ugNavy-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add Level {levelFilter !== 'all' ? levelFilter : 100} Semester
            </button>
          </div>
        ) : (
          filteredSemesters.map((sem) => {
            const semCalc = semesterCalculations.find((c) => c.semesterId === sem.id);
            const isCollapsed = expandedSemesters[sem.id] === true;
            const duplicateCodes = getDuplicateCodes(sem.courses);

            return (
              <div
                key={sem.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Semester Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(sem.id)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                      aria-label="Toggle collapse"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          Level {sem.level} &bull; Semester {sem.semesterNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                          ({sem.academicYear})
                        </span>
                        {semCalc?.isProvisional && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Provisional Result
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {sem.courses.length} course{sem.courses.length === 1 ? '' : 's'} enrolled
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges & Quick Action Controls */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    {/* SGPA Badge */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        SGPA:
                      </span>
                      <span className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">
                        {semCalc ? semCalc.gpa.toFixed(2) : '0.00'}
                      </span>
                    </div>

                    {/* Credits Badge */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs">
                      <span className="text-slate-500">Credits:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {semCalc?.eligibleCredits || 0}
                      </span>
                      <span className="text-slate-400">/ {semCalc?.registeredCredits || 0}</span>
                    </div>

                    {/* Bulk Add Button */}
                    <button
                      onClick={() => setBulkSemesterId(sem.id)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Bulk Add Multiple Courses"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    {/* Delete Semester */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete Level ${sem.level} Semester ${sem.semesterNumber}?`)) {
                          deleteSemester(sem.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Courses Table (Collapsible) */}
                {!isCollapsed && (
                  <div>
                    {sem.courses.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No courses added to this semester yet.
                        <div className="mt-2">
                          <button
                            onClick={() => handleAddNewCourseRow(sem.id)}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Course Row
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                              <th className="py-2.5 px-3 w-28">Course Code</th>
                              <th className="py-2.5 px-3 min-w-[200px]">Course Title</th>
                              <th className="py-2.5 px-3 w-20 text-center">Credits</th>
                              <th className="py-2.5 px-3 w-20 text-center">Mark (%)</th>
                              <th className="py-2.5 px-3 w-24 text-center">Grade</th>
                              <th className="py-2.5 px-3 w-16 text-center">GP</th>
                              <th className="py-2.5 px-3 w-20 text-center">GPT</th>
                              <th className="py-2.5 px-3 w-32">Status</th>
                              <th className="py-2.5 px-3 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sem.courses.map((course) => {
                              const gp = getGradePoint(course.grade, gradingScale);
                              const isDuplicate = duplicateCodes.has(course.code.trim().toUpperCase());
                              const isExcluded =
                                course.status === 'pending' ||
                                course.status === 'outstanding' ||
                                course.status === 'exempted';
                              const gpt = gp !== null && !isExcluded ? course.credits * gp : null;

                              return (
                                <tr
                                  key={course.id}
                                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition ${
                                    isExcluded ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                                  }`}
                                >
                                  {/* Code */}
                                  <td className="py-2 px-3">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={course.code}
                                        onChange={(e) =>
                                          updateCourse(sem.id, course.id, { code: e.target.value })
                                        }
                                        placeholder="e.g. DCIT 101"
                                        className={`w-full font-mono font-bold uppercase text-xs px-2 py-1 rounded bg-transparent border ${
                                          isDuplicate
                                            ? 'border-rose-400 text-rose-600 focus:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500'
                                        }`}
                                      />
                                      {isDuplicate && (
                                        <span
                                          title="Duplicate course code in this semester!"
                                          className="absolute right-1 top-1.5 text-rose-500 cursor-help"
                                        >
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Title */}
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={course.title}
                                      onChange={(e) =>
                                        updateCourse(sem.id, course.id, { title: e.target.value })
                                      }
                                      placeholder="Course Name / Title"
                                      className="w-full text-xs px-2 py-1 rounded bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500"
                                    />
                                  </td>

                                  {/* Credits */}
                                  <td className="py-2 px-3 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      max="12"
                                      step="1"
                                      value={course.credits}
                                      onChange={(e) =>
                                        updateCourse(sem.id, course.id, {
                                          credits: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-14 text-center font-mono font-semibold text-xs px-1 py-1 rounded bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500"
                                    />
                                  </td>

                                  {/* Mark */}
                                  <td className="py-2 px-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={course.mark !== null ? course.mark : ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                        updateCourse(sem.id, course.id, { mark: val });
                                      }}
                                      placeholder="-"
                                      disabled={course.status === 'pending' || course.status === 'outstanding'}
                                      className="w-16 text-center font-mono text-xs px-1 py-1 rounded bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 disabled:opacity-40"
                                    />
                                  </td>

                                  {/* Grade */}
                                  <td className="py-2 px-3 text-center">
                                    <select
                                      value={course.grade || ''}
                                      onChange={(e) => {
                                        const g = e.target.value === '' ? null : e.target.value;
                                        updateCourse(sem.id, course.id, { grade: g });
                                      }}
                                      disabled={course.status === 'pending' || course.status === 'outstanding'}
                                      className="font-mono font-bold text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 disabled:opacity-40"
                                    >
                                      <option value="">N/A</option>
                                      {gradingScale.map((item) => (
                                        <option key={item.grade} value={item.grade}>
                                          {item.grade} ({item.gradePoint.toFixed(1)})
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Grade Point */}
                                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-300">
                                    {isExcluded ? 'N/A' : gp !== null ? gp.toFixed(1) : '-'}
                                  </td>

                                  {/* GPT */}
                                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                                    {isExcluded ? (
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium">
                                        Pending
                                      </span>
                                    ) : gpt !== null ? (
                                      gpt.toFixed(1)
                                    ) : (
                                      '-'
                                    )}
                                  </td>

                                  {/* Status Selector */}
                                  <td className="py-2 px-3">
                                    <select
                                      value={course.status}
                                      onChange={(e) =>
                                        updateCourse(sem.id, course.id, {
                                          status: e.target.value as CourseStatus,
                                        })
                                      }
                                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${
                                        course.status === 'completed'
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                          : course.status === 'pending'
                                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                          : course.status === 'outstanding'
                                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                          : course.status === 'resit_required'
                                          ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      <option value="completed">Completed</option>
                                      <option value="pending">Result Pending</option>
                                      <option value="outstanding">Outstanding</option>
                                      <option value="resit_required">Resit Required</option>
                                      <option value="repeated">Repeated</option>
                                      <option value="exempted">Exempted</option>
                                    </select>
                                  </td>

                                  {/* Delete Course Button */}
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      onClick={() =>
                                        setDeleteCourseTarget({
                                          semesterId: sem.id,
                                          courseId: course.id,
                                          courseCode: course.code || 'Course',
                                        })
                                      }
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                      title="Delete Course"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Table Footer Toolbar */}
                    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => handleAddNewCourseRow(sem.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Course Row
                      </button>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span>
                          Eligible Credits:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-mono">
                            {semCalc?.eligibleCredits || 0}
                          </strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Semester Total GPT:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-mono">
                            {semCalc?.totalGpt.toFixed(1) || '0.0'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Semester Modal */}
      {showAddSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Academic Semester
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  University Level
                </label>
                <select
                  value={newSemLevel}
                  onChange={(e) => setNewSemLevel(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={100}>Level 100 (First Year)</option>
                  <option value={200}>Level 200 (Second Year)</option>
                  <option value={300}>Level 300 (Third Year)</option>
                  <option value={400}>Level 400 (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester Number
                </label>
                <select
                  value={newSemNumber}
                  onChange={(e) => setNewSemNumber(Number(e.target.value) as 1 | 2)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>Semester 1 (First Semester)</option>
                  <option value={2}>Semester 2 (Second Semester)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={newSemYear}
                  onChange={(e) => setNewSemYear(e.target.value)}
                  placeholder="e.g. 2024/2025"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddSemesterModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addSemester(newSemLevel, newSemNumber, newSemYear);
                  setShowAddSemesterModal(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-ugNavy-800 hover:bg-ugNavy-900 text-white"
              >
                Create Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Courses Modal */}
      {bulkSemesterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Add Courses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste courses with format: <br />
                <code className="text-ugNavy-700 dark:text-ugNavy-300">
                  CODE, Title, Credits, Grade
                </code>
              </p>
            </div>

            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`DCIT 101, Introduction to Computer Science, 3, A\nDCIT 103, Office Productivity Tools, 3, B+\nMATH 121, Algebra and Trigonometry, 3, B`}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBulkSemesterId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Insert Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Dialog */}
      {deleteCourseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Confirm Course Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900 dark:text-white">{deleteCourseTarget.courseCode}</strong>?
              This will update your SGPA and CGPA immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCourseTarget(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCourse(deleteCourseTarget.semesterId, deleteCourseTarget.courseId);
                  setDeleteCourseTarget(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
