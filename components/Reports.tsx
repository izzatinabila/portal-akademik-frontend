// Fix: Implemented the missing Reports component.
import React from 'react';
// Fix: Added .ts extension for explicit module resolution.
import type { Semester, StudentProfile, AppSettings } from '../types.ts';
// Fix: Added .ts extension for explicit module resolution.
import { getGradeDetailsFromScore } from '../constants.ts';
import { generateTranscriptPdf } from '../services/pdfService.ts';

interface ReportsProps {
  semesters: Semester[];
  profile: StudentProfile;
  ipk: number | null;
  totalCredits: number;
  appSettings: AppSettings;
}

const Reports: React.FC<ReportsProps> = ({ semesters, profile, ipk, totalCredits, appSettings }) => {
  const handleDownloadPdf = () => {
    generateTranscriptPdf(semesters, profile, ipk, totalCredits, appSettings.gradeScale);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Akademik</h1>
          <p className="text-gray-500">Berikut adalah transkrip nilai sementara Anda.</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition flex items-center print:hidden"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh Transkrip
        </button>
      </div>

      <div id="transcript" className="bg-white p-8 rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-4 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">TRANSKRIP AKADEMIK</h2>
            <p className="text-gray-600">UNIVERSITAS SRIWIJAYA</p>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
            <div className="flex justify-between border-b py-1"><span className="font-semibold text-gray-600">Nama</span><span className="text-gray-800 text-right">{profile.name}</span></div>
            <div className="flex justify-between border-b py-1"><span className="font-semibold text-gray-600">NIM</span><span className="text-gray-800 text-right">{profile.nim}</span></div>
            <div className="flex justify-between border-b py-1"><span className="font-semibold text-gray-600">Jurusan</span><span className="text-gray-800 text-right">{profile.major}</span></div>
            <div className="flex justify-between border-b py-1"><span className="font-semibold text-gray-600">Angkatan</span><span className="text-gray-800 text-right">{profile.classYear}</span></div>
        </div>
        
        {/* Courses Table */}
        <div className="space-y-6">
            {semesters.map(semester => (
                <div key={semester.id}>
                    <h3 className="text-lg font-bold text-gray-700 mb-2 bg-gray-100 p-2 rounded-md">{semester.name}</h3>
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Mata Kuliah</th>
                                <th scope="col" className="px-4 py-3 text-center">SKS</th>
                                <th scope="col" className="px-4 py-3 text-center">Nilai Angka</th>
                                <th scope="col" className="px-4 py-3 text-center">Nilai Huruf</th>
                                <th scope="col" className="px-4 py-3 text-center">Bobot</th>
                                <th scope="col" className="px-4 py-3 text-right">Mutu (SKS*Bobot)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semester.courses.filter(c => c.score !== null).map(course => {
                                const gradeDetails = getGradeDetailsFromScore(course.score, appSettings.gradeScale);
                                const qualityPoints = gradeDetails.point * course.credits;
                                return (
                                    <tr key={course.id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{course.name}</th>
                                        <td className="px-4 py-4 text-center">{course.credits}</td>
                                        <td className="px-4 py-4 text-center">{course.score}</td>
                                        <td className={`px-4 py-4 text-center font-bold ${gradeDetails.color}`}>{gradeDetails.letter}</td>
                                        <td className="px-4 py-4 text-center">{gradeDetails.point.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right">{qualityPoints.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                             {semester.courses.filter(c => c.score !== null).length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4 text-gray-400">Tidak ada nilai untuk semester ini.</td></tr>
                             ) : (
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={5} className="px-4 py-3 text-right text-gray-800">Indeks Prestasi Semester (IPS)</td>
                                    <td className="px-4 py-3 text-right text-gray-800">{semester.ips?.toFixed(2) ?? '-.--'}</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            ))}
             {semesters.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    <p>Tidak ada data nilai untuk ditampilkan.</p>
                    <p className="text-sm">Silakan input nilai pada halaman 'Input Nilai'.</p>
                </div>
            )}
        </div>

        {/* Summary */}
        {semesters.length > 0 && (
             <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Ringkasan Kumulatif</h3>
                <div className="grid grid-cols-2 max-w-sm ml-auto text-base">
                     <div className="font-semibold text-gray-600 py-1">Total SKS Diambil</div>
                     <div className="text-gray-800 text-right font-bold py-1">{totalCredits}</div>
                     <div className="font-semibold text-gray-600 py-1 border-t">Indeks Prestasi Kumulatif (IPK)</div>
                     <div className="text-gray-800 text-right font-bold text-xl text-unsri-yellow py-1 border-t">{ipk?.toFixed(2) ?? '-.--'}</div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Reports;