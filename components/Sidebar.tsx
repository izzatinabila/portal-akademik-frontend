// Fix: Implemented the missing Sidebar component.
import React from 'react';
// Fix: Added .ts extension to the import path for explicit module resolution.
import type { View, StudentProfile } from '../types.ts';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  user: StudentProfile;
  isAdminView?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onLogout, user, isAdminView = false }) => {
  // Fix: Changed icon type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const navItems: { id: View; label: string; icon: React.ReactElement }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      id: 'coursework',
      label: isAdminView ? 'Kelola Nilai' : 'Input Nilai',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: 'profile',
      label: 'Pengaturan',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  return (
    <aside className="w-64 bg-slate-800 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
           <div className="w-10 h-10 bg-unsri-yellow rounded-full flex items-center justify-center font-bold text-slate-800 text-xl">
               {user.name.charAt(0)}
           </div>
           <div>
               <p className="font-bold text-white truncate">{user.name}</p>
               <p className="text-xs text-gray-400">{user.nim}</p>
           </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                view === item.id
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-slate-700 hover:text-white transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;