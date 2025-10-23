import React, { useState } from 'react';
// Fix: Added .ts extension for explicit module resolution.
import type { AuthView, UserData, RegistrationEvent } from '../types.ts';

interface RegisterPageProps {
    onRegister: (newUser: UserData) => boolean;
    onSwitchView: (view: AuthView) => void;
    registrationHistory: RegistrationEvent[];
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchView, registrationHistory }) => {
    const [formData, setFormData] = useState({
        name: '',
        nim: '',
        email: '',
        major: '',
        classYear: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [suggestions, setSuggestions] = useState<RegistrationEvent[]>([]);
    const [activeSuggestionBox, setActiveSuggestionBox] = useState<keyof Omit<typeof formData, 'password' | 'confirmPassword'> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const suggestionFields = ['name', 'nim', 'email'];
        if (suggestionFields.includes(name) && value.trim()) {
            const filtered = registrationHistory.filter(event =>
                (event[name as keyof RegistrationEvent] || '').toString().toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
            setActiveSuggestionBox(name as 'name' | 'nim' | 'email');
        } else {
            setActiveSuggestionBox(null);
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (event: RegistrationEvent) => {
        setFormData(prev => ({
            ...prev,
            name: event.name,
            nim: event.nim,
            email: event.email,
        }));
        setActiveSuggestionBox(null);
        setSuggestions([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password minimal harus 6 karakter.');
            return;
        }

        const newUser: UserData = {
            profile: {
                name: formData.name,
                nim: formData.nim,
                email: formData.email,
                major: formData.major,
                classYear: formData.classYear,
                advisorName: '',
                advisorNip: '',
                transcriptPlaceAndDate: '',
                role: 'student',
            },
            semesters: [],
            password: formData.password,
        };

        const success = onRegister(newUser);
        if (!success) {
            setError('Email atau NIM sudah terdaftar. Silakan gunakan yang lain.');
        }
    };

    return (
       <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Daftar Akun Baru</h1>
                    <p className="text-gray-500">Buat akun untuk mulai mengelola data akademik Anda.</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Lengkap</label>
                                <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow" id="name" name="name" type="text" value={formData.name} onChange={handleChange} required autoComplete="off" onBlur={() => setTimeout(() => setActiveSuggestionBox(null), 150)} />
                                {activeSuggestionBox === 'name' && suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                        {suggestions.map((s, i) => <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">{s.name}</li>)}
                                    </ul>
                                )}
                            </div>
                            <div className="relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nim">NIM</label>
                                <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow" id="nim" name="nim" type="text" value={formData.nim} onChange={handleChange} required autoComplete="off" onBlur={() => setTimeout(() => setActiveSuggestionBox(null), 150)} />
                                {activeSuggestionBox === 'nim' && suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                        {suggestions.map((s, i) => <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">{s.nim}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="off" onBlur={() => setTimeout(() => setActiveSuggestionBox(null), 150)} />
                            {activeSuggestionBox === 'email' && suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                    {suggestions.map((s, i) => <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">{s.email}</li>)}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="major">Jurusan</label>
                            <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow" id="major" name="major" type="text" value={formData.major} onChange={handleChange} required />
                        </div>

                        <div>
                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="classYear">Angkatan</label>
                             <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow" id="classYear" name="classYear" type="text" placeholder="Contoh: 2021" value={formData.classYear} onChange={handleChange} required />
                        </div>

                         <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <div className="relative">
                                <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow pr-10" id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-3.59-3.59" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Konfirmasi Password</label>
                            <div className="relative">
                                <input className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow pr-10" id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required />
                                 <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-3.59-3.59" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="bg-unsri-yellow hover:bg-yellow-500 text-slate-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
                                Daftar
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            Sudah punya akun?{' '}
                            <button onClick={() => onSwitchView('login')} className="font-bold text-unsri-yellow hover:text-yellow-400">
                                Masuk
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;