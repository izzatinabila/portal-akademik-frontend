import type { GradeDetails, Semester, AppSettings } from './types';

export const DEFAULT_TARGET_SKS = 144;

export const DEFAULT_GRADE_SCALE: AppSettings['gradeScale'] = [
  { minScore: 86, details: { letter: 'A', point: 4.0, color: 'text-green-500' } },
  { minScore: 71, details: { letter: 'B', point: 3.0, color: 'text-blue-500' } },
  { minScore: 56, details: { letter: 'C', point: 2.0, color: 'text-yellow-500' } },
  { minScore: 40, details: { letter: 'D', point: 1.0, color: 'text-orange-500' } },
  { minScore: 0, details: { letter: 'E', point: 0.0, color: 'text-red-500' } },
];

export const getGradeDetailsFromScore = (score: number | null, gradeScale: AppSettings['gradeScale']): GradeDetails => {
  if (score === null || score < 0 || score > 100) {
    return { letter: '-', point: 0, color: 'text-gray-500' };
  }
  const grade = gradeScale.find(g => score >= g.minScore);
  return grade ? grade.details : { letter: 'E', point: 0.0, color: 'text-red-500' };
};

// Fungsi baru untuk mendapatkan nilai huruf dari bobot
export const getGradeLetterFromPoint = (point: number | null, gradeScale: AppSettings['gradeScale']): string => {
    if (point === null || point < 0 || point > 4) return '-';
    // Cari bobot yang paling mendekati dari skala yang ada
    const closestGrade = gradeScale.reduce((prev, curr) => {
        return (Math.abs(curr.details.point - point) < Math.abs(prev.details.point - point) ? curr : prev);
    });
    // Hanya tampilkan jika bobotnya sama persis untuk menghindari ambiguitas
    if (closestGrade.details.point === point) {
        return closestGrade.details.letter;
    }
    return '?';
};

// Reusable academic calculation logic
export const calculateAcademicData = (semesters: Semester[], gradeScale: AppSettings['gradeScale']) => {
    let totalCredits = 0;
    let totalQualityPoints = 0;
    
    const ipkProgression: { name: string; ipk: number | null }[] = [];
    let cumulativeCredits = 0;
    let cumulativeQualityPoints = 0;

    const processedSemesters = (semesters || []).map(semester => {
        let semesterCredits = 0;
        let semesterQualityPoints = 0;
        let validCourses = 0;

        semester.courses.forEach(course => {
            if (course.score !== null && course.credits > 0) {
                const gradeDetails = getGradeDetailsFromScore(course.score, gradeScale);
                semesterCredits += course.credits;
                semesterQualityPoints += gradeDetails.point * course.credits;
                validCourses++;
            }
        });

        const ips = semesterCredits > 0 ? semesterQualityPoints / semesterCredits : null;
        totalCredits += semesterCredits;
        totalQualityPoints += semesterQualityPoints;

        if (validCourses > 0) {
             cumulativeCredits += semesterCredits;
             cumulativeQualityPoints += semesterQualityPoints;
             const currentIpk = cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : null;
             ipkProgression.push({ name: semester.name, ipk: currentIpk });
        } else {
             const lastIpk = ipkProgression.length > 0 ? ipkProgression[ipkProgression.length-1].ipk : null;
             ipkProgression.push({ name: semester.name, ipk: lastIpk });
        }
        return { ...semester, ips, semesterCredits };
    });

    const ipk = totalCredits > 0 ? totalQualityPoints / totalCredits : null;
    return { ipk, totalCredits, totalQualityPoints, ipkProgression, processedSemesters };
};
