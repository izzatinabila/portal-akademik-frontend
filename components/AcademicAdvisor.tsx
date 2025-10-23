import React, { useState } from 'react';
import { getAcademicAdvice } from '../services/geminiService';

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return (
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
            {lines.map((line, index) => {
                const text = line.replace(/^\d+\.\s*/, '');
                if (text) {
                    return <li key={index}>{text}</li>;
                }
                return null;
            })}
        </ol>
    );
};

const AcademicAdvisor: React.FC<{ ipk: number | null }> = ({ ipk }) => {
    const [goal, setGoal] = useState('');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetAdvice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim() || ipk === null) {
            setError('Silakan masukkan tujuan Anda dan pastikan IPK telah terhitung.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setAdvice('');

        try {
            const result = await getAcademicAdvice(ipk, goal);
            setAdvice(result);
        } catch (err) {
            setError('Gagal mendapatkan saran. Silakan coba lagi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-unsri-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" />
                </svg>
                Penasihat Akademik AI
            </h2>
            <p className="text-sm text-gray-500 mb-4">Dapatkan saran yang dipersonalisasi untuk mencapai target akademik Anda berdasarkan IPK Anda saat ini.</p>
            
            <form onSubmit={handleGetAdvice} className="flex-grow flex flex-col">
                <div className="mb-4">
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
                        Apa tujuan akademik Anda?
                    </label>
                    <textarea
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Contoh: Saya ingin meningkatkan IPK saya menjadi 3.50"
                        className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow transition"
                        rows={3}
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition disabled:bg-gray-400 disabled:opacity-50"
                    disabled={isLoading || !goal.trim() || ipk === null}
                >
                    {isLoading ? 'Memproses...' : 'Dapatkan Saran'}
                </button>
            </form>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            
            {advice && !isLoading && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                     <h3 className="font-semibold text-gray-800 mb-2">Saran untuk Anda:</h3>
                    <SimpleMarkdown content={advice} />
                </div>
            )}
        </div>
    );
};

export default AcademicAdvisor;