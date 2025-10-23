import React, { useState } from 'react';
// Fix: Added .ts extension for explicit module resolution.
import type { AuthView } from '../types.ts';

interface ForgotPasswordPageProps {
    onSwitchView: (view: AuthView) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchView }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger a password reset email.
        // For this demo, we'll just show a confirmation message.
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Lupa Password</h1>
                </div>
                <div className="bg-white shadow-md rounded-lg p-8">
                    {submitted ? (
                        <div className="text-center">
                            <p className="text-gray-600">Jika akun dengan email tersebut terdaftar, kami telah mengirimkan instruksi untuk mereset password Anda.</p>
                             <button onClick={() => onSwitchView('login')} className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Kembali ke Halaman Masuk
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="text-gray-500 mb-4">Masukkan email Anda untuk menerima instruksi reset password.</p>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Alamat Email
                                </label>
                                <input
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow"
                                    id="email"
                                    type="email"
                                    placeholder="email@contoh.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button className="bg-unsri-yellow hover:bg-yellow-500 text-slate-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
                                    Kirim Instruksi
                                </button>
                            </div>
                        </form>
                    )}
                    <div className="text-center mt-6">
                         <button onClick={() => onSwitchView('login')} className="font-bold text-unsri-yellow hover:text-yellow-400 text-sm">
                            Kembali ke Halaman Masuk
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;