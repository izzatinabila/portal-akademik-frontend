import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.tsx';
import RegisterPage from './components/RegisterPage.tsx';
import ForgotPasswordPage from './components/ForgotPasswordPage.tsx';
import MainLayout from './components/MainLayout.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import type { UserData, AuthView, AppSettings } from './types.ts';
import { DEFAULT_GRADE_SCALE, DEFAULT_TARGET_SKS } from './constants.ts';
import { registerUser, loginUser, getUsers } from './services/apiService.ts';

const ADMIN_EMAIL = 'admin@unsri.ac.id';

const App: React.FC = () => {
    const [users, setUsers] = useState<Record<string, UserData>>({});
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [authView, setAuthView] = useState<AuthView>('login');
    const [loading, setLoading] = useState(true);
    const [appSettings, setAppSettings] = useState<AppSettings>({
        gradeScale: DEFAULT_GRADE_SCALE,
        targetSks: DEFAULT_TARGET_SKS,
    });
    const [registrationHistory, setRegistrationHistory] = useState<any[]>([]);

    // --- Ambil data awal dari backend ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const allUsers = await getUsers();
                setUsers(allUsers);

                // Buat akun admin lokal jika belum ada di backend
                if (!allUsers[ADMIN_EMAIL]) {
                    allUsers[ADMIN_EMAIL] = {
                        profile: {
                            name: 'Admin Unsri',
                            nim: '0000000000000',
                            email: ADMIN_EMAIL,
                            major: 'Administration',
                            classYear: 'N/A',
                            role: 'admin'
                        },
                        semesters: [],
                        password: 'admin',
                    };
                }

                // Cek apakah ada user yang login sebelumnya
                const loggedInUserEmail = sessionStorage.getItem('gpaAppLoggedInUser');
                if (loggedInUserEmail && allUsers[loggedInUserEmail]) {
                    setCurrentUser(allUsers[loggedInUserEmail]);
                }
            } catch (error) {
                console.error('Gagal memuat data awal:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Simpan pengaturan aplikasi secara lokal ---
    const handleSaveSettings = (newSettings: AppSettings) => {
        setAppSettings(newSettings);
        localStorage.setItem('gpaAppSettings', JSON.stringify(newSettings));
    };

    // --- Register melalui backend ---
    const handleRegister = async (newUser: UserData): Promise<boolean> => {
        try {
            await registerUser(newUser);
            alert('Pendaftaran berhasil! Silakan login.');
            setAuthView('login');
            return true;
        } catch (error) {
            console.error('Gagal register ke backend:', error);
            alert('Gagal mendaftarkan pengguna ke server.');
            return false;
        }
    };

    // --- Login melalui backend ---
    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            const userData = await loginUser(email, password);
            setCurrentUser(userData);
            sessionStorage.setItem('gpaAppLoggedInUser', userData.profile.email);
            return true;
        } catch (error) {
            console.error('Gagal login ke backend:', error);
            alert('Login gagal. Periksa email atau password Anda.');
            return false;
        }
    };

    // --- Logout ---
    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('gpaAppLoggedInUser');
        setAuthView('login');
    };

    // --- Update data user saat diubah dari MainLayout ---
    const handleUpdateCurrentUser = (updater: (prevData: UserData) => UserData) => {
        setCurrentUser(prevCurrentUser => {
            if (!prevCurrentUser) return null;
            const updatedData = updater(prevCurrentUser);
            setUsers(prevUsers => ({
                ...prevUsers,
                [updatedData.profile.email]: updatedData
            }));
            return updatedData;
        });
    };

    // --- Admin Action: tambah, edit, hapus user (masih lokal sementara) ---
    const handleAdminCreateUser = (newUser: UserData): boolean => {
        if (users[newUser.profile.email]) {
            alert('Email sudah digunakan.');
            return false;
        }
        const updatedUsers = { ...users, [newUser.profile.email]: newUser };
        setUsers(updatedUsers);
        return true;
    };

    const handleAdminUpdateUser = (email: string, updater: (prevData: UserData) => UserData) => {
        setUsers(prevUsers => {
            const userToUpdate = prevUsers[email];
            if (!userToUpdate) return prevUsers;
            const updatedData = updater(userToUpdate);
            return { ...prevUsers, [email]: updatedData };
        });
    };

    const handleDeleteUser = (email: string) => {
        setUsers(prevUsers => {
            const updatedUsers = { ...prevUsers };
            delete updatedUsers[email];
            return updatedUsers;
        });
    };

    const handleResetUserPassword = (email: string) => {
        setUsers(prevUsers => {
            const userToUpdate = prevUsers[email];
            if (!userToUpdate) return prevUsers;
            const updatedUser = { ...userToUpdate, password: 'password123' };
            return { ...prevUsers, [email]: updatedUser };
        });
    };

    // --- Loading ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // --- Jika belum login ---
    if (!currentUser) {
        switch (authView) {
            case 'register':
                return (
                    <RegisterPage
                        onRegister={handleRegister}
                        onSwitchView={setAuthView}
                        registrationHistory={registrationHistory}
                    />
                );
            case 'forgotPassword':
                return <ForgotPasswordPage onSwitchView={setAuthView} />;
            default:
                return (
                    <LoginPage
                        onLogin={handleLogin}
                        onSwitchView={setAuthView}
                        registrationHistory={registrationHistory}
                    />
                );
        }
    }

    // --- Jika user adalah admin ---
    if (currentUser.profile.role === 'admin') {
        return (
            <AdminDashboard
                allUsers={users}
                currentUser={currentUser}
                appSettings={appSettings}
                onAddUser={handleAdminCreateUser}
                onUpdateUser={handleAdminUpdateUser}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetUserPassword}
                onSaveSettings={handleSaveSettings}
                onLogout={handleLogout}
            />
        );
    }

    // --- Jika user biasa ---
    return (
        <MainLayout
            userData={currentUser}
            onSave={handleUpdateCurrentUser}
            onLogout={handleLogout}
            appSettings={appSettings}
            isReadOnly={false}
        />
    );
};

export default App;
