import React from 'react';
// Fix: Added .ts extension to the import path for explicit module resolution.
import type { Semester } from '../types.ts';

interface ProgressChartProps {
  semesters: Semester[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ semesters }) => {
  const chartData = semesters.filter(s => s.ips !== null);
  const maxIps = Math.max(4, ...chartData.map(s => s.ips || 0));

  return (
    <div className="w-full h-64 flex items-end justify-around p-4 border-l border-b border-gray-300 space-x-2 relative">
      {/* Y-Axis Labels */}
      <div className="absolute left-[-2.5rem] top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
          <span>4.0</span>
          <span>3.0</span>
          <span>2.0</span>
          <span>1.0</span>
          <span>0.0</span>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">Data IP Semester akan muncul di sini setelah nilai diisi.</p>
        </div>
      ) : (
        chartData.map((semester) => (
          <div key={semester.id} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div
              className="w-3/4 bg-unsri-yellow rounded-t-md hover:bg-yellow-500 transition-all duration-300 relative"
              style={{ height: `${((semester.ips || 0) / maxIps) * 100}%` }}
              title={`IPS: ${semester.ips?.toFixed(2)}`}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-xs font-bold text-white bg-gray-800 rounded-md px-2 py-1 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                {semester.ips?.toFixed(2)}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{semester.name}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default ProgressChart;