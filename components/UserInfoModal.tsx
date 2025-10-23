import React, { useMemo } from 'react';
import type { UserData, AppSettings } from '../types.ts';
import { calculateAcademicData } from '../constants.ts';

interface UserInfoModalProps {
    user: UserData;
    appSettings: AppSettings;
    onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-700">
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="text-sm text-white font-medium text-right">{value || '-'}</dd>
    </div>
);

const UserInfoModal: React.FC<UserInfoModalProps> = ({ user, appSettings, onClose }) => {
    const { ipk, totalCredits, lastAdminEdit } = user;
    const academicData = useMemo(() => {
        return calculateAcademicData(user.semesters, appSettings.gradeScale);
    }, [user.semesters, appSettings.gradeScale]);
    
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short'}) : 'Belum Pernah';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="userInfoModalTitle"
        >
            <div 
                className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-white transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 id="userInfoModalTitle" className="text-2xl font-bold text-white">Detail Informasi Mahasiswa</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white"
                        aria-label="Tutup modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Personal Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-unsri-yellow mb-2">Informasi Pribadi</h3>
                    <dl>
                        <InfoRow label="Nama Lengkap" value={user.profile.name} />
                        <InfoRow label="NIM" value={user.profile.nim} />
                        <InfoRow label="Email" value={user.profile.email} />
                        <InfoRow label="Jurusan" value={user.profile.major} />
                        <InfoRow label="Angkatan" value={user.profile.classYear} />
                        <InfoRow label="Nama Pembimbing Akademik" value={user.profile.advisorName} />
                        <InfoRow label="NIP Pembimbing Akademik" value={user.profile.advisorNip} />
                    </dl>
                </div>

                {/* Academic Summary */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-unsri-yellow mb-2">Ringkasan Akademik</h3>
                    <dl>
                        <InfoRow 
                            label="IPK" 
                            value={<span className="font-bold text-xl">{academicData.ipk?.toFixed(2) ?? 'N/A'}</span>} 
                        />
                        <InfoRow label="Total SKS" value={academicData.totalCredits} />
                        <InfoRow label="Terakhir Diedit Admin" value={formatDate(user.lastAdminEdit)} />
                    </dl>
                </div>
                
                {/* Semester Details */}
                <div>
                    <h3 className="text-lg font-semibold text-unsri-yellow mb-2">Rincian Akademik per Semester</h3>
                    <div className="max-h-48 overflow-y-auto pr-2 border border-slate-700 rounded-md">
                        {academicData.processedSemesters && academicData.processedSemesters.length > 0 ? (
                            <div className="divide-y divide-slate-700">
                                {academicData.processedSemesters.map(semester => (
                                    <div key={semester.id} className="flex justify-between items-center p-3">
                                        <span className="text-sm text-white font-medium">{semester.name}</span>
                                        <span className="text-sm text-gray-300 text-right">
                                            IPS: <span className="font-semibold text-unsri-yellow w-12 inline-block">{semester.ips?.toFixed(2) ?? '-.--'}</span> 
                                            <span className="mx-2 text-slate-500">|</span> 
                                            SKS: <span className="font-semibold text-white w-6 inline-block">{semester.semesterCredits || 0}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6">Belum ada data semester.</p>
                        )}
                    </div>
                </div>


                <div className="mt-8 text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;