import React from 'react';

interface GPADisplayProps {
    ipk: number | null;
}

const GPADisplay: React.FC<GPADisplayProps> = ({ ipk }) => {
    const displayValue = ipk !== null ? ipk.toFixed(2) : '-.--';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
            <p className="text-lg font-semibold text-gray-500 uppercase tracking-wider">Indeks Prestasi Kumulatif (IPK)</p>
            <p className="text-7xl font-bold text-unsri-yellow my-2">{displayValue}</p>
            <p className="text-gray-500">Rangkuman performa akademik Anda secara keseluruhan.</p>
        </div>
    );
};

export default GPADisplay;