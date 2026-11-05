import React, { useState } from 'react';
import {
  Printer,
  FileText,
} from 'lucide-react';
import type {
  Semester,
  SemesterCalculation,
  CgpaCalculation,
  StudentProfile,
  GradeScaleItem,
} from '../types';
import { getGradePoint } from '../utils/gradingSystem';

interface ResultsStatementViewProps {
  semesters: Semester[];
  semesterCalculations: SemesterCalculation[];
  cgpaCalculation: CgpaCalculation;
  profile: StudentProfile;
  gradingScale: GradeScaleItem[];
  onPrint: () => void;
}

export const ResultsStatementView: React.FC<ResultsStatementViewProps> = ({
  semesters,
  semesterCalculations,
  cgpaCalculation,
  profile,
  gradingScale,
  onPrint,
}) => {
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  return (
    <div className="space-y-6">
      {/* Top Action Header (hidden during print) */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-ugNavy-700 dark:text-ugNavy-300" />
            Unofficial Results Statement & Academic Record
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed in the layout of the University of Ghana statement of results for easy review and verification.
          </p>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center justify-center gap-2 bg-ugNavy-800 hover:bg-ugNavy-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Official-Style Results Statement Container */}
      <div className="print-container bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg font-sans max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* Statement Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Republic of Ghana
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
            University of Ghana, Legon
          </h2>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-1">
            Unofficial Statement of Academic Results &bull; Student Planner
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1">
            (Self-Generated Student Record &bull; Not an Official University Transcript)
          </p>
        </div>

        {/* Student Bio Details Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs border border-slate-300 bg-slate-50 p-4 rounded-lg mb-6 print:bg-transparent">
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">Student Name:</span>
            <span className="font-semibold text-slate-950 uppercase">
              {profile.studentName || 'NOT SPECIFIED'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">Student ID:</span>
            <span className="font-mono font-bold text-slate-950">
              {profile.studentId || 'NOT SPECIFIED'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">Programme:</span>
            <span className="font-semibold text-slate-950">
              {profile.programme || 'Undergraduate Degree'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">College:</span>
            <span className="font-semibold text-slate-950">
              {profile.college || 'University of Ghana'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">Academic Year:</span>
            <span className="font-semibold text-slate-950">
              {profile.academicYear || '2024/2025'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600">Date Generated:</span>
            <span className="font-medium text-slate-700">{currentDate}</span>
          </div>
        </div>

        {/* Semesters & Courses Breakdown */}
        <div className="space-y-6">
          {semesters.map((sem) => {
            const semCalc = semesterCalculations.find((c) => c.semesterId === sem.id);

            return (
              <div key={sem.id} className="border border-slate-300 rounded-lg overflow-hidden break-inside-avoid">
                {/* Semester Heading */}
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex justify-between items-center text-xs font-bold text-slate-900 print:bg-slate-200">
                  <span>
                    LEVEL {sem.level} &bull; SEMESTER {sem.semesterNumber} &bull; {sem.academicYear}
                  </span>
                  {semCalc?.isProvisional && (
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Provisional
                    </span>
                  )}
                </div>

                {/* Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-300 text-[11px]">
                      <th className="py-2 px-3 w-28">Course Code</th>
                      <th className="py-2 px-3">Course Title</th>
                      <th className="py-2 px-3 w-16 text-center">Credits</th>
                      <th className="py-2 px-3 w-16 text-center">Grade</th>
                      <th className="py-2 px-3 w-16 text-center">GP</th>
                      <th className="py-2 px-3 w-20 text-center">GPT</th>
                      <th className="py-2 px-3 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sem.courses.map((course) => {
                      const gp = getGradePoint(course.grade, gradingScale);
                      const isExcluded =
                        course.status === 'pending' ||
                        course.status === 'outstanding' ||
                        course.status === 'exempted';
                      const gpt = gp !== null && !isExcluded ? course.credits * gp : null;

                      return (
                        <tr key={course.id} className={isExcluded ? 'bg-amber-50/40' : ''}>
                          <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                            {course.code || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-800">{course.title || '-'}</td>
                          <td className="py-1.5 px-3 text-center font-mono font-semibold">
                            {course.credits}
                          </td>
                          <td className="py-1.5 px-3 text-center font-mono font-bold">
                            {isExcluded ? 'N/A' : course.grade || 'N/A'}
                          </td>
                          <td className="py-1.5 px-3 text-center font-mono">
                            {isExcluded ? 'N/A' : gp !== null ? gp.toFixed(1) : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-center font-mono font-bold">
                            {isExcluded ? 'N/A' : gpt !== null ? gpt.toFixed(1) : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-[11px] font-medium text-slate-600 capitalize">
                            {course.status.replace('_', ' ')}
                            {course.notes ? ` (${course.notes})` : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Semester Summary Box */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-300 flex flex-wrap justify-between items-center text-xs font-mono text-slate-800 print:bg-slate-100">
                  <div>
                    Credits Reg: <strong>{semCalc?.registeredCredits || 0}</strong> &bull; Credits
                    Earned: <strong>{semCalc?.eligibleCredits || 0}</strong> &bull; Total GPT:{' '}
                    <strong>{semCalc?.totalGpt.toFixed(1) || '0.0'}</strong>
                  </div>
                  <div>
                    Semester GPA (SGPA):{' '}
                    <strong className="text-slate-950 font-bold text-sm">
                      {semCalc ? semCalc.gpa.toFixed(2) : '0.00'}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cumulative Summary Box */}
        <div className="mt-8 border-2 border-slate-900 rounded-xl p-5 bg-slate-50 print:bg-transparent break-inside-avoid">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Cumulative Academic Record Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2 border-r border-slate-300">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">
                Total Credits Earned
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-950">
                {cgpaCalculation.totalEligibleCredits}
              </span>
              <span className="text-[10px] text-slate-500 block">
                of {cgpaCalculation.totalRegisteredCredits} registered
              </span>
            </div>

            <div className="p-2 border-r border-slate-300">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">
                Total Cumulative GPT
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-950">
                {cgpaCalculation.totalGpt.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Quality Points
              </span>
            </div>

            <div className="p-2 border-r border-slate-300">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">
                Cumulative GPA (CGPA)
              </span>
              <span className="text-2xl font-black font-mono text-slate-950">
                {cgpaCalculation.cgpa > 0 ? cgpaCalculation.cgpa.toFixed(2) : '0.00'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Scale 4.00
              </span>
            </div>

            <div className="p-2">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">
                Projected FGPA (1:1:2:2)
              </span>
              <span className="text-2xl font-black font-mono text-slate-950">
                {cgpaCalculation.projectedFgpa !== null
                  ? cgpaCalculation.projectedFgpa.toFixed(2)
                  : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Degree Classification
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-700">Calculated Academic Standing: </span>
              <span className="font-extrabold text-slate-900 uppercase">
                {cgpaCalculation.degreeClassification.title}
              </span>
            </div>
            {cgpaCalculation.isProvisional && (
              <span className="text-amber-700 font-bold text-[11px]">
                * Provisional calculation pending outstanding course results
              </span>
            )}
          </div>
        </div>

        {/* Regulatory Disclaimer Notice */}
        <div className="mt-6 text-[10px] text-slate-500 text-center leading-relaxed border-t border-slate-200 pt-4">
          <p className="font-bold text-slate-700 uppercase mb-0.5">
            Disclaimer & Regulation Notice
          </p>
          <p>
            This document is a self-generated academic calculation from the UG GPA Planner web tool and does not constitute an official University of Ghana transcript or statement of results. Official degree awards, graduations, resit endorsements, and GPA determinations must be verified directly with the Academic Affairs Directorate of the University of Ghana, Legon.
          </p>
        </div>
      </div>
    </div>
  );
};
