export type CourseStatus =
  | 'completed'
  | 'pending'
  | 'outstanding'
  | 'resit_required'
  | 'repeated'
  | 'exempted';

export interface GradeScaleItem {
  grade: string;
  minMark: number;
  maxMark: number;
  gradePoint: number;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  grade: string | null;
  mark: number | null;
  status: CourseStatus;
  notes?: string;
  isResit?: boolean;
  resitSemesterId?: string;
}

export interface Semester {
  id: string;
  level: 100 | 200 | 300 | 400 | number;
  semesterNumber: 1 | 2;
  academicYear: string;
  title: string;
  courses: Course[];
}

export type ResitPolicy =
  | 'replace'         // Replaces the original grade with the new grade
  | 'keep_highest'    // Retains whichever grade was higher
  | 'keep_both'       // Counts both attempts in CGPA
  | 'average';        // Averages both attempts

export type LevelWeights = Record<number, number>;

export interface StudentProfile {
  studentName: string;
  studentId: string;
  programme: string;
  college: string;
  currentLevel: number;
  targetFgpa: number;
  academicYear: string;
}

export interface AppSettings {
  resitPolicy: ResitPolicy;
  levelWeights: LevelWeights;
  gradingScale: GradeScaleItem[];
  profile: StudentProfile;
  darkMode: boolean;
}

export interface SemesterCalculation {
  semesterId: string;
  level: number;
  semesterNumber: number;
  registeredCredits: number;
  eligibleCredits: number;
  totalGpt: number;
  gpa: number;
  isProvisional: boolean;
  completedCount: number;
  outstandingCount: number;
  pendingCount: number;
}

export interface CgpaCalculation {
  totalRegisteredCredits: number;
  totalEligibleCredits: number;
  totalGpt: number;
  cgpa: number;
  isProvisional: boolean;
  completedCoursesCount: number;
  outstandingCoursesCount: number;
  pendingCoursesCount: number;
  levelGpas: Record<number, { gpa: number; credits: number; gpt: number; isProvisional: boolean }>;
  projectedFgpa: number | null;
  fgpaFormulaString: string;
  degreeClassification: {
    title: string;
    badgeClass: string;
    description: string;
  };
}
