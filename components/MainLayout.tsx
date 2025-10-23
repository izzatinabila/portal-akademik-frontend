// Fix: Implemented the missing MainLayout component.
import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar.tsx';
import Dashboard from './Dashboard.tsx';
import Coursework from './Coursework.tsx';
import Reports from './Reports.tsx';
import Settings from './Settings.tsx';
import type { UserData, View, StudentProfile, Semester, AppSettings } from '../types.ts';
import { calculateAcademicData } from '../constants.ts';

interface MainLayoutProps {
    userData: UserData;
    onSave: (updater: (prevData: UserData) => UserData) => void;
    onLogout: () => void;
    appSettings: AppSettings;
    isReadOnly?: boolean;
    isAdminView?: boolean;
    onBack?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ userData, onSave, onLogout, appSettings, isReadOnly = false, isAdminView = false, onBack }) => {
    const [view, setView] = useState<View>('dashboard');

    const academicData = useMemo(() => {
        return calculateAcademicData(userData.semesters || [], appSettings.gradeScale);
    }, [userData.semesters, appSettings.gradeScale]);

    const handleUpdateSemesters = (semestersUpdater: (prevSemesters: Semester[]) => Semester[]) => {
        onSave(prevUserData => ({ ...prevUserData, semesters: semestersUpdater(prevUserData.semesters) }));
    };

    const handleSaveProfile = (profileUpdater: (prevProfile: StudentProfile) => StudentProfile) => {
        onSave(prevUserData => ({ ...prevUserData, profile: profileUpdater(prevUserData.profile) }));
    };

    const handleChangePassword = (oldPassword: string, newPassword: string): boolean => {
        if (userData.password === oldPassword) {
            onSave(prevUserData => ({ ...prevUserData, password: newPassword }));
            return true;
        }
        return false;
    };
    
    const handleResetCourses = () => {
        onSave(prevUserData => ({ ...prevUserData, semesters: [] }));
    };

    const renderContent = () => {
        switch (view) {
            case 'coursework':
                return <Coursework 
                    semesters={userData.semesters || []} 
                    onUpdateSemesters={(updatedSemesters) => onSave(prev => ({...prev, semesters: updatedSemesters}))}
                    profile={userData.profile}
                    onSaveProfile={(updatedProfile) => onSave(prev => ({...prev, profile: updatedProfile}))}
                    ipk={academicData.ipk}
                    totalCredits={academicData.totalCredits}
                    totalQualityPoints={academicData.totalQualityPoints}
                    appSettings={appSettings}
                    isReadOnly={isReadOnly}
                />;
            case 'reports':
                return <Reports 
                    semesters={academicData.processedSemesters} 
                    profile={userData.profile}
                    ipk={academicData.ipk}
                    totalCredits={academicData.totalCredits}
                    appSettings={appSettings}
                />;
            case 'profile':
                return <Settings 
                    profile={userData.profile} 
                    onSaveProfile={(updatedProfile) => onSave(prev => ({...prev, profile: updatedProfile}))}
                    onChangePassword={handleChangePassword}
                    onResetCourses={handleResetCourses}
                    isReadOnly={isReadOnly}
                    isAdminView={isAdminView}
                />;
            case 'dashboard':
            default:
                return <Dashboard 
                    semesters={academicData.processedSemesters}
                    ipk={academicData.ipk}
                    totalCredits={academicData.totalCredits}
                    ipkProgression={academicData.ipkProgression}
                    appSettings={appSettings}
                />;
        }
    };

    return (
        <div className={`flex min-h-screen text-gray-800 ${isAdminView ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <Sidebar 
                view={view}
                setView={setView}
                onLogout={onLogout}
                user={userData.profile}
                isAdminView={isAdminView}
            />
            <main className="flex-1 p-8 overflow-y-auto">
                {isAdminView && onBack && (
                     <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Daftar Mahasiswa
                    </button>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default MainLayout;