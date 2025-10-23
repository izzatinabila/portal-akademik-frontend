import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Semester, StudentProfile, AppSettings } from '../types.ts';
import { getGradeDetailsFromScore } from '../constants.ts';

export const generateTranscriptPdf = (
    semesters: Semester[],
    profile: StudentProfile,
    ipk: number | null,
    totalCredits: number,
    gradeScale: AppSettings['gradeScale']
) => {
    const doc = new jsPDF();

    // 1. Title
    doc.setFontSize(16);
    doc.text("TRANSKRIP AKADEMIK", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("UNIVERSITAS SRIWIJAYA", doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // 2. Profile Info
    autoTable(doc, {
        startY: 35,
        body: [
            [{ content: 'Nama', styles: { fontStyle: 'bold' } }, profile.name],
            [{ content: 'NIM', styles: { fontStyle: 'bold' } }, profile.nim],
            [{ content: 'Jurusan', styles: { fontStyle: 'bold' } }, profile.major],
            [{ content: 'Angkatan', styles: { fontStyle: 'bold' } }, profile.classYear],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
    });

    // 3. Transcript Table
    const tableBody: any[] = [];
    if (semesters.length > 0) {
        semesters.forEach(semester => {
            tableBody.push([{ content: semester.name, colSpan: 6, styles: { fontStyle: 'bold', fillColor: '#f3f4f6', textColor: '#111827' } }]);
            
            const filteredCourses = semester.courses.filter(c => c.score !== null);
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
        });
    } else {
        tableBody.push([{ content: "Tidak ada data nilai untuk ditampilkan. Silakan input nilai pada halaman 'Input Nilai'.", colSpan: 6, styles: { halign: 'center', textColor: '#9ca3af', minCellHeight: 30 } }]);
    }


    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Mata Kuliah', 'SKS', 'Nilai Angka', 'Nilai Huruf', 'Bobot', 'Mutu (SKS*Bobot)']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: '#e5e7eb', textColor: '#1f2937', fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'right' },
        }
    });

    // 4. Summary
    if (semesters.length > 0) {
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            body: [
                [{ content: 'Total SKS Diambil', styles: { fontStyle: 'bold' } }, totalCredits],
                [{ content: 'Indeks Prestasi Kumulatif (IPK)', styles: { fontStyle: 'bold' } }, ipk?.toFixed(2) ?? '-.--'],
            ],
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 1: { halign: 'right' } }
        });
    }

    // 5. Signature Block
    const finalY = (doc as any).lastAutoTable.finalY;
    let yPos = finalY > 250 ? 280 : (finalY + 20); // Move to next page if not enough space
    if (finalY === 0) yPos = 150; // Adjust starting position if there's no table
    
    if (yPos > 270) {
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


    // 6. Save
    doc.save(`transkrip_${profile.nim}_${profile.name.replace(/\s/g, '_')}.pdf`);
};