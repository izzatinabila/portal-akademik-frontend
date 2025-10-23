import React from 'react';

interface DashboardStatsProps {
    ipk: number | null;
    lastIps: number | null;
    totalCredits: number;
    targetCredits: number;
}

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <p className="text-sm text-gray-500 mt-4">{description}</p>
    </div>
);


const DashboardStats: React.FC<DashboardStatsProps> = ({ ipk, lastIps, totalCredits, targetCredits }) => {
    const progressPercentage = targetCredits > 0 ? (totalCredits / targetCredits) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                title="IPS Terakhir" 
                value={lastIps !== null ? lastIps.toFixed(2) : '-.--'}
                description="Indeks Prestasi semester terakhir Anda."
            />
            <StatCard 
                title="Total SKS" 
                value={totalCredits.toString()}
                description={`Dari target kelulusan ${targetCredits} SKS.`}
            />
             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between md:col-span-2 lg:col-span-1">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Progres Kelulusan</p>
                    <div className="flex items-baseline mt-1">
                         <p className="text-4xl font-bold text-gray-800">{progressPercentage.toFixed(1)}%</p>
                         <p className="text-lg text-gray-500 ml-2">selesai</p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;