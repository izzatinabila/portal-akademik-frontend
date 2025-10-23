import React from 'react';
import type { Semester, AppSettings } from '../types.ts';
import GPADisplay from './GPADisplay.tsx';
import DashboardStats from './DashboardStats.tsx';
import ProgressChart from './ProgressChart.tsx';
import IPKProgressChart from './IPKProgressChart.tsx';

interface DashboardProps {
    semesters: Semester[];
    ipk: number | null;
    totalCredits: number;
    ipkProgression: { name: string; ipk: number | null }[];
    appSettings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ semesters, ipk, totalCredits, ipkProgression, appSettings }) => {
    const lastSemesterWithIps = [...semesters].reverse().find(s => s.ips !== null);
    const lastIps = lastSemesterWithIps ? lastSemesterWithIps.ips : null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Akademik</h1>
                <p className="text-gray-500">Ringkasan performa akademik Anda.</p>
            </div>

            <GPADisplay ipk={ipk} />

            <DashboardStats 
                ipk={ipk}
                lastIps={lastIps}
                totalCredits={totalCredits}
                targetCredits={appSettings.targetSks}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md flex flex-col gap-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Grafik Indeks Prestasi Semester (IPS)</h2>
                        <ProgressChart semesters={semesters} />
                    </div>
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Grafik Progres Indeks Prestasi Kumulatif (IPK)</h2>
                        <IPKProgressChart ipkProgression={ipkProgression} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;