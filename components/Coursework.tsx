import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension for explicit module resolution.
import type { Semester, StudentProfile, AppSettings } from '../types.ts';
// Fix: Added .tsx extension for explicit module resolution.
import SemesterCard from './SemesterCard.tsx';
// Fix: Added .tsx extension for explicit module resolution.
import AddSemesterModal from './AddSemesterModal.tsx';
import CalculationSummary from './CalculationSummary.tsx';
import { generateTranscriptPdf } from '../services/pdfService.ts';

interface CourseworkProps {
  semesters: Semester[];
  onUpdateSemesters: (semesters: Semester[]) => void;
  profile: StudentProfile;
  onSaveProfile: (updatedProfile: StudentProfile) => void;
  ipk: number | null;
  totalCredits: number;
  totalQualityPoints: number;
  appSettings: AppSettings;
  isReadOnly?: boolean;
}

const Coursework: React.FC<CourseworkProps> = ({ 
    semesters, 
    onUpdateSemesters,
    profile,
    onSaveProfile,
    ipk,
    totalCredits,
    totalQualityPoints,
    appSettings,
    isReadOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ semester: Semester; index: number } | null>(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState<number | null>(null);
  const [advisorInfo, setAdvisorInfo] = useState({
    advisorName: profile.advisorName || '',
    advisorNip: profile.advisorNip || '',
    transcriptPlaceAndDate: profile.transcriptPlaceAndDate || '',
  });
  const [infoSaved, setInfoSaved] = useState(false);


  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (undoTimeoutId) clearTimeout(undoTimeoutId);
    };
  }, [undoTimeoutId]);
  
  useEffect(() => {
    setAdvisorInfo({
        advisorName: profile.advisorName || '',
        advisorNip: profile.advisorNip || '',
        transcriptPlaceAndDate: profile.transcriptPlaceAndDate || '',
    });
  }, [profile]);

  const handleAddSemester = (name: string) => {
    const newSemester: Semester = {
      id: `semester-${Date.now()}`,
      name,
      courses: [],
      ips: null,
    };
    onUpdateSemesters([...semesters, newSemester]);
    setIsModalOpen(false);
  };

  const handleUpdateSemester = (updatedSemester: Semester) => {
    onUpdateSemesters(
      semesters.map(s => (s.id === updatedSemester.id ? updatedSemester : s))
    );
  };

  const handleRemoveSemester = (id: string) => {
    if (isReadOnly) return;
    const semesterIndex = semesters.findIndex(s => s.id === id);
    if (semesterIndex === -1) return;

    const semesterToDelete = semesters[semesterIndex];
    
    // Clear any pending undo action
    if (undoTimeoutId) clearTimeout(undoTimeoutId);

    // Store for potential undo
    setRecentlyDeleted({ semester: semesterToDelete, index: semesterIndex });

    // Optimistically remove from UI
    onUpdateSemesters(semesters.filter(s => s.id !== id));

    // Set timeout to finalize deletion
    const timeoutId = window.setTimeout(() => {
      setRecentlyDeleted(null);
    }, 5000); // 5 seconds to undo
    setUndoTimeoutId(timeoutId);
  };
  
  const handleUndoDelete = () => {
    if (!recentlyDeleted) return;

    // Restore semester
    const newSemesters = [...semesters];
    newSemesters.splice(recentlyDeleted.index, 0, recentlyDeleted.semester);
    onUpdateSemesters(newSemesters);

    // Clear undo state
    setRecentlyDeleted(null);
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
      setUndoTimeoutId(null);
    }
  };
  
  const handleDownloadTranscript = () => {
    generateTranscriptPdf(semesters, profile, ipk, totalCredits, appSettings.gradeScale);
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdvisorInfo(prev => ({ ...prev, [name]: value }));
    setInfoSaved(false);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ ...profile, ...advisorInfo });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 3000);
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Input Nilai Perkuliahan</h1>
          <p className="text-gray-500">
            {isReadOnly 
              ? "Lihat data semester dan mata kuliah Anda."
              : "Tambah, ubah, atau hapus data semester dan mata kuliah Anda."
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadTranscript}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={semesters.length === 0}
            title={semesters.length === 0 ? "Tambahkan data semester terlebih dahulu" : "Unduh Transkrip Lengkap (PDF)"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh Transkrip
          </button>
          {!isReadOnly && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Semester
            </button>
          )}
        </div>
      </div>
      
      {!isReadOnly && (
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Transkrip</h2>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="advisorName" className="block text-sm font-medium text-gray-700">Nama Pembimbing Akademik</label>
                    <input type="text" id="advisorName" name="advisorName" value={advisorInfo.advisorName} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" placeholder="Masukkan nama dosen PA"/>
                </div>
                <div>
                    <label htmlFor="advisorNip" className="block text-sm font-medium text-gray-700">NIP Pembimbing Akademik</label>
                    <input type="text" id="advisorNip" name="advisorNip" value={advisorInfo.advisorNip} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" placeholder="Masukkan NIP dosen PA"/>
                </div>
              </div>
              <div>
                <label htmlFor="transcriptPlaceAndDate" className="block text-sm font-medium text-gray-700">Tempat & Tanggal Transkrip</label>
                <input type="text" id="transcriptPlaceAndDate" name="transcriptPlaceAndDate" value={advisorInfo.transcriptPlaceAndDate} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" placeholder="Contoh: Indralaya, 30 Agustus 2024"/>
              </div>
              <div className="flex justify-end items-center">
                  {infoSaved && <span className="text-green-600 text-sm mr-4">Informasi berhasil disimpan!</span>}
                  <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition">Simpan Informasi</button>
              </div>
            </form>
        </div>
      )}


      {semesters.length > 0 ? (
        <>
            <div className="space-y-6">
            {semesters.map(semester => (
                <SemesterCard
                key={semester.id}
                semester={semester}
                profile={profile}
                onUpdateSemester={handleUpdateSemester}
                onRemoveSemester={handleRemoveSemester}
                gradeScale={appSettings.gradeScale}
                isReadOnly={isReadOnly}
                />
            ))}
            </div>
            <CalculationSummary
                ipk={ipk}
                totalCredits={totalCredits}
                totalQualityPoints={totalQualityPoints}
                targetCredits={appSettings.targetSks}
            />
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Belum ada data semester.</p>
          {!isReadOnly && <p className="text-gray-500 mt-2">Klik "Tambah Semester" untuk memulai.</p>}
        </div>
      )}

      {isModalOpen && (
        <AddSemesterModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddSemester}
        />
      )}

      {/* Undo Toast */}
      {recentlyDeleted && !isReadOnly && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span>Semester "{recentlyDeleted.semester.name}" dihapus.</span>
          <button
            onClick={handleUndoDelete}
            className="font-bold text-unsri-yellow hover:text-yellow-400"
            aria-label="Urungkan penghapusan semester"
          >
            Urungkan
          </button>
        </div>
      )}
    </div>
  );
};

export default Coursework;