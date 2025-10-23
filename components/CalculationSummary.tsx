import React from 'react';

interface CalculationSummaryProps {
    ipk: number | null;
    totalCredits: number;
    totalQualityPoints: number;
    targetCredits: number;
}

const CalculationSummary: React.FC<CalculationSummaryProps> = ({ ipk, totalCredits, totalQualityPoints, targetCredits }) => {
    const progressPercentage = targetCredits > 0 ? (totalCredits / targetCredits) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Akademik</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                <div>
                    <p className="text-sm text-gray-500">Total SKS</p>
                    <p className="text-2xl font-bold text-gray-800">{totalCredits}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Bobot</p>
                    <p className="text-2xl font-bold text-gray-800">{totalQualityPoints.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">IPK Kumulatif</p>
                    <p className="text-2xl font-bold text-unsri-yellow">{ipk !== null ? ipk.toFixed(2) : '-.--'}</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700">Progres Akademik</p>
                    <p className="text-sm font-medium text-gray-700">{totalCredits} / {targetCredits} SKS</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-right text-xs text-gray-500 mt-1">{progressPercentage.toFixed(1)}% dari {targetCredits} SKS</p>
            </div>
        </div>
    );
};

export default CalculationSummary;