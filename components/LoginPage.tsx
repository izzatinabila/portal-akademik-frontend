import React, { useState } from 'react';
// Fix: Added .ts extension for explicit module resolution.
import type { AuthView, RegistrationEvent } from '../types.ts';

interface LoginPageProps {
    onLogin: (email: string, password: string) => boolean;
    onSwitchView: (view: AuthView) => void;
    registrationHistory: RegistrationEvent[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchView, registrationHistory }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [suggestions, setSuggestions] = useState<RegistrationEvent[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Email atau password salah. Silakan coba lagi.');
        }
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (value.trim() && registrationHistory) {
            const filtered = registrationHistory.filter(event =>
                event.email.toLowerCase().includes(value.toLowerCase()) ||
                event.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: RegistrationEvent) => {
        setEmail(suggestion.email);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    {/* Logo */}
                    <div className="mx-auto h-16 w-16 text-unsri-yellow mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 8.47L4.5 7.3l7.5-4.12L19.5 7.3L12 11.47z"/>
                            <path d="M5 13.18v4.31L12 21l7-3.5V13.2l-7 3.87-7-3.89z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Portal Akademik</h1>
                    <p className="text-gray-500">Silakan masuk untuk melanjutkan</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-8">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                        <div className="mb-4 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow"
                                id="email"
                                type="email"
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                required
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">
                                           <div className="font-semibold">{s.name}</div>
                                           <div className="text-sm text-gray-500">{s.email}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow pr-10"
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="******************"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
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
                        <div className="flex items-center justify-between">
                            <button className="bg-unsri-yellow hover:bg-yellow-500 text-slate-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
                                Masuk
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            Belum punya akun?{' '}
                            <button onClick={() => onSwitchView('register')} className="font-bold text-unsri-yellow hover:text-yellow-400">
                                Daftar di sini
                            </button>
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                             <button onClick={() => onSwitchView('forgotPassword')} className="font-bold text-unsri-yellow hover:text-yellow-400">
                                Lupa Password?
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;