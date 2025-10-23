import React, { useState } from 'react';
// Fix: Added .ts extension to the import path for explicit module resolution.
import type { StudentProfile } from '../types.ts';

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full m-4">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">Konfirmasi Reset Data</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                   Apakah Anda yakin ingin menghapus semua data semester dan mata kuliah Anda secara permanen? Tindakan ini tidak dapat diurungkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Ya, Hapus Semua Data
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SettingsProps {
    profile: StudentProfile;
    onSaveProfile: (updatedProfile: StudentProfile) => void;
    onChangePassword: (oldPassword: string, newPassword: string) => boolean;
    onResetCourses: () => void;
    isReadOnly?: boolean;
    isAdminView?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ profile, onSaveProfile, onChangePassword, onResetCourses, isReadOnly = false, isAdminView = false }) => {
    const [formData, setFormData] = useState<StudentProfile>(profile);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [profileSaved, setProfileSaved] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setProfileSaved(false);
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveProfile(formData);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setPasswordMessage({ type: '', text: '' });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setPasswordMessage({ type: 'error', text: 'Password baru tidak cocok.' });
            return;
        }
        if (passwords.new.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
            return;
        }
        const success = onChangePassword(passwords.old, passwords.new);
        if (success) {
            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
            setPasswords({ old: '', new: '', confirm: '' });
        } else {
            setPasswordMessage({ type: 'error', text: 'Password lama salah.' });
        }
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
    };

    const handleConfirmReset = () => {
        onResetCourses();
        setIsResetModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <ConfirmationModal 
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmReset}
            />

            {/* Profile Settings */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profil Mahasiswa
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Form fields... */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleProfileChange} disabled={isReadOnly} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed"/>
                    </div>
                    <div>
                        <label htmlFor="nim" className="block text-sm font-medium text-gray-700">NIM</label>
                        <input type="text" id="nim" name="nim" value={formData.nim} disabled className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-200 sm:text-sm text-gray-500"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} disabled className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-200 sm:text-sm text-gray-500"/>
                    </div>
                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-gray-700">Jurusan</label>
                        <input type="text" id="major" name="major" value={formData.major} onChange={handleProfileChange} disabled={isReadOnly} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed"/>
                    </div>
                    <div>
                        <label htmlFor="classYear" className="block text-sm font-medium text-gray-700">Angkatan</label>
                        <input type="text" id="classYear" name="classYear" value={formData.classYear} onChange={handleProfileChange} disabled={isReadOnly} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed"/>
                    </div>
                    {!isReadOnly && (
                        <div className="flex justify-end items-center pt-4 border-t">
                            {profileSaved && <span className="text-green-600 text-sm mr-4">Profil berhasil disimpan!</span>}
                            <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition">Simpan Profil</button>
                        </div>
                    )}
                </form>
            </div>

            {/* Security Settings & Data Reset are only for the student viewing their own profile */}
            {!isAdminView && (
                <>
                    {/* Security Settings */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Keamanan
                        </h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                 <label htmlFor="old" className="block text-sm font-medium text-gray-700">Password Lama</label>
                                 <input type="password" id="old" name="old" value={passwords.old} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" required/>
                            </div>
                             <div>
                                 <label htmlFor="new" className="block text-sm font-medium text-gray-700">Password Baru</label>
                                 <input type="password" id="new" name="new" value={passwords.new} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" required/>
                            </div>
                             <div>
                                 <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                                 <input type="password" id="confirm" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-unsri-yellow focus:border-unsri-yellow sm:text-sm text-gray-800" required/>
                            </div>
                            <div className="flex justify-end items-center pt-2">
                                {passwordMessage.text && <span className={`${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'} text-sm mr-4`}>{passwordMessage.text}</span>}
                                <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition">Ubah Password</button>
                            </div>
                        </form>
                    </div>
                    
                    {/* Data Reset */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                         <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-2-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Reset Data
                        </h2>
                        <p className="text-gray-500 mb-4">Tindakan ini akan menghapus semua data semester dan mata kuliah Anda secara permanen. Profil Anda akan tetap tersimpan. Tindakan ini tidak dapat diurungkan.</p>
                        <button onClick={() => setIsResetModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition">Reset Semua Data Nilai</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Settings;