import type { Semester, StudentProfile, AppSettings } from '../types';
import { DEFAULT_UG_GRADING_SCALE, DEFAULT_UG_LEVEL_WEIGHTS } from '../utils/gradingSystem';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  studentName: 'Kofi Mensah Boateng',
  studentId: '10984521',
  programme: 'BSc. Computer Science',
  college: 'College of Basic and Applied Sciences (CBAS)',
  currentLevel: 300,
  targetFgpa: 3.60,
  academicYear: '2024/2025',
};

export const INITIAL_APP_SETTINGS: AppSettings = {
  resitPolicy: 'replace',
  levelWeights: DEFAULT_UG_LEVEL_WEIGHTS,
  gradingScale: DEFAULT_UG_GRADING_SCALE,
  profile: INITIAL_STUDENT_PROFILE,
  darkMode: false,
};

export const SAMPLE_SEMESTERS: Semester[] = [
  {
    id: 'sem-l100-s1',
    level: 100,
    semesterNumber: 1,
    academicYear: '2022/2023',
    title: 'Level 100 &bull; Semester 1',
    courses: [
      { id: 'c-101', code: 'UGRC 150', title: 'Critical Thinking and Practical Reasoning', credits: 3, grade: 'A', mark: 82, status: 'completed' },
      { id: 'c-102', code: 'DCIT 101', title: 'Introduction to Computer Science', credits: 3, grade: 'A', mark: 86, status: 'completed' },
      { id: 'c-103', code: 'DCIT 103', title: 'Office Productivity Tools', credits: 3, grade: 'B+', mark: 78, status: 'completed' },
      { id: 'c-104', code: 'MATH 121', title: 'Algebra and Trigonometry', credits: 3, grade: 'B', mark: 72, status: 'completed' },
      { id: 'c-105', code: 'MATH 123', title: 'Vectors and Geometry', credits: 3, grade: 'B+', mark: 77, status: 'completed' },
      { id: 'c-106', code: 'STAT 111', title: 'Introduction to Statistics and Probability I', credits: 3, grade: 'A', mark: 81, status: 'completed' },
    ],
  },
  {
    id: 'sem-l100-s2',
    level: 100,
    semesterNumber: 2,
    academicYear: '2022/2023',
    title: 'Level 100 &bull; Semester 2',
    courses: [
      { id: 'c-107', code: 'UGRC 110', title: 'Academic Writing I', credits: 3, grade: 'B+', mark: 77, status: 'completed' },
      { id: 'c-108', code: 'DCIT 102', title: 'Computer Hardware Fundamentals and Circuits', credits: 3, grade: 'A', mark: 84, status: 'completed' },
      { id: 'c-109', code: 'DCIT 104', title: 'Programming Fundamentals', credits: 3, grade: 'A', mark: 89, status: 'completed' },
      { id: 'c-110', code: 'MATH 122', title: 'Calculus I', credits: 3, grade: 'B', mark: 71, status: 'completed' },
      { id: 'c-111', code: 'MATH 126', title: 'Algebra and Geometry', credits: 3, grade: 'C+', mark: 68, status: 'completed' },
      { id: 'c-112', code: 'STAT 112', title: 'Introduction to Statistics and Probability II', credits: 3, grade: 'B+', mark: 75, status: 'completed' },
    ],
  },
  {
    id: 'sem-l200-s1',
    level: 200,
    semesterNumber: 1,
    academicYear: '2023/2024',
    title: 'Level 200 &bull; Semester 1',
    courses: [
      { id: 'c-201', code: 'UGRC 210', title: 'Academic Writing II', credits: 3, grade: 'A', mark: 83, status: 'completed' },
      { id: 'c-202', code: 'DCIT 201', title: 'Programming I (Object Oriented Programming)', credits: 3, grade: 'A', mark: 85, status: 'completed' },
      { id: 'c-203', code: 'DCIT 203', title: 'Digital and Logic System Design', credits: 3, grade: 'B+', mark: 79, status: 'completed' },
      { id: 'c-204', code: 'DCIT 205', title: 'Multi-Media and Web Design', credits: 3, grade: 'A', mark: 88, status: 'completed' },
      { id: 'c-205', code: 'MATH 223', title: 'Calculus II', credits: 3, grade: 'B', mark: 73, status: 'completed' },
      { id: 'c-206', code: 'CBAS 210', title: 'Academic Writing in the Sciences', credits: 3, grade: 'B+', mark: 76, status: 'completed' },
    ],
  },
  {
    id: 'sem-l200-s2',
    level: 200,
    semesterNumber: 2,
    academicYear: '2023/2024',
    title: 'Level 200 &bull; Semester 2',
    courses: [
      { id: 'c-207', code: 'DCIT 202', title: 'Mobile Application Development', credits: 3, grade: 'A', mark: 84, status: 'completed' },
      { id: 'c-208', code: 'DCIT 204', title: 'Data Structures and Algorithms', credits: 3, grade: 'B+', mark: 78, status: 'completed' },
      { id: 'c-209', code: 'DCIT 206', title: 'Systems Administration', credits: 3, grade: 'A', mark: 81, status: 'completed' },
      { id: 'c-210', code: 'DCIT 208', title: 'Software Engineering', credits: 3, grade: 'A', mark: 86, status: 'completed' },
      { id: 'c-211', code: 'MATH 224', title: 'Introductory Abstract Algebra', credits: 3, grade: 'B', mark: 70, status: 'completed' },
    ],
  },
  {
    id: 'sem-l300-s1',
    level: 300,
    semesterNumber: 1,
    academicYear: '2024/2025',
    title: 'Level 300 &bull; Semester 1 (Current)',
    courses: [
      { id: 'c-301', code: 'DCIT 301', title: 'Operating Systems', credits: 3, grade: 'A', mark: 84, status: 'completed' },
      { id: 'c-302', code: 'DCIT 303', title: 'Computer Networks', credits: 3, grade: null, mark: null, status: 'pending', notes: 'Examination written; awaiting departmental release' },
      { id: 'c-303', code: 'DCIT 305', title: 'Database Fundamentals', credits: 3, grade: 'A', mark: 88, status: 'completed' },
      { id: 'c-304', code: 'DCIT 313', title: 'Introduction to Artificial Intelligence', credits: 3, grade: 'B+', mark: 77, status: 'completed' },
      { id: 'c-305', code: 'MATH 355', title: 'Discrete Mathematics and Graph Theory', credits: 3, grade: null, mark: null, status: 'outstanding', notes: 'Special paper result pending' },
    ],
  },
];
