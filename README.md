# UG GPA Planner &bull; University of Ghana GPA & CGPA Calculator

A professional, mobile-first academic grade, GPA, and CGPA tracking and planning web application built specifically for **University of Ghana (UG), Legon** undergraduate students.

> **Disclaimer:** This is an unofficial student-developed planning and projection tool. It is not an official University of Ghana application. Official degree awards, graduations, resit endorsements, and GPA determinations must be verified directly with the Academic Affairs Directorate of the University of Ghana, Legon.

---

## Features

### 1. Accurate UG Undergraduate Grading Scale
- Implements the official University of Ghana grading scale:
  - **A (80 – 100%):** 4.0 GP &bull; Excellent
  - **B+ (75 – 79%):** 3.5 GP &bull; Very Good
  - **B (70 – 74%):** 3.0 GP &bull; Good
  - **C+ (65 – 69%):** 2.5 GP &bull; Fairly Good
  - **C (60 – 64%):** 2.0 GP &bull; Average
  - **D+ (55 – 59%):** 1.5 GP &bull; Below Average
  - **D (50 – 54%):** 1.0 GP &bull; Marginal Pass
  - **E (45 – 49%):** 0.5 GP &bull; Unsatisfactory / Non-Pass
  - **F (0 – 44%):** 0.0 GP &bull; Fail
- Accepts direct letter grade selection or numerical percentage mark (0–100%) with automatic conversion.
- Fully configurable grading scale in the Settings tab.

### 2. Centralized, Rigorous Calculation Engine
- **Grade Point Total (GPT):** `Course Credits × Grade Point`.
- **Semester GPA (SGPA):** `Sum of Course GPTs ÷ Sum of Eligible Credits`.
- **Cumulative GPA (CGPA):** `Sum of Eligible GPTs across all semesters ÷ Sum of Eligible Credits across all semesters`.
- *Never averages semester GPAs directly*, ensuring correct mathematical weighting when credit loads differ.
- Displays values to 2 decimal places (e.g. `3.56`) while retaining full floating-point precision internally.

### 3. Outstanding Results & Resit Support
- Supports course statuses:
  - `Completed`
  - `Result Pending` (displays N/A; excluded from GPA, never treated as F or zero)
  - `Outstanding` (displays N/A; excluded from GPA, never treated as F or zero)
  - `Resit Required`
  - `Repeated`
  - `Exempted` (credits excluded from GPA calculation)
- Automatically marks semesters and cumulative records as **Provisional** whenever unresolved results exist.
- Configurable **Resit Policies**:
  - `Replace Original Attempt` (UG standard practice: latest passing grade replaces earlier failed attempt)
  - `Keep Highest Grade`
  - `Count Both Attempts`
  - `Average Both Attempts`
- In-semester duplicate course code warnings to prevent double counting.

### 4. Final Grade Point Average (FGPA) Projection Planner
- Implements official University of Ghana Level Weighting:
  - **Level 100:** Weight 1
  - **Level 200:** Weight 1
  - **Level 300:** Weight 2
  - **Level 400:** Weight 2
  - **Formula:** `FGPA = (L100 GPA × 1 + L200 GPA × 1 + L300 GPA × 2 + L400 GPA × 2) ÷ 6`
- Live editable weights and transparent formula view.
- Calculates required average in remaining levels to graduate with First Class Honours (3.60+).

### 5. First Class & Honours Goal Simulator
- Interactive what-if planning tool for target CGPAs (3.60, 3.70, 3.80).
- Simulates future semester course grade mixes (number of A's, B+'s, B's) and displays the immediate impact on cumulative CGPA.
- Mathematical feasibility check: detects if a goal is mathematically impossible (> 4.0 required) or already secured.

### 6. Official-Style Results Statement (Printable & PDF)
- Statement of results layout inspired by the traditional University of Ghana results statement.
- Formats course codes, course titles, credits, letter grades, grade points, and semester GPTs.
- Print-friendly layout that strips away web navigation buttons for clean browser printing or saving as PDF (`Cmd+P` / `Ctrl+P`).
- Clearly marked with unofficial student disclaimer.

### 7. Student Dashboard & Visual Analytics
- Real-time KPI hero stats: Overall CGPA, Projected FGPA, Credits Earned, Unresolved Results count.
- Semester-by-semester GPA and CGPA progression trend chart.
- Grade distribution bar chart across all completed courses.
- Academic performance breakdown card by university level (L100 – L400).

### 8. Data Persistence & Privacy
- **100% Private:** Stored directly on the student's device via `localStorage`.
- **JSON Backup & Restore:** Complete export and import of academic history.
- **CSV Export:** Download full academic records as spreadsheet-compatible CSV.
- **Sample Data Preset:** One-click loading of a realistic UG BSc. Computer Science student profile.

---

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3 with custom UG Navy & Gold theme palette
- **Icons:** Lucide React
- **Testing:** Vitest

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### Installation
```bash
# Clone or navigate to the project directory
cd "cgpa calculator"

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Running Automated Tests
```bash
npm test
```
Runs the 13 automated Vitest unit tests verifying calculation engine accuracy, resit handling, weighting, and data persistence.

### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` folder ready for deployment to Vercel, Netlify, or GitHub Pages.

---

## University of Ghana Degree Classifications

| Classification | CGPA Range |
| :--- | :--- |
| **First Class Honours** | 3.60 – 4.00 |
| **Second Class (Upper Division)** | 3.00 – 3.59 |
| **Second Class (Lower Division)** | 2.00 – 2.99 |
| **Third Class** | 1.50 – 1.99 |
| **Pass** | 1.00 – 1.49 |
| **Fail / Academic Probation Risk** | 0.00 – 0.99 |

---

## License
MIT License. Created for University of Ghana students.
# Project-Baby
