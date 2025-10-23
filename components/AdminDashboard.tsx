import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { UserData, LoginEvent, AdminView, AppSettings, RegistrationEvent, GradeDetails } from '../types.ts';
import MainLayout from './MainLayout.tsx';
import { calculateAcademicData } from '../constants.ts';
import UserInfoModal from './UserInfoModal.tsx';

// --- Helper & Child Components ---

const Notification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return <div className="fixed top-8 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">{message}</div>;
};

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}> = ({ title, message, onConfirm, onCancel, confirmText = "Konfirmasi", cancelText = "Batal" }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500">
                        {cancelText}
                    </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AddUserModal: React.FC<{ onAdd: (newUser: UserData) => boolean; onClose: () => void }> = ({ onAdd, onClose }) => {
    const [formData, setFormData] = useState({ name: '', nim: '', email: '', major: '', classYear: '', password: '' });
    const [error, setError] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.values(formData).some(v => !(v as string).trim())) {
            setError('Semua field harus diisi.');
            return;
        }
        const newUser: UserData = {
            profile: { ...formData, role: 'student' },
            semesters: [],
            password: formData.password,
        };
        if (onAdd(newUser)) onClose();
        else setError('Email atau NIM sudah ada.');
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-white">
                <h2 className="text-2xl font-bold mb-4">Tambah Mahasiswa Baru</h2>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Nama Lengkap" onChange={handleChange} className="bg-slate-700 p-2 rounded" />
                        <input name="nim" placeholder="NIM" onChange={handleChange} className="bg-slate-700 p-2 rounded" />
                    </div>
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full bg-slate-700 p-2 rounded" />
                    <input name="major" placeholder="Jurusan" onChange={handleChange} className="w-full bg-slate-700 p-2 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="classYear" placeholder="Angkatan" onChange={handleChange} className="bg-slate-700 p-2 rounded" />
                         <input name="password" placeholder="Password Awal" onChange={handleChange} className="bg-slate-700 p-2 rounded" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-unsri-yellow text-slate-800 font-bold rounded">Tambah</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminSidebar: React.FC<{view: AdminView, setView: (v: AdminView) => void, currentUser: UserData, onLogout: () => void}> = ({ view, setView, currentUser, onLogout }) => {
    const navItems = [
        { id: 'users', label: 'Manajemen Pengguna', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 'analytics', label: 'Analitik Akademik', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        { id: 'settings', label: 'Pengaturan Sistem', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];
    return (
         <aside className="w-64 bg-slate-800 p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-10 h-10 bg-unsri-yellow rounded-full flex items-center justify-center font-bold text-slate-800 text-xl">A</div>
                    <div>
                       <p className="font-bold text-white truncate">{currentUser.profile.name}</p>
                       <p className="text-xs text-gray-400">{currentUser.profile.email}</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setView(item.id as AdminView)} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${view === item.id ? 'bg-slate-700 text-white' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}>
                          {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-slate-700 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Logout</span>
            </button>
        </aside>
    );
};

const AdminHeader: React.FC<{
    unseenCount: number;
    showNotifications: boolean;
    onToggleNotifications: () => void;
    loginNotifications: LoginEvent[];
    onAddUser: (newUser: UserData) => boolean;
    view: AdminView;
    title: string;
    subtitle: string;
}> = ({ unseenCount, showNotifications, onToggleNotifications, loginNotifications, onAddUser, view, title, subtitle }) => {
    const formatTimeAgo = (isoString: string) => {
        const date = new Date(isoString); const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " tahun lalu";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " bulan lalu";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " hari lalu";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " jam lalu";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " menit lalu";
        return "Baru saja";
    };
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    return (
        <>
        {isAddModalOpen && <AddUserModal onAdd={onAddUser} onClose={() => setAddModalOpen(false)} />}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                <p className="text-gray-400">{subtitle}</p>
            </div>
            {view === 'users' && (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={onToggleNotifications} className="text-gray-400 hover:text-white transition-colors" aria-label="Notifikasi">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            {unseenCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unseenCount}</span>}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-slate-700 rounded-lg shadow-xl z-20">
                                <div className="p-3 font-bold border-b border-slate-600">Notifikasi</div>
                                <ul className="max-h-96 overflow-y-auto">
                                    {loginNotifications.length > 0 ? loginNotifications.map((n, i) => (
                                        <li key={i} className="px-3 py-2 border-b border-slate-600/50 hover:bg-slate-600/50 text-sm">
                                            <p className="font-semibold">{n.name}</p>
                                            <p className="text-gray-400">telah masuk · {formatTimeAgo(n.timestamp)}</p>
                                        </li>
                                    )) : <li className="p-4 text-center text-gray-400 text-sm">Tidak ada notifikasi baru.</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setAddModalOpen(true)} className="bg-unsri-yellow hover:bg-yellow-500 text-slate-800 font-bold py-2 px-4 rounded transition flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Tambah Mahasiswa
                    </button>
                </div>
            )}
        </div>
        </>
    );
};

const UserManagement: React.FC<{
    studentUsers: UserData[];
    onSelectUser: (user: UserData) => void;
    onViewInfo: (user: UserData) => void;
    onDeleteUser: (email: string) => void;
    onResetPassword: (email: string) => void;
    setNotification: (msg: string) => void;
    appSettings: AppSettings;
}> = ({ studentUsers, onSelectUser, onViewInfo, onDeleteUser, onResetPassword, setNotification, appSettings }) => {
    const [resetTarget, setResetTarget] = useState<UserData['profile'] | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserData['profile'] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeYear, setActiveYear] = useState('Semua');

    const getGpaIndicatorClass = (ipk: number | null): string => {
        if (ipk === null) return 'bg-slate-500'; // Neutral for no data
        if (ipk > 3.0) return 'bg-green-500';
        if (ipk >= 2.5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const years = useMemo(() => {
        const uniqueYears = [...new Set(studentUsers.map(u => u.profile.classYear))];
        return ['Semua', ...uniqueYears.sort((a,b) => String(b).localeCompare(String(a)))];
    }, [studentUsers]);

    const filteredUsers = useMemo(() => {
        return studentUsers
            .map(user => {
                const { ipk, totalCredits } = calculateAcademicData(user.semesters, appSettings.gradeScale);
                return { ...user, ipk, totalCredits };
            })
            .filter(user => {
                const matchesYear = activeYear === 'Semua' || user.profile.classYear === activeYear;
                const matchesSearch = searchQuery.trim() === '' || 
                                      user.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      user.profile.nim.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesYear && matchesSearch;
            });
    }, [studentUsers, activeYear, searchQuery, appSettings.gradeScale]);

    const handleResetPassword = (email: string) => {
        onResetPassword(email);
        setNotification(`Password untuk ${resetTarget?.name || email} berhasil di-reset.`);
        setResetTarget(null);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            onDeleteUser(deleteTarget.email);
            setNotification(`Pengguna ${deleteTarget.name} berhasil dihapus.`);
            setDeleteTarget(null);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredUsers.map((user) => {
            return {
                Nama: user.profile.name, NIM: user.profile.nim, Email: user.profile.email,
                Jurusan: user.profile.major, Angkatan: user.profile.classYear,
                IPK: user.ipk ? user.ipk.toFixed(2) : 'N/A', 
                Total_SKS: user.totalCredits,
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Mahasiswa");
        XLSX.writeFile(workbook, `Data_Mahasiswa_${activeYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setNotification('Data berhasil diekspor!');
    };
    
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleString('id-ID') : 'N/A';

    return (
        <>
            {resetTarget && <ConfirmationModal title="Reset Password Mahasiswa" message={`Apakah Anda yakin ingin mereset password untuk ${resetTarget.name}? Password akan diubah menjadi "password123".`} onConfirm={() => handleResetPassword(resetTarget.email)} onCancel={() => setResetTarget(null)} confirmText="Ya, Reset" />}
            {deleteTarget && <ConfirmationModal title="Hapus Pengguna" message={`Apakah Anda yakin ingin menghapus pengguna ${deleteTarget.name}? Tindakan ini tidak dapat diurungkan.`} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmText="Ya, Hapus" />}
            
            <div className="bg-slate-800 rounded-lg shadow-lg">
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="relative w-full max-w-md">
                        <input type="text" placeholder="Cari nama atau NIM..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-700 text-white p-2 pl-10 rounded-md border-slate-600 focus:ring-unsri-yellow"/>
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Data
                    </button>
                </div>
                
                <div className="border-b border-slate-700 px-4">
                    <div className="flex space-x-1 overflow-x-auto">
                        {years.map(year => (
                            <button key={year} onClick={() => setActiveYear(year)} className={`px-4 py-2 text-sm font-medium rounded-t-md whitespace-nowrap ${activeYear === year ? 'bg-slate-700 text-unsri-yellow' : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'}`}>
                               {year === 'Semua' ? 'Semua Angkatan' : `Angkatan ${year}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama</th>
                                <th scope="col" className="px-6 py-3">NIM / Email</th>
                                <th scope="col" className="px-6 py-3">Jurusan</th>
                                <th scope="col" className="px-6 py-3">Terakhir Diedit</th>
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.profile.email} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getGpaIndicatorClass(user.ipk)}`}
                                                title={`IPK: ${user.ipk?.toFixed(2) ?? 'N/A'}`}
                                            ></span>
                                            <span>{user.profile.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="font-semibold">{user.profile.nim}</div><div className="text-xs text-gray-400">{user.profile.email}</div></td>
                                    <td className="px-6 py-4">{user.profile.major}</td>
                                    <td className="px-6 py-4">{formatDate(user.lastAdminEdit)}</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button onClick={() => onViewInfo(user)} className="text-blue-500 hover:text-blue-600 p-1" title="Lihat Info">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                        </button>
                                        <button onClick={() => onSelectUser(user)} className="text-yellow-400 hover:text-yellow-500 p-1" title="Kelola Mahasiswa">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                        </button>
                                        <button onClick={() => setResetTarget(user.profile)} className="text-orange-400 hover:text-orange-500 p-1" title="Reset Password">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </button>
                                        <button onClick={() => setDeleteTarget(user.profile)} className="text-red-500 hover:text-red-600 p-1" title="Hapus Pengguna">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-2-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada pengguna yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const AcademicAnalytics: React.FC<{ studentUsers: UserData[], appSettings: AppSettings }> = ({ studentUsers, appSettings }) => {
    const [filterYear, setFilterYear] = useState('Semua');
    const [filterMajor, setFilterMajor] = useState('Semua');

    const { years, majors } = useMemo(() => {
        const yearsSet = new Set<string>();
        const majorsSet = new Set<string>();
        studentUsers.forEach(u => {
            if (u.profile.classYear) yearsSet.add(u.profile.classYear);
            if (u.profile.major) majorsSet.add(u.profile.major);
        });
        return {
            years: ['Semua', ...Array.from(yearsSet).sort((a, b) => b.localeCompare(a))],
            majors: ['Semua', ...Array.from(majorsSet).sort()]
        };
    }, [studentUsers]);

    const filteredStudentGpaData = useMemo(() => {
        return studentUsers
            .filter(user => {
                const matchesYear = filterYear === 'Semua' || user.profile.classYear === filterYear;
                const matchesMajor = filterMajor === 'Semua' || user.profile.major === filterMajor;
                return matchesYear && matchesMajor;
            })
            .map(user => {
                const { ipk } = calculateAcademicData(user.semesters, appSettings.gradeScale);
                return { name: user.profile.name, nim: user.profile.nim, ipk };
            })
            .filter(data => data.ipk !== null) as { name: string; nim: string; ipk: number }[];
    }, [studentUsers, appSettings, filterYear, filterMajor]);

    const gpaDistribution = useMemo(() => {
        // Fix: Replaced `Record<string, number>` with a specific object type. `Record<string, number>` can cause `Object.values` to return `unknown[]` with some strict TypeScript settings, which is not compatible with `Math.max`.
        const distribution: {
            sangatBaik: number;
            baik: number;
            cukup: number;
            perluPerhatian: number;
        } = {
            sangatBaik: 0, // >= 3.5
            baik: 0,        // 3.0 - 3.49
            cukup: 0,       // 2.5 - 2.99
            perluPerhatian: 0, // < 2.5
        };
        filteredStudentGpaData.forEach(student => {
            if (student.ipk >= 3.5) distribution.sangatBaik++;
            else if (student.ipk >= 3.0) distribution.baik++;
            else if (student.ipk >= 2.5) distribution.cukup++;
            else distribution.perluPerhatian++;
        });
        return distribution;
    }, [filteredStudentGpaData]);
    
    const totalFilteredStudents = filteredStudentGpaData.length;
    // Fix: Replaced `Object.values` with destructuring to ensure type safety with `Math.max`. This avoids issues with strict TypeScript settings that infer `unknown[]` for `Object.values`.
    const { sangatBaik, baik, cukup, perluPerhatian } = gpaDistribution;
    const maxCountInDistribution = totalFilteredStudents > 0 ? Math.max(sangatBaik, baik, cukup, perluPerhatian) : 1;

    const topStudents = [...filteredStudentGpaData].sort((a, b) => b.ipk - a.ipk).slice(0, 5);
    const bottomStudents = [...filteredStudentGpaData].sort((a, b) => a.ipk - b.ipk).slice(0, 5);

    const RankTable: React.FC<{ title: string; data: { name: string; nim: string; ipk: number }[] }> = ({ title, data }) => (
        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase">
                    <tr>
                        <th className="py-2 px-2">Peringkat</th>
                        <th className="py-2 px-2">Nama</th>
                        <th className="py-2 px-2">NIM</th>
                        <th className="py-2 px-2 text-right">IPK</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? data.map((student, index) => (
                        <tr key={student.nim} className="border-t border-slate-700">
                            <td className="py-3 px-2">{index + 1}</td>
                            <td className="py-3 px-2 text-white">{student.name}</td>
                            <td className="py-3 px-2">{student.nim}</td>
                            <td className="py-3 px-2 text-right font-bold text-unsri-yellow">{student.ipk.toFixed(2)}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">Data tidak cukup.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
    
    const distributionCategories = [
        { label: '>= 3.50 (Sangat Baik)', value: gpaDistribution.sangatBaik, color: 'bg-green-500' },
        { label: '3.00 - 3.49 (Baik)', value: gpaDistribution.baik, color: 'bg-blue-500' },
        { label: '2.50 - 2.99 (Cukup)', value: gpaDistribution.cukup, color: 'bg-yellow-500' },
        { label: '< 2.50 (Perlu Perhatian)', value: gpaDistribution.perluPerhatian, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="filterYear" className="text-sm font-medium text-gray-400">Filter Angkatan:</label>
                    <select id="filterYear" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full mt-1 bg-slate-700 text-white p-2 rounded-md border-slate-600 focus:ring-unsri-yellow">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="filterMajor" className="text-sm font-medium text-gray-400">Filter Jurusan:</label>
                    <select id="filterMajor" value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)} className="w-full mt-1 bg-slate-700 text-white p-2 rounded-md border-slate-600 focus:ring-unsri-yellow">
                        {majors.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">Distribusi IPK Mahasiswa</h3>
                <p className="text-sm text-gray-400 mb-6">Total Mahasiswa Terfilter: {totalFilteredStudents}</p>
                {totalFilteredStudents > 0 ? (
                    <div className="space-y-4">
                        {distributionCategories.map(cat => (
                            <div key={cat.label} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-12 sm:col-span-4 md:col-span-3 text-sm text-gray-300">{cat.label}</div>
                                <div className="col-span-10 sm:col-span-7 md:col-span-8">
                                    <div className="w-full bg-slate-700 rounded-full h-4 relative group">
                                        <div 
                                            className={`${cat.color} h-4 rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white`} 
                                            style={{ width: `${(cat.value / maxCountInDistribution) * 100}%` }}
                                        >
                                           <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded-md text-xs absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
                                                {cat.value} Mahasiswa
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1 text-sm text-right text-gray-300 font-semibold">
                                    {cat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">Tidak ada data untuk ditampilkan sesuai filter.</div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RankTable title="Peringkat 5 Tertinggi (IPK)" data={topStudents} />
                <RankTable title="Peringkat 5 Terendah (IPK)" data={bottomStudents} />
            </div>
        </div>
    );
};

const SystemSettings: React.FC<{
    appSettings: AppSettings;
    onSaveSettings: (settings: AppSettings) => void;
    onBackup: () => void;
    onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ appSettings, onSaveSettings, onBackup, onRestore }) => {
    const [settings, setSettings] = useState(appSettings);
    const [notification, setNotification] = useState('');

    const handleSave = () => {
        const sanitizedGradeScale = settings.gradeScale
            .filter((g: any) => g.details.letter && g.details.letter.trim() !== '')
            .map((g: any) => ({
                minScore: Number(g.minScore) || 0,
                details: {
                    ...g.details,
                    point: Number(g.details.point) || 0,
                },
            }))
            .sort((a, b) => b.minScore - a.minScore);

        onSaveSettings({ ...settings, gradeScale: sanitizedGradeScale });
        setNotification('Pengaturan berhasil disimpan!');
        setTimeout(() => setNotification(''), 3000);
    };

    const handleGradeChange = (index: number, field: keyof Omit<GradeDetails, 'color'> | 'minScore', value: string) => {
        const newGradeScale = [...settings.gradeScale];
        const item = JSON.parse(JSON.stringify(newGradeScale[index]));

        const getColorForGrade = (letter: string): string => {
            switch (letter.toUpperCase()) {
                case 'A': return 'text-green-500';
                case 'B': return 'text-blue-500';
                case 'C': return 'text-yellow-500';
                case 'D': return 'text-orange-500';
                default: return 'text-red-500';
            }
        };

        if (field === 'minScore') {
            item.minScore = value;
        } else if (field === 'point') {
            item.details.point = value;
        } else if (field === 'letter') {
            item.details.letter = value.toUpperCase();
            item.details.color = getColorForGrade(value);
        }
        
        newGradeScale[index] = item;
        setSettings({ ...settings, gradeScale: newGradeScale as any });
    };

    const handleAddGrade = () => {
        const newGradeScale = [
            ...settings.gradeScale,
            { minScore: '', details: { letter: '', point: '', color: 'text-gray-500' } }
        ];
        setSettings({ ...settings, gradeScale: newGradeScale as any });
    };

    const handleDeleteGrade = (indexToDelete: number) => {
        const newGradeScale = settings.gradeScale.filter((_, index) => index !== indexToDelete);
        setSettings({ ...settings, gradeScale: newGradeScale });
    };

    return (
         <div className="space-y-8">
            {notification && <div className="bg-green-600/50 border border-green-500 text-white p-3 rounded-md">{notification}</div>}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                 <h3 className="text-xl font-bold text-white mb-4">Pengaturan Umum</h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Target SKS Kelulusan</label>
                        <input 
                            type="number"
                            value={settings.targetSks}
                            onChange={(e) => setSettings({...settings, targetSks: parseInt(e.target.value, 10)})}
                            className="bg-slate-700 p-2 rounded w-full max-w-xs"
                        />
                    </div>
                 </div>
            </div>
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Skala Penilaian</h3>
                <div className="grid grid-cols-4 gap-4 items-center text-xs text-gray-400 font-bold px-2 mb-2">
                    <span>Huruf</span>
                    <span>Bobot</span>
                    <span>Nilai Min.</span>
                    <span className="text-right">Aksi</span>
                </div>
                <div className="space-y-2">
                    {settings.gradeScale.map((grade: any, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 items-center">
                            <input 
                                value={grade.details.letter} 
                                onChange={e => handleGradeChange(index, 'letter', e.target.value)} 
                                placeholder="A" 
                                maxLength={2}
                                className={`bg-slate-700 p-2 rounded font-bold text-center ${grade.details.color}`}
                            />
                            <input type="number" step="0.5" value={grade.details.point} onChange={e => handleGradeChange(index, 'point', e.target.value)} placeholder="4.0" className="bg-slate-700 p-2 rounded"/>
                            <input type="number" value={grade.minScore} onChange={e => handleGradeChange(index, 'minScore', e.target.value)} placeholder="86" className="bg-slate-700 p-2 rounded"/>
                            <div className="text-right">
                                <button onClick={() => handleDeleteGrade(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-2-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleAddGrade}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Tambah Baris
                    </button>
                </div>
            </div>
             <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Manajemen Data</h3>
                <div className="flex gap-4">
                    <button onClick={onBackup} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Backup Semua Data</button>
                    <label className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        <span>Restore dari File</span>
                        <input type="file" className="hidden" accept=".json" onChange={onRestore} />
                    </label>
                </div>
                <p className="text-sm text-gray-400 mt-4">Perhatian: Restore akan menimpa semua data pengguna yang ada saat ini.</p>
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="bg-unsri-yellow text-slate-800 font-bold py-2 px-6 rounded">Simpan Pengaturan</button>
            </div>
         </div>
    );
};


// --- Main Component ---

interface AdminDashboardProps {
    allUsers: Record<string, UserData>;
    currentUser: UserData;
    appSettings: AppSettings;
    onAddUser: (newUser: UserData) => boolean;
    onUpdateUser: (email: string, updater: (prevData: UserData) => UserData) => void;
    onDeleteUser: (email: string) => void;
    onResetPassword: (email: string) => void;
    onSaveSettings: (newSettings: AppSettings) => void;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { allUsers, currentUser, appSettings, onAddUser, onUpdateUser, onDeleteUser, onResetPassword, onSaveSettings, onLogout } = props;
    
    const [view, setView] = useState<AdminView>('users');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [notification, setNotification] = useState('');
    const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [infoUser, setInfoUser] = useState<UserData | null>(null);

    useEffect(() => {
        try {
            const storedLoginEvents = localStorage.getItem('gpaAppLoginEvents');
            if (storedLoginEvents) setLoginEvents(JSON.parse(storedLoginEvents));
        } catch (error) {
            console.error("Failed to parse events from storage", error);
        }
    }, []);

    // FIX: Sync selected user data with the master list to reflect real-time updates.
    useEffect(() => {
        if (selectedUser) {
            const updatedUserData = allUsers[selectedUser.profile.email];
            if (updatedUserData) {
                setSelectedUser(updatedUserData);
            }
        }
    }, [allUsers, selectedUser]);


    const studentUsers = useMemo(() => {
        return Object.values(allUsers).filter(u => (u as UserData).profile.role !== 'admin');
    }, [allUsers]);

    const unseenCount = loginEvents.filter(e => !e.seen).length;

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            const seenEvents = loginEvents.map(e => ({ ...e, seen: true }));
            setLoginEvents(seenEvents);
            localStorage.setItem('gpaAppLoginEvents', JSON.stringify(seenEvents));
        }
    };
    
    const handleBackup = () => {
        const dataStr = JSON.stringify(allUsers, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `gpa_app_backup_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setNotification("Backup berhasil diunduh!");
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const restoredUsers = JSON.parse(event.target?.result as string);
                    // Basic validation
                    if (typeof restoredUsers === 'object' && !Array.isArray(restoredUsers)) {
                        if (window.confirm("Apakah Anda yakin ingin me-restore data? Semua data pengguna saat ini akan digantikan.")) {
                            localStorage.setItem('gpaAppUsers', JSON.stringify(restoredUsers));
                            setNotification("Data berhasil di-restore! Halaman akan dimuat ulang.");
                            setTimeout(() => window.location.reload(), 2000);
                        }
                    } else { throw new Error("Invalid file format"); }
                } catch (err) {
                    alert("Gagal me-restore data. Pastikan file backup valid.");
                }
            };
            reader.readAsText(file);
        }
    };
    
    const viewTitles: Record<AdminView, { title: string; subtitle: string }> = {
        users: { title: 'Manajemen Pengguna', subtitle: 'Kelola, tambah, dan lihat data semua mahasiswa.' },
        analytics: { title: 'Analitik Akademik', subtitle: 'Lihat peringkat mahasiswa berdasarkan performa IPK.' },
        settings: { title: 'Pengaturan Sistem', subtitle: 'Atur skala penilaian, target SKS, dan manajemen data.' },
    };


    if (selectedUser) {
        return (
            <MainLayout
                userData={selectedUser}
                onSave={(updater) => onUpdateUser(selectedUser.profile.email, updater)}
                onLogout={onLogout}
                appSettings={appSettings}
                isReadOnly={false}
                isAdminView={true}
                onBack={() => setSelectedUser(null)}
            />
        );
    }
    
    let content;
    switch(view) {
        case 'analytics': content = <AcademicAnalytics studentUsers={studentUsers} appSettings={appSettings}/>; break;
        case 'settings': content = <SystemSettings appSettings={appSettings} onSaveSettings={onSaveSettings} onBackup={handleBackup} onRestore={handleRestore} />; break;
        case 'users':
        default: content = <UserManagement 
                studentUsers={studentUsers} 
                onSelectUser={setSelectedUser}
                onViewInfo={setInfoUser}
                onDeleteUser={onDeleteUser}
                onResetPassword={onResetPassword}
                setNotification={setNotification}
                appSettings={appSettings}
            />; break;
    }

    return (
        <div className="flex min-h-screen text-gray-300 bg-slate-900">
            {notification && <Notification message={notification} onClose={() => setNotification('')} />}
            {infoUser && <UserInfoModal user={infoUser} appSettings={appSettings} onClose={() => setInfoUser(null)} />}
            
            <AdminSidebar view={view} setView={setView} currentUser={currentUser} onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-y-auto">
                <AdminHeader 
                    unseenCount={unseenCount}
                    showNotifications={showNotifications}
                    onToggleNotifications={handleToggleNotifications}
                    loginNotifications={loginEvents}
                    onAddUser={onAddUser}
                    view={view}
                    title={viewTitles[view].title}
                    subtitle={viewTitles[view].subtitle}
                />
                {content}
            </main>
        </div>
    );
};

export default AdminDashboard;