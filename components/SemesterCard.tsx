// Fix: Implemented the missing SemesterCard component.
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Semester, Course, StudentProfile, AppSettings } from '../types.ts';
import CourseInput from './CourseInput.tsx';
import { getGradeDetailsFromScore } from '../constants.ts';

interface SemesterCardProps {
    semester: Semester;
    profile: StudentProfile;
    onUpdateSemester: (updatedSemester: Semester) => void;
    onRemoveSemester: (id: string) => void;
    gradeScale: AppSettings['gradeScale'];
    isReadOnly?: boolean;
}

const SemesterCard: React.FC<SemesterCardProps> = ({ semester, profile, onUpdateSemester, onRemoveSemester, gradeScale, isReadOnly = false }) => {
    const [courses, setCourses] = useState<Course[]>(semester.courses);

    useEffect(() => {
        setCourses(semester.courses);
    }, [semester.courses]);

    useEffect(() => {
        if (isReadOnly) return;

        let totalCredits = 0;
        let totalQualityPoints = 0;

        courses.forEach(course => {
            if (course.score !== null) {
                const gradeDetails = getGradeDetailsFromScore(course.score, gradeScale);
                totalCredits += course.credits;
                totalQualityPoints += gradeDetails.point * course.credits;
            }
        });

        const newIps = totalCredits > 0 ? totalQualityPoints / totalCredits : null;

        if (newIps !== semester.ips || JSON.stringify(courses) !== JSON.stringify(semester.courses)) {
            onUpdateSemester({ ...semester, courses, ips: newIps });
        }
    }, [courses, semester, onUpdateSemester, gradeScale, isReadOnly]);


    const handleAddCourse = (newCourse: Omit<Course, 'id'>) => {
        if (isReadOnly) return;
        setCourses([...courses, { ...newCourse, id: `course-${Date.now()}` }]);
    };

    const handleRemoveCourse = (id: string) => {
        if (isReadOnly) return;
        setCourses(courses.filter(c => c.id !== id));
    };

    const handleUpdateCourse = (id: string, field: keyof Course, value: string) => {
        if (isReadOnly) return;
        setCourses(courses.map(c => {
            if (c.id === id) {
                const updatedCourse = { ...c };
                if (field === 'name') {
                    updatedCourse.name = value;
                } else if (field === 'credits') {
                    const credits = parseInt(value, 10);
                    // Only update if it's a valid number to prevent wiping the input
                    if (!isNaN(credits)) {
                        updatedCourse.credits = credits;
                    } else if (value === '') {
                        // Allow clearing the field
                        updatedCourse.credits = 0;
                    }
                } else if (field === 'score') {
                    if (value === '') {
                        updatedCourse.score = null;
                    } else {
                        const score = parseFloat(value);
                        // Only update if it's a valid number
                        if (!isNaN(score)) {
                            updatedCourse.score = score;
                        }
                    }
                }
                return updatedCourse;
            }
            return c;
        }));
    };
    
    const handleDownloadKHS = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(16);
        doc.text(`KARTU HASIL STUDI (KHS)`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(semester.name.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

        // Profile Info
        autoTable(doc, {
            startY: 35,
            body: [
                [{ content: 'Nama', styles: { fontStyle: 'bold' } }, profile.name],
                [{ content: 'NIM', styles: { fontStyle: 'bold' } }, profile.nim],
                [{ content: 'Jurusan', styles: { fontStyle: 'bold' } }, profile.major],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1.5 },
        });

        // Courses Table
        const tableBody: any[] = [];
        const filteredCourses = courses.filter(c => c.score !== null);
        
        if (filteredCourses.length > 0) {
            filteredCourses.forEach(course => {
                const gradeDetails = getGradeDetailsFromScore(course.score, gradeScale);
                const qualityPoints = gradeDetails.point * course.credits;
                tableBody.push([
                    course.name,
                    course.credits,
                    course.score,
                    gradeDetails.letter,
                    gradeDetails.point.toFixed(2),
                    qualityPoints.toFixed(2),
                ]);
            });
        } else {
             tableBody.push([{ content: 'Tidak ada nilai untuk semester ini.', colSpan: 6, styles: { halign: 'center', textColor: '#9ca3af' } }]);
        }

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Mata Kuliah', 'SKS', 'Nilai Angka', 'Nilai Huruf', 'Bobot', 'Mutu (SKS*Bobot)']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: '#e5e7eb', textColor: '#1f2937', fontStyle: 'bold' },
        });

        // Summary
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            body: [
                [{ content: 'Total SKS Semester', styles: { fontStyle: 'bold' } }, semesterCredits],
                [{ content: 'Indeks Prestasi Semester (IPS)', styles: { fontStyle: 'bold' } }, semester.ips?.toFixed(2) ?? '-.--'],
            ],
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 1: { halign: 'right' } }
        });
        
        // Signature Block
        const finalY = (doc as any).lastAutoTable.finalY;
        let yPos = finalY + 20;
        
        if (yPos > 250) { // Check if there's enough space, otherwise add a new page
            doc.addPage();
            yPos = 20;
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const rightX = pageWidth - 20;

        const placeAndDate = profile.transcriptPlaceAndDate?.trim() || '(Tempat, Tanggal Bulan Tahun)';
        const advisorName = profile.advisorName?.trim() || '(_________________________)';
        const advisorNip = profile.advisorNip?.trim() ? `NIP. ${profile.advisorNip.trim()}` : 'NIP. ';

        doc.setFontSize(10);
        doc.text(placeAndDate, rightX, yPos, { align: 'right' });
        yPos += 7;
        doc.text("Pembimbing Akademik,", rightX, yPos, { align: 'right' });
        yPos += 25; // Space for signature
        doc.setFont('helvetica', 'bold');
        doc.text(advisorName, rightX, yPos, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPos += 7;
        doc.text(advisorNip, rightX, yPos, { align: 'right' });


        doc.save(`KHS_${semester.name.replace(/\s/g, '_')}_${profile.nim}.pdf`);
    };

    const semesterCredits = courses.reduce((acc, course) => acc + (course.score !== null ? course.credits : 0), 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{semester.name}</h2>
                <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-sm text-gray-500">IPS</p>
                        <p className="text-lg font-bold text-unsri-yellow">{semester.ips?.toFixed(2) ?? '-.--'}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-gray-500">SKS</p>
                        <p className="text-lg font-bold text-gray-800">{semesterCredits}</p>
                    </div>
                    <button onClick={handleDownloadKHS} className="text-gray-400 hover:text-blue-500" title="Unduh KHS (PDF)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    {!isReadOnly && (
                        <button onClick={() => onRemoveSemester(semester.id)} className="text-gray-400 hover:text-red-500" title="Hapus Semester">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-2-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {/* Header */}
                 <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 px-2 py-1">
                    <div className="col-span-5">Mata Kuliah</div>
                    <div className="col-span-2 text-center">SKS</div>
                    <div className="col-span-2 text-center">Nilai Angka</div>
                    <div className="col-span-1 text-center">Nilai Huruf</div>
                    <div className="col-span-2"></div>
                </div>
                
                {courses.map(course => (
                    <div key={course.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-md">
                        <div className="col-span-5">
                            <input type="text" value={course.name} onChange={(e) => handleUpdateCourse(course.id, 'name', e.target.value)} className="w-full bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isReadOnly} />
                        </div>
                        <div className="col-span-2">
                            <input type="number" value={course.credits} onChange={(e) => handleUpdateCourse(course.id, 'credits', e.target.value)} className="w-full text-center bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isReadOnly}/>
                        </div>
                        <div className="col-span-2">
                           <input type="number" value={course.score ?? ''} onChange={(e) => handleUpdateCourse(course.id, 'score', e.target.value)} className="w-full text-center bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed" min="0" max="100" step="0.01" disabled={isReadOnly}/>
                        </div>
                         <div className={`col-span-1 text-center font-bold text-lg ${getGradeDetailsFromScore(course.score, gradeScale).color}`}>
                           {getGradeDetailsFromScore(course.score, gradeScale).letter}
                        </div>
                        <div className="col-span-2 flex justify-end">
                             {!isReadOnly && (
                                <button onClick={() => handleRemoveCourse(course.id)} className="text-gray-400 hover:text-red-500 p-1">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Belum ada mata kuliah. {isReadOnly ? '' : 'Tambahkan di bawah.'}</p>
                )}
            </div>
            
            {!isReadOnly && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <CourseInput onAddCourse={handleAddCourse} />
                </div>
            )}
        </div>
    );
};

export default SemesterCard;