import { describe, it, expect } from 'vitest';
import {
  calculateCourseGpt,
  calculateSemesterGpa,
  calculateCumulativeGpa,
  calculateFgpa,
  calculateRequiredTargetGpa,
  calculateRequiredRemainingLevelAverage,
} from '../calculationEngine';
import {
  DEFAULT_UG_GRADING_SCALE,
  DEFAULT_UG_LEVEL_WEIGHTS,
  getGradeFromMark,
  getGradePoint,
} from '../gradingSystem';
import type { Course, Semester } from '../../types';

describe('UG Academic Calculation Engine', () => {
  // Test 1: 3-credit A produces 12 GPT
  it('calculates 3-credit course with grade A as 12.0 GPT', () => {
    const gpA = getGradePoint('A', DEFAULT_UG_GRADING_SCALE);
    expect(gpA).toBe(4.0);
    const gpt = calculateCourseGpt(3, gpA);
    expect(gpt).toBe(12.0);
  });

  // Test 2: 3-credit B+ produces 10.5 GPT
  it('calculates 3-credit course with grade B+ as 10.5 GPT', () => {
    const gpBPlus = getGradePoint('B+', DEFAULT_UG_GRADING_SCALE);
    expect(gpBPlus).toBe(3.5);
    const gpt = calculateCourseGpt(3, gpBPlus);
    expect(gpt).toBe(10.5);
  });

  // Test 3: 8-credit total with 28.5 GPT produces GPA 3.5625 (displays 3.56)
  it('computes 8-credit total with 28.5 GPT as GPA 3.5625', () => {
    const courses: Course[] = [
      { id: '1', code: 'DCIT 101', title: 'Course A', credits: 3, grade: 'A', mark: 85, status: 'completed' },
      { id: '2', code: 'DCIT 103', title: 'Course B', credits: 3, grade: 'B+', mark: 76, status: 'completed' },
      { id: '3', code: 'MATH 121', title: 'Course C', credits: 2, grade: 'B', mark: 72, status: 'completed' },
    ];

    const semester: Semester = {
      id: 'sem-1',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'Level 100 Semester 1',
      courses,
    };

    const calc = calculateSemesterGpa(semester, DEFAULT_UG_GRADING_SCALE);
    expect(calc.eligibleCredits).toBe(8);
    expect(calc.totalGpt).toBe(28.5);
    expect(calc.gpa).toBeCloseTo(3.5625, 4);
    expect(calc.gpa.toFixed(2)).toBe('3.56');
  });

  // Test 4: Different course credits are weighted correctly
  it('weights courses with different credits correctly', () => {
    // 1-credit A (4.0 GPT) + 4-credit C (8.0 GPT) = 5 credits, 12.0 GPT -> GPA = 2.40
    const courses: Course[] = [
      { id: '1', code: 'UGRC 150', title: 'Critical Thinking', credits: 1, grade: 'A', mark: 80, status: 'completed' },
      { id: '2', code: 'MATH 123', title: 'Calculus I', credits: 4, grade: 'C', mark: 60, status: 'completed' },
    ];
    const sem: Semester = {
      id: 'sem-weight',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'Level 100 Sem 1',
      courses,
    };
    const res = calculateSemesterGpa(sem, DEFAULT_UG_GRADING_SCALE);
    expect(res.eligibleCredits).toBe(5);
    expect(res.totalGpt).toBe(12.0);
    expect(res.gpa).toBe(2.4);
  });

  // Test 5: CGPA is calculated from total GPT divided by total eligible credits (NEVER simple average of semester GPAs)
  it('calculates CGPA by total GPT divided by total eligible credits, not average of GPAs', () => {
    // Sem 1: 3 credits, GPA 4.0 (12 GPT)
    // Sem 2: 12 credits, GPA 2.0 (24 GPT)
    // Total credits = 15, Total GPT = 36 -> CGPA = 36 / 15 = 2.40
    // (Note: simple average of GPAs would incorrectly give (4.0 + 2.0)/2 = 3.00)
    const sem1: Semester = {
      id: 's1',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'L100 S1',
      courses: [
        { id: 'c1', code: 'DCIT 101', title: 'Intro', credits: 3, grade: 'A', mark: 82, status: 'completed' },
      ],
    };
    const sem2: Semester = {
      id: 's2',
      level: 100,
      semesterNumber: 2,
      academicYear: '2023/2024',
      title: 'L100 S2',
      courses: [
        { id: 'c2', code: 'DCIT 102', title: 'Programming I', credits: 4, grade: 'C', mark: 62, status: 'completed' },
        { id: 'c3', code: 'DCIT 104', title: 'Hardware', credits: 4, grade: 'C', mark: 63, status: 'completed' },
        { id: 'c4', code: 'MATH 122', title: 'Calculus II', credits: 4, grade: 'C', mark: 60, status: 'completed' },
      ],
    };

    const cgpaCalc = calculateCumulativeGpa([sem1, sem2], DEFAULT_UG_GRADING_SCALE, 'keep_both');
    expect(cgpaCalc.totalEligibleCredits).toBe(15);
    expect(cgpaCalc.totalGpt).toBe(36);
    expect(cgpaCalc.cgpa).toBe(2.4);
    expect(cgpaCalc.cgpa).not.toBe(3.0);
  });

  // Test 6: N/A results are not automatically treated as F
  it('does not treat N/A, pending, or outstanding results as F (0.0 points)', () => {
    const courses: Course[] = [
      { id: 'c1', code: 'DCIT 101', title: 'Intro', credits: 3, grade: 'A', mark: 85, status: 'completed' },
      { id: 'c2', code: 'DCIT 103', title: 'Office Apps', credits: 3, grade: null, mark: null, status: 'pending' },
      { id: 'c3', code: 'MATH 121', title: 'Algebra', credits: 3, grade: null, mark: null, status: 'outstanding' },
    ];
    const sem: Semester = {
      id: 'sem-na',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'L100 S1',
      courses,
    };
    const res = calculateSemesterGpa(sem, DEFAULT_UG_GRADING_SCALE);
    // Only the completed 3 credits should count towards GPA
    expect(res.registeredCredits).toBe(9);
    expect(res.eligibleCredits).toBe(3);
    expect(res.totalGpt).toBe(12.0);
    expect(res.gpa).toBe(4.0); // NOT (12 + 0 + 0)/9 = 1.33
    expect(res.isProvisional).toBe(true);
    expect(res.pendingCount).toBe(1);
    expect(res.outstandingCount).toBe(1);
  });

  // Test 7: Adding an outstanding grade recalculates the relevant results
  it('recalculates GPA correctly when an outstanding grade is resolved', () => {
    const semBefore: Semester = {
      id: 'sem-recalc',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'L100 S1',
      courses: [
        { id: 'c1', code: 'DCIT 101', title: 'Intro', credits: 3, grade: 'A', mark: 85, status: 'completed' },
        { id: 'c2', code: 'DCIT 103', title: 'Pending Course', credits: 3, grade: null, mark: null, status: 'pending' },
      ],
    };
    const calcBefore = calculateSemesterGpa(semBefore);
    expect(calcBefore.isProvisional).toBe(true);
    expect(calcBefore.gpa).toBe(4.0);

    // Resolve the grade to B (3.0)
    const semAfter: Semester = {
      ...semBefore,
      courses: [
        { id: 'c1', code: 'DCIT 101', title: 'Intro', credits: 3, grade: 'A', mark: 85, status: 'completed' },
        { id: 'c2', code: 'DCIT 103', title: 'Pending Course', credits: 3, grade: 'B', mark: 70, status: 'completed' },
      ],
    };
    const calcAfter = calculateSemesterGpa(semAfter);
    expect(calcAfter.isProvisional).toBe(false);
    expect(calcAfter.eligibleCredits).toBe(6);
    expect(calcAfter.totalGpt).toBe(21.0); // 12 + 9 = 21
    expect(calcAfter.gpa).toBe(3.5); // 21 / 6 = 3.5
  });

  // Test 8 & 9: Duplicate courses and Resit policies
  it('applies resit policy "replace" using the latest attempt and prevents double counting', () => {
    // Attempt 1: DCIT 101 in Level 100 Sem 1 -> Grade F (0.0 GPT, 3 creds)
    // Attempt 2: DCIT 101 in Level 100 Sem 2 -> Grade B+ (10.5 GPT, 3 creds)
    const sem1: Semester = {
      id: 'sem1',
      level: 100,
      semesterNumber: 1,
      academicYear: '2023/2024',
      title: 'L100 S1',
      courses: [
        { id: 'c1', code: 'DCIT 101', title: 'Programming', credits: 3, grade: 'F', mark: 35, status: 'completed' },
      ],
    };
    const sem2: Semester = {
      id: 'sem2',
      level: 100,
      semesterNumber: 2,
      academicYear: '2023/2024',
      title: 'L100 S2',
      courses: [
        { id: 'c2', code: 'DCIT 101', title: 'Programming Resit', credits: 3, grade: 'B+', mark: 76, status: 'completed', isResit: true },
      ],
    };

    // Under "replace" policy:
    const cgpaReplace = calculateCumulativeGpa([sem1, sem2], DEFAULT_UG_GRADING_SCALE, 'replace');
    expect(cgpaReplace.totalEligibleCredits).toBe(3); // Counted once
    expect(cgpaReplace.totalGpt).toBe(10.5);
    expect(cgpaReplace.cgpa).toBe(3.5);

    // Under "keep_both" policy:
    const cgpaBoth = calculateCumulativeGpa([sem1, sem2], DEFAULT_UG_GRADING_SCALE, 'keep_both');
    expect(cgpaBoth.totalEligibleCredits).toBe(6); // Both attempts counted
    expect(cgpaBoth.totalGpt).toBe(10.5);
    expect(cgpaBoth.cgpa).toBe(1.75); // 10.5 / 6 = 1.75
  });

  // Test 10: FGPA projections use configured level weights correctly (UG 1:1:2:2 / 6)
  it('calculates FGPA using configured 1:1:2:2 level weights', () => {
    const levelGpas: Record<number, number> = {
      100: 3.5, // weight 1 -> 3.5
      200: 3.2, // weight 1 -> 3.2
      300: 3.8, // weight 2 -> 7.6
      400: 3.6, // weight 2 -> 7.2
    };
    // Sum = 3.5 + 3.2 + 7.6 + 7.2 = 21.5
    // FGPA = 21.5 / 6 = 3.5833
    const fgpaRes = calculateFgpa(levelGpas, DEFAULT_UG_LEVEL_WEIGHTS);
    expect(fgpaRes.fgpa).toBeCloseTo(3.5833, 3);
    expect(fgpaRes.totalWeight).toBe(6);
  });

  // Test 11: Validation of invalid marks and credit hours
  it('validates and rejects invalid marks and credit hours', () => {
    expect(getGradeFromMark(-5)).toBeNull();
    expect(getGradeFromMark(105)).toBeNull();
    expect(getGradeFromMark(NaN)).toBeNull();
    expect(calculateCourseGpt(0, 4.0)).toBeNull();
    expect(calculateCourseGpt(-3, 4.0)).toBeNull();
  });

  // Test 12: Target FGPA calculation
  it('calculates required remaining level average to achieve First Class (3.60)', () => {
    // L100 (w=1): 3.2, L200 (w=1): 3.4
    // Completed weighted points = 3.2*1 + 3.4*1 = 6.6
    // Total required points for FGPA 3.60 = 3.60 * 6 = 21.6
    // Remaining needed = 21.6 - 6.6 = 15.0
    // Remaining weights (L300: 2, L400: 2) = 4
    // Required average in L300 & L400 = 15.0 / 4 = 3.75
    const targetCalc = calculateRequiredRemainingLevelAverage(
      [{ level: 100, gpa: 3.2 }, { level: 200, gpa: 3.4 }],
      DEFAULT_UG_LEVEL_WEIGHTS,
      3.60,
      [300, 400]
    );
    expect(targetCalc.isAchievable).toBe(true);
    expect(targetCalc.requiredAverage).toBe(3.75);
  });

  // Test 13: LocalStorage serialization and deserialization preserves data integrity
  it('persists and restores semester academic data correctly across JSON serialization', () => {
    const originalSemesters: Semester[] = [
      {
        id: 'sem-persist',
        level: 100,
        semesterNumber: 1,
        academicYear: '2023/2024',
        title: 'Level 100 &bull; Semester 1',
        courses: [
          { id: 'c-1', code: 'DCIT 101', title: 'Intro to CS', credits: 3, grade: 'A', mark: 85, status: 'completed' },
          { id: 'c-2', code: 'DCIT 103', title: 'Office Productivity', credits: 3, grade: null, mark: null, status: 'pending' },
        ],
      },
    ];

    // Simulate saving to and reading from localStorage
    const serialized = JSON.stringify(originalSemesters);
    const restored: Semester[] = JSON.parse(serialized);

    expect(restored).toHaveLength(1);
    expect(restored[0].courses).toHaveLength(2);
    expect(restored[0].courses[0].code).toBe('DCIT 101');
    expect(restored[0].courses[0].grade).toBe('A');
    expect(restored[0].courses[1].status).toBe('pending');
    expect(restored[0].courses[1].grade).toBeNull();
  });

  // Test 14: Required Target CGPA calculation detects achievable and unachievable targets
  it('correctly detects achievable and mathematically unreachable target CGPAs', () => {
    // Current CGPA 3.0 with 60 credits. Target 3.60 with 60 credits remaining.
    // Current GPT = 180. Projected credits = 120. Total GPT needed = 3.60 * 120 = 432.
    // Needed GPT = 432 - 180 = 252. Required GPA = 252 / 60 = 4.20 (Impossible on 4.0 scale).
    const unachievable = calculateRequiredTargetGpa(3.0, 60, 3.60, 60, 4.0);
    expect(unachievable.isAchievable).toBe(false);
    expect(unachievable.requiredGpa).toBe(4.2);

    // Current CGPA 3.5 with 60 credits. Target 3.60 with 60 credits remaining.
    // Current GPT = 210. Total GPT needed = 432. Needed GPT = 222.
    // Required GPA = 222 / 60 = 3.70 (Achievable).
    const achievable = calculateRequiredTargetGpa(3.5, 60, 3.60, 60, 4.0);
    expect(achievable.isAchievable).toBe(true);
    expect(achievable.requiredGpa).toBe(3.7);
  });

  // Test 15: Courses with blank/empty codes must each be counted individually (not collapsed)
  it('counts courses with empty codes as separate entries, not collapsed into one', () => {
    // Three manually-added courses all without a course code — common when a user
    // clicks "Add Course Row" without typing a code yet but has assigned grades.
    // Under the old bug all three shared the '' key and only the last was counted.
    const sem: Semester = {
      id: 'sem-blank-codes',
      level: 100,
      semesterNumber: 1,
      academicYear: '2024/2025',
      title: 'L100 S1',
      courses: [
        { id: 'id-1', code: '', title: 'Course One',   credits: 3, grade: 'A',  mark: 85, status: 'completed' },
        { id: 'id-2', code: '', title: 'Course Two',   credits: 3, grade: 'B',  mark: 72, status: 'completed' },
        { id: 'id-3', code: '', title: 'Course Three', credits: 3, grade: 'B+', mark: 77, status: 'completed' },
      ],
    };

    const cgpa = calculateCumulativeGpa([sem], DEFAULT_UG_GRADING_SCALE, 'replace');
    // All 3 courses must be counted: 9 credits total, GPT = 4.0*3 + 3.0*3 + 3.5*3 = 31.5
    expect(cgpa.totalEligibleCredits).toBe(9);
    expect(cgpa.totalGpt).toBeCloseTo(31.5, 4);
    expect(cgpa.cgpa).toBeCloseTo(31.5 / 9, 4); // ≈ 3.5
    expect(cgpa.completedCoursesCount).toBe(3);
  });
});
