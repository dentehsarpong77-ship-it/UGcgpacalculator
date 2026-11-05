import type {
  Course,
  Semester,
  GradeScaleItem,
  ResitPolicy,
  LevelWeights,
  SemesterCalculation,
  CgpaCalculation,
} from '../types';
import {
  DEFAULT_UG_GRADING_SCALE,
  DEFAULT_UG_LEVEL_WEIGHTS,
  getGradePoint,
  getDegreeClassification,
} from './gradingSystem';

/**
 * Calculates Grade Point Total (GPT) for a single course.
 * GPT = Course Credits × Grade Point
 */
export function calculateCourseGpt(credits: number, gradePoint: number | null): number | null {
  if (gradePoint === null || isNaN(gradePoint) || credits <= 0 || isNaN(credits)) {
    return null;
  }
  return Number((credits * gradePoint).toFixed(4));
}

/**
 * Checks whether a course has an eligible, final numerical result.
 * Courses marked as 'pending', 'outstanding', or 'exempted' are excluded
 * from GPA/CGPA calculations until a valid grade is recorded.
 */
export function isCourseEligibleForGpa(course: Course): boolean {
  if (course.status === 'pending' || course.status === 'outstanding' || course.status === 'exempted') {
    return false;
  }
  return course.grade !== null && course.grade.trim() !== '' && course.grade.toUpperCase() !== 'N/A';
}

/**
 * Calculates semester GPA and totals for a single semester.
 * Semester GPA = Sum of course GPTs ÷ Sum of eligible course credits.
 */
export function calculateSemesterGpa(
  semester: Semester,
  scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE
): SemesterCalculation {
  let registeredCredits = 0;
  let eligibleCredits = 0;
  let totalGpt = 0;
  let hasPendingOrOutstanding = false;
  let completedCount = 0;
  let outstandingCount = 0;
  let pendingCount = 0;

  for (const course of semester.courses) {
    const creds = Number(course.credits) || 0;
    registeredCredits += creds;

    if (course.status === 'pending') {
      hasPendingOrOutstanding = true;
      pendingCount++;
      continue;
    }

    if (course.status === 'outstanding' || course.status === 'resit_required') {
      hasPendingOrOutstanding = true;
      outstandingCount++;
      if (course.status === 'outstanding') continue;
    }

    if (course.status === 'exempted') {
      continue;
    }

    const gp = getGradePoint(course.grade, scale);
    if (gp !== null && isCourseEligibleForGpa(course)) {
      const gpt = creds * gp;
      eligibleCredits += creds;
      totalGpt += gpt;
      completedCount++;
    } else {
      // If no valid grade entered yet, treat as pending/unresolved rather than automatic 0
      hasPendingOrOutstanding = true;
    }
  }

  const gpa = eligibleCredits > 0 ? totalGpt / eligibleCredits : 0;

  return {
    semesterId: semester.id,
    level: semester.level,
    semesterNumber: semester.semesterNumber,
    registeredCredits,
    eligibleCredits,
    totalGpt: Number(totalGpt.toFixed(4)),
    gpa,
    isProvisional: hasPendingOrOutstanding,
    completedCount,
    outstandingCount,
    pendingCount,
  };
}

/**
 * Resolves course duplicates and resits according to the configured Resit Policy.
 * Returns a list of effective courses across the student's entire academic career.
 */
export function resolveEffectiveCourses(
  semesters: Semester[],
  scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE,
  resitPolicy: ResitPolicy = 'replace'
): {
  effectiveCourses: Array<{
    course: Course;
    semesterId: string;
    level: number;
    gradePoint: number;
    gpt: number;
  }>;
  supersededCoursesCount: number;
} {
  // Map of normalized course code -> all attempts in chronological order
  const courseAttemptsMap = new Map<
    string,
    Array<{
      course: Course;
      semesterId: string;
      level: number;
      semesterIndex: number;
      gradePoint: number;
      gpt: number;
    }>
  >();

  let semesterIndex = 0;
  for (const sem of semesters) {
    for (const course of sem.courses) {
      if (!isCourseEligibleForGpa(course)) continue;
      const gp = getGradePoint(course.grade, scale);
      if (gp === null) continue;

      const trimmedCode = course.code.trim().toUpperCase().replace(/\s+/g, ' ');
      // Use the course's own id as the key when the code is blank, so courses
      // without a code are never incorrectly collapsed into a single entry.
      const codeKey = trimmedCode || `__id__${course.id}`;
      const creds = Number(course.credits) || 0;
      const attempt = {
        course,
        semesterId: sem.id,
        level: sem.level,
        semesterIndex,
        gradePoint: gp,
        gpt: creds * gp,
      };

      if (!courseAttemptsMap.has(codeKey)) {
        courseAttemptsMap.set(codeKey, []);
      }
      courseAttemptsMap.get(codeKey)!.push(attempt);
    }
    semesterIndex++;
  }

  const effectiveCourses: Array<{
    course: Course;
    semesterId: string;
    level: number;
    gradePoint: number;
    gpt: number;
  }> = [];

  let supersededCoursesCount = 0;

  courseAttemptsMap.forEach((attempts) => {
    if (attempts.length === 1) {
      effectiveCourses.push({
        course: attempts[0].course,
        semesterId: attempts[0].semesterId,
        level: attempts[0].level,
        gradePoint: attempts[0].gradePoint,
        gpt: attempts[0].gpt,
      });
      return;
    }

    // Multiple attempts found
    if (resitPolicy === 'keep_both') {
      attempts.forEach((att) => {
        effectiveCourses.push({
          course: att.course,
          semesterId: att.semesterId,
          level: att.level,
          gradePoint: att.gradePoint,
          gpt: att.gpt,
        });
      });
    } else if (resitPolicy === 'replace') {
      // Keep the most recent chronological attempt
      const latestAttempt = attempts[attempts.length - 1];
      effectiveCourses.push({
        course: latestAttempt.course,
        semesterId: latestAttempt.semesterId,
        level: latestAttempt.level,
        gradePoint: latestAttempt.gradePoint,
        gpt: latestAttempt.gpt,
      });
      supersededCoursesCount += attempts.length - 1;
    } else if (resitPolicy === 'keep_highest') {
      // Pick the attempt with highest grade point
      const bestAttempt = [...attempts].sort((a, b) => b.gradePoint - a.gradePoint)[0];
      effectiveCourses.push({
        course: bestAttempt.course,
        semesterId: bestAttempt.semesterId,
        level: bestAttempt.level,
        gradePoint: bestAttempt.gradePoint,
        gpt: bestAttempt.gpt,
      });
      supersededCoursesCount += attempts.length - 1;
    } else if (resitPolicy === 'average') {
      // Average the grade points
      const totalPoints = attempts.reduce((sum, a) => sum + a.gradePoint, 0);
      const avgGp = totalPoints / attempts.length;
      const creds = Number(attempts[0].course.credits) || 0;
      effectiveCourses.push({
        course: attempts[attempts.length - 1].course,
        semesterId: attempts[attempts.length - 1].semesterId,
        level: attempts[attempts.length - 1].level,
        gradePoint: avgGp,
        gpt: creds * avgGp,
      });
      supersededCoursesCount += attempts.length - 1;
    }
  });

  return { effectiveCourses, supersededCoursesCount };
}

/**
 * Calculates Cumulative GPA (CGPA) across all included semesters.
 * CGPA = Sum of eligible GPTs ÷ Sum of eligible credits.
 * NEVER a simple average of semester GPAs.
 */
export function calculateCumulativeGpa(
  semesters: Semester[],
  scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE,
  resitPolicy: ResitPolicy = 'replace',
  levelWeights: LevelWeights = DEFAULT_UG_LEVEL_WEIGHTS
): CgpaCalculation {
  let totalRegisteredCredits = 0;
  let isProvisional = false;
  let outstandingCoursesCount = 0;
  let pendingCoursesCount = 0;

  // Level aggregation maps
  const levelTotals: Record<number, { credits: number; gpt: number; hasPending: boolean }> = {};

  for (const sem of semesters) {
    const semCalc = calculateSemesterGpa(sem, scale);
    totalRegisteredCredits += semCalc.registeredCredits;
    if (semCalc.isProvisional) {
      isProvisional = true;
    }
    outstandingCoursesCount += semCalc.outstandingCount;
    pendingCoursesCount += semCalc.pendingCount;

    if (!levelTotals[sem.level]) {
      levelTotals[sem.level] = { credits: 0, gpt: 0, hasPending: false };
    }
    if (semCalc.isProvisional) {
      levelTotals[sem.level].hasPending = true;
    }
  }

  // Resolve effective courses according to the resit policy
  const { effectiveCourses } = resolveEffectiveCourses(semesters, scale, resitPolicy);

  let totalEligibleCredits = 0;
  let totalGpt = 0;

  effectiveCourses.forEach((item) => {
    const creds = Number(item.course.credits) || 0;
    totalEligibleCredits += creds;
    totalGpt += item.gpt;

    if (levelTotals[item.level]) {
      levelTotals[item.level].credits += creds;
      levelTotals[item.level].gpt += item.gpt;
    }
  });

  const cgpa = totalEligibleCredits > 0 ? totalGpt / totalEligibleCredits : 0;

  // Compute per-level GPAs
  const levelGpas: Record<number, { gpa: number; credits: number; gpt: number; isProvisional: boolean }> = {};
  for (const levelStr of Object.keys(levelTotals)) {
    const lvl = Number(levelStr);
    const data = levelTotals[lvl];
    const lvlGpa = data.credits > 0 ? data.gpt / data.credits : 0;
    levelGpas[lvl] = {
      gpa: lvlGpa,
      credits: data.credits,
      gpt: Number(data.gpt.toFixed(4)),
      isProvisional: data.hasPending,
    };
  }

  // Calculate Projected FGPA using configured level weights (Default UG: 1:1:2:2 / 6)
  const fgpaResult = calculateFgpa(
    Object.fromEntries(Object.entries(levelGpas).map(([k, v]) => [k, v.gpa])),
    levelWeights
  );

  return {
    totalRegisteredCredits,
    totalEligibleCredits,
    totalGpt: Number(totalGpt.toFixed(4)),
    cgpa,
    isProvisional,
    completedCoursesCount: effectiveCourses.length,
    outstandingCoursesCount,
    pendingCoursesCount,
    levelGpas,
    projectedFgpa: fgpaResult.fgpa,
    fgpaFormulaString: fgpaResult.formulaString,
    degreeClassification: getDegreeClassification(cgpa),
  };
}

/**
 * Calculates Final Grade Point Average (FGPA) according to official UG Level Weighting.
 * Official default weights: L100: 1, L200: 1, L300: 2, L400: 2 -> Total Weight = 6.
 * FGPA = (L100 GPA * W100 + L200 GPA * W200 + L300 GPA * W300 + L400 GPA * W400) / Sum(Weights)
 */
export function calculateFgpa(
  levelGpas: Record<number, number>,
  weights: LevelWeights = DEFAULT_UG_LEVEL_WEIGHTS
): {
  fgpa: number | null;
  formulaString: string;
  totalWeight: number;
  completedLevels: number[];
} {
  const levels = Object.keys(weights).map(Number).sort((a, b) => a - b);
  let weightedSum = 0;
  let activeWeightSum = 0;
  const terms: string[] = [];
  const completedLevels: number[] = [];

  for (const lvl of levels) {
    const weight = weights[lvl] || 0;
    const gpa = levelGpas[lvl];

    if (gpa !== undefined && !isNaN(gpa) && gpa > 0) {
      weightedSum += gpa * weight;
      activeWeightSum += weight;
      completedLevels.push(lvl);
      terms.push(`(L${lvl}: ${gpa.toFixed(2)} × ${weight})`);
    } else {
      terms.push(`(L${lvl} pending × ${weight})`);
    }
  }

  const totalPossibleWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const fgpa = activeWeightSum > 0 ? weightedSum / activeWeightSum : null;

  const formulaString = `FGPA = [${terms.join(' + ')}] ÷ ${activeWeightSum || totalPossibleWeight}`;

  return {
    fgpa,
    formulaString,
    totalWeight: totalPossibleWeight,
    completedLevels,
  };
}

/**
 * Calculates required GPA in upcoming credits to achieve a target CGPA.
 */
export function calculateRequiredTargetGpa(
  currentCgpa: number,
  currentCredits: number,
  targetCgpa: number,
  remainingCredits: number,
  maxScale: number = 4.0
): {
  requiredGpa: number;
  isAchievable: boolean;
  message: string;
  neededGpt: number;
} {
  if (remainingCredits <= 0) {
    return {
      requiredGpa: 0,
      isAchievable: currentCgpa >= targetCgpa,
      message: currentCgpa >= targetCgpa ? 'Target already achieved!' : 'No remaining credits to improve GPA.',
      neededGpt: 0,
    };
  }

  const currentGpt = currentCgpa * currentCredits;
  const projectedTotalCredits = currentCredits + remainingCredits;
  const totalGptNeeded = targetCgpa * projectedTotalCredits;
  const neededGpt = totalGptNeeded - currentGpt;
  const requiredGpa = neededGpt / remainingCredits;

  if (requiredGpa > maxScale) {
    return {
      requiredGpa,
      isAchievable: false,
      message: `Mathematically unreachable (requires ${requiredGpa.toFixed(2)}, which exceeds the maximum ${maxScale.toFixed(1)} scale).`,
      neededGpt,
    };
  }

  if (requiredGpa <= 0) {
    return {
      requiredGpa: 0,
      isAchievable: true,
      message: 'Goal already mathematically secured even with minimum passing marks.',
      neededGpt: Math.max(0, neededGpt),
    };
  }

  return {
    requiredGpa,
    isAchievable: true,
    message: `Achievable! You need an average GPA of ${requiredGpa.toFixed(2)} across your remaining ${remainingCredits} credits.`,
    neededGpt,
  };
}

/**
 * Calculates the average GPA required in remaining university levels to achieve a target FGPA.
 */
export function calculateRequiredRemainingLevelAverage(
  completedLevels: Array<{ level: number; gpa: number }>,
  weights: LevelWeights = DEFAULT_UG_LEVEL_WEIGHTS,
  targetFgpa: number = 3.60,
  remainingLevels: number[] = [300, 400]
): {
  requiredAverage: number;
  isAchievable: boolean;
  message: string;
} {
  let completedWeightedSum = 0;
  for (const comp of completedLevels) {
    const w = weights[comp.level] || 0;
    completedWeightedSum += comp.gpa * w;
  }

  const totalAllWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const targetWeightedTotal = targetFgpa * totalAllWeights;
  const remainingWeightedTotalNeeded = targetWeightedTotal - completedWeightedSum;

  const remainingWeightsSum = remainingLevels.reduce((sum, lvl) => sum + (weights[lvl] || 0), 0);

  if (remainingWeightsSum <= 0) {
    const currentOverall = completedWeightedSum / totalAllWeights;
    const isOk = currentOverall >= targetFgpa;
    return {
      requiredAverage: currentOverall,
      isAchievable: isOk,
      message: isOk ? 'Target reached!' : 'No remaining levels left.',
    };
  }

  const requiredAverage = Number((remainingWeightedTotalNeeded / remainingWeightsSum).toFixed(4));

  if (requiredAverage > 4.0) {
    return {
      requiredAverage,
      isAchievable: false,
      message: `Target of ${targetFgpa.toFixed(2)} is mathematically impossible (requires ${requiredAverage.toFixed(2)} average in remaining levels).`,
    };
  }

  if (requiredAverage <= 0) {
    return {
      requiredAverage: 0,
      isAchievable: true,
      message: `Target of ${targetFgpa.toFixed(2)} is already guaranteed!`,
    };
  }

  return {
    requiredAverage,
    isAchievable: true,
    message: `You need a combined weighted average of ${requiredAverage.toFixed(2)} in remaining levels (${remainingLevels.map(l => `L${l}`).join(', ')}).`,
  };
}

/**
 * Simulates how a mix of letter grades in future credits translates to expected GPA.
 */
export function simulateGradeMix(
  creditsPerGrade: Record<string, number>,
  scale: GradeScaleItem[] = DEFAULT_UG_GRADING_SCALE
): {
  totalCredits: number;
  totalGpt: number;
  projectedGpa: number;
} {
  let totalCredits = 0;
  let totalGpt = 0;

  for (const [grade, credits] of Object.entries(creditsPerGrade)) {
    const credNum = Number(credits) || 0;
    if (credNum <= 0) continue;
    const gp = getGradePoint(grade, scale) ?? 0;
    totalCredits += credNum;
    totalGpt += credNum * gp;
  }

  const projectedGpa = totalCredits > 0 ? totalGpt / totalCredits : 0;
  return {
    totalCredits,
    totalGpt: Number(totalGpt.toFixed(4)),
    projectedGpa,
  };
}
