import { useState, useEffect, useMemo } from 'react';
import { db } from '../db/db';
import type {
  Semester,
  Course,
  AppSettings,
  StudentProfile,
  ResitPolicy,
  LevelWeights,
  GradeScaleItem,
  CourseStatus,
} from '../types';
import {
  SAMPLE_SEMESTERS,
  INITIAL_APP_SETTINGS,
} from '../data/sampleData';
import {
  calculateCumulativeGpa,
  calculateSemesterGpa,
} from '../utils/calculationEngine';
import { getGradeFromMark, getGradePoint } from '../utils/gradingSystem';

export function useAcademicRecords(studentEmail: string | null) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!studentEmail) {
        setSemesters(SAMPLE_SEMESTERS);
        setSettings(INITIAL_APP_SETTINGS);
        setLoading(false);
        return;
      }

      // Try to load from IndexedDB
      // We use the studentEmail as the key for settings, and store semesters with a sem_ prefix
      const dbSettings = await db.settings.get(studentEmail);

      const dbSemesters = await db.semesters
        .where('id')
        .startsWith(`sem_${studentEmail}_`)
        .toArray();

      if (dbSemesters.length > 0) {
        setSemesters(dbSemesters);
      } else {
        setSemesters(SAMPLE_SEMESTERS);
      }

      if (dbSettings) {
        setSettings(dbSettings);
      } else {
        setSettings(INITIAL_APP_SETTINGS);
      }
      setLoading(false);
    }
    loadData();
  }, [studentEmail]);

  // Keep IndexedDB updated
  useEffect(() => {
    if (!loading && studentEmail) {
      // Clear old semesters for this user
      db.semesters
        .where('id')
        .startsWith(`sem_${studentEmail}_`)
        .delete();

      // Save current semesters
      const semestersToPut = semesters.map(s => {
        const idParts = s.id.split('_');
        const rawId = idParts.length > 2 ? idParts.slice(2).join('_') : s.id;
        return { ...s, id: `sem_${studentEmail}_${rawId}` };
      });
      db.semesters.bulkPut(semestersToPut);

      // Save settings
      db.settings.put({ ...settings, id: studentEmail } as any);
    }
  }, [semesters, settings, loading, studentEmail]);

  // Sync dark mode with document root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Centralized calculations
  const semesterCalculations = useMemo(() => {
    return semesters.map((sem) => calculateSemesterGpa(sem, settings.gradingScale));
  }, [semesters, settings.gradingScale]);

  const cgpaCalculation = useMemo(() => {
    return calculateCumulativeGpa(
      semesters,
      settings.gradingScale,
      settings.resitPolicy,
      settings.levelWeights
    );
  }, [semesters, settings.gradingScale, settings.resitPolicy, settings.levelWeights]);

  // Actions
  const addCourse = (semesterId: string, courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            courses: [...sem.courses, newCourse],
          };
        }
        return sem;
      })
    );
  };

  const updateCourse = (semesterId: string, courseId: string, updates: Partial<Course>) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            courses: sem.courses.map((course) => {
              if (course.id === courseId) {
                const updated = { ...course, ...updates };

                // Auto-sync mark and grade if one changed
                if ('mark' in updates && updates.mark !== undefined) {
                  if (updates.mark !== null && !isNaN(updates.mark)) {
                    const deducedGrade = getGradeFromMark(updates.mark, settings.gradingScale);
                    if (deducedGrade) updated.grade = deducedGrade;
                  }
                }

                return updated;
              }
              return course;
            }),
          };
        }
        return sem;
      })
    );
  };

  const deleteCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            courses: sem.courses.filter((c) => c.id !== courseId),
          };
        }
        return sem;
      })
    );
  };

  const addSemester = (
    level: 100 | 200 | 300 | 400 | number,
    semesterNumber: 1 | 2,
    academicYear: string,
    title?: string
  ) => {
    const newSemester: Semester = {
      id: `sem-l${level}-s${semesterNumber}-${Date.now()}`,
      level,
      semesterNumber,
      academicYear,
      title: title || `Level ${level} &bull; Semester ${semesterNumber}`,
      courses: [],
    };

    setSemesters((prev) => [...prev, newSemester]);
  };

  const deleteSemester = (semesterId: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
  };

  const updateSemester = (semesterId: string, updates: Partial<Semester>) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === semesterId ? { ...sem, ...updates } : sem))
    );
  };

  const bulkAddCourses = (semesterId: string, newCourses: Array<Omit<Course, 'id'>>) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          const formatted = newCourses.map((c) => ({
            ...c,
            id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          }));
          return { ...sem, courses: [...sem.courses, ...formatted] };
        }
        return sem;
      })
    );
  };

  const updateProfile = (profileUpdates: Partial<StudentProfile>) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates },
    }));
  };

  const updateResitPolicy = (policy: ResitPolicy) => {
    setSettings((prev) => ({ ...prev, resitPolicy: policy }));
  };

  const updateLevelWeights = (weights: LevelWeights) => {
    setSettings((prev) => ({ ...prev, levelWeights: weights }));
  };

  const updateGradingScale = (scale: GradeScaleItem[]) => {
    setSettings((prev) => ({ ...prev, gradingScale: scale }));
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const loadSampleData = () => {
    setSemesters(SAMPLE_SEMESTERS);
    setSettings(INITIAL_APP_SETTINGS);
  };

  const clearAllData = () => {
    setSemesters([]);
  };

  // Export JSON backup
  const exportJson = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      studentProfile: settings.profile,
      settings,
      semesters,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UG_GPA_Planner_${settings.profile.studentId || 'Backup'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const importJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.semesters)) {
        return { success: false, message: 'Invalid backup file structure: missing semesters array.' };
      }

      setSemesters(data.semesters);
      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
          profile: { ...prev.profile, ...(data.studentProfile || data.settings.profile) },
        }));
      }
      return { success: true, message: 'Academic records restored successfully.' };
    } catch (e) {
      return { success: false, message: 'Could not parse JSON file: ' + (e as Error).message };
    }
  };

  // Export CSV
  const exportCsv = () => {
    const headers = ['Level', 'Semester', 'Academic Year', 'Course Code', 'Course Title', 'Credits', 'Mark', 'Grade', 'Grade Point', 'GPT', 'Status', 'Notes'];
    const rows: string[] = [headers.join(',')];

    for (const sem of semesters) {
      for (const course of sem.courses) {
        const gp = getGradePoint(course.grade, settings.gradingScale);
        const gpt = gp !== null ? (course.credits * gp).toFixed(2) : 'N/A';
        const row = [
          `Level ${sem.level}`,
          `Semester ${sem.semesterNumber}`,
          `"${sem.academicYear}"`,
          `"${course.code}"`,
          `"${course.title.replace(/"/g, '""')}"`,
          course.credits,
          course.mark !== null ? course.mark : '',
          course.grade || 'N/A',
          gp !== null ? gp.toFixed(1) : 'N/A',
          gpt,
          course.status,
          `"${(course.notes || '').replace(/"/g, '""')}"`,
        ];
        rows.push(row.join(','));
      }
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `UG_Results_${settings.profile.studentId || 'Records'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV into a semester
  const importCsv = (csvString: string, targetSemesterId: string): { success: boolean; count: number; message: string } => {
    try {
      const lines = csvString.trim().split(/\r\n|\n/);
      if (lines.length < 2) return { success: false, count: 0, message: 'CSV file contains no records.' };

      const newCourses: Array<Omit<Course, 'id'>> = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          const code = parts[0] || 'COURSE';
          const title = parts[1] || 'Imported Course';
          const credits = parseFloat(parts[2]) || 3;
          const grade = parts[3] || null;
          const mark = parts[4] ? parseFloat(parts[4]) : null;
          const status: CourseStatus = (parts[5] as CourseStatus) || 'completed';

          newCourses.push({
            code,
            title,
            credits,
            grade,
            mark,
            status,
          });
        }
      }

      if (newCourses.length > 0) {
        bulkAddCourses(targetSemesterId, newCourses);
        return { success: true, count: newCourses.length, message: `Imported ${newCourses.length} courses.` };
      }
      return { success: false, count: 0, message: 'No valid courses found in CSV.' };
    } catch (e) {
      return { success: false, count: 0, message: 'Failed to parse CSV: ' + (e as Error).message };
    }
  };

  return {
    semesters,
    settings,
    semesterCalculations,
    cgpaCalculation,
    addCourse,
    updateCourse,
    deleteCourse,
    addSemester,
    deleteSemester,
    updateSemester,
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
    importCsv,
    loading, // Add loading here
  };
}
