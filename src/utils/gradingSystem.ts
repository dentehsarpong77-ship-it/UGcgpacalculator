import type { GradeScaleItem } from '../types';

/**
 * Standard Undergraduate Grading Scale for the University of Ghana (Legon)
 * Verified against UG undergraduate academic regulations.
 */
export const DEFAULT_UG_GRADING_SCALE: GradeScaleItem[] = [
  { grade: 'A',  minMark: 80, maxMark: 100, gradePoint: 4.0, description: 'Excellent' },
  { grade: 'B+', minMark: 75, maxMark: 79,  gradePoint: 3.5, description: 'Very Good' },
  { grade: 'B',  minMark: 70, maxMark: 74,  gradePoint: 3.0, description: 'Good' },
  { grade: 'C+', minMark: 65, maxMark: 69,  gradePoint: 2.5, description: 'Fairly Good' },
  { grade: 'C',  minMark: 60, maxMark: 64,  gradePoint: 2.0, description: 'Average' },
  { grade: 'D+', minMark: 55, maxMark: 59,  gradePoint: 1.5, description: 'Below Average' },
  { grade: 'D',  minMark: 50, maxMark: 54,  gradePoint: 1.0, description: 'Marginal Pass' },
  { grade: 'E',  minMark: 45, maxMark: 49,  gradePoint: 0.5, description: 'Unsatisfactory / Non-Pass' },
  { grade: 'F',  minMark: 0,  maxMark: 44,  gradePoint: 0.0, description: 'Fail' },
];

/**
 * Default level weights for University of Ghana Degree Final Grade Point Average (FGPA):
 * Level 100: 1
 * Level 200: 1
 * Level 300: 2
 * Level 400: 2
 * Denominator = 1 + 1 + 2 + 2 = 6
 */
export const DEFAULT_UG_LEVEL_WEIGHTS: Record<number, number> = {
  100: 1,
  200: 1,
  300: 2,
  400: 2,
};

/**
 * Converts a numerical mark (0-100) to a letter grade based on the configured scale.
 */
export function getGradeFromMark(mark: number, scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE): string | null {
  if (mark < 0 || mark > 100 || isNaN(mark)) return null;
  const rounded = Math.round(mark * 10) / 10;
  for (const item of scale) {
    if (rounded >= item.minMark && rounded <= item.maxMark) {
      return item.grade;
    }
  }
  return null;
}

/**
 * Retrieves the grade point associated with a letter grade.
 */
export function getGradePoint(grade: string | null, scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE): number | null {
  if (!grade) return null;
  const found = scale.find(item => item.grade.toUpperCase() === grade.trim().toUpperCase());
  return found !== undefined ? found.gradePoint : null;
}

/**
 * University of Ghana Degree Classifications:
 * First Class: 3.60 – 4.00
 * Second Class (Upper Division): 3.00 – 3.59
 * Second Class (Lower Division): 2.00 – 2.99
 * Third Class: 1.50 – 1.99
 * Pass: 1.00 – 1.49
 * Fail: 0.00 – 0.99
 */
export function getDegreeClassification(cgpa: number): {
  title: string;
  badgeClass: string;
  description: string;
} {
  if (isNaN(cgpa) || cgpa <= 0) {
    return {
      title: 'Not Established',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      description: 'Add course grades to calculate academic standing.',
    };
  }

  if (cgpa >= 3.60) {
    return {
      title: 'First Class Honours',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      description: 'Outstanding academic distinction (3.60 – 4.00).',
    };
  } else if (cgpa >= 3.00) {
    return {
      title: 'Second Class (Upper Division)',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      description: 'Commendable performance (3.00 – 3.59).',
    };
  } else if (cgpa >= 2.00) {
    return {
      title: 'Second Class (Lower Division)',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
      description: 'Satisfactory academic standing (2.00 – 2.99).',
    };
  } else if (cgpa >= 1.50) {
    return {
      title: 'Third Class',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800',
      description: 'Pass with pass-grade standing (1.50 – 1.99).',
    };
  } else if (cgpa >= 1.00) {
    return {
      title: 'Pass',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      description: 'Eligible for pass degree (1.00 – 1.49).',
    };
  } else {
    return {
      title: 'Fail / Academic Probation Risk',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      description: 'CGPA below 1.00 triggers academic probation review under UG regulations.',
    };
  }
}
