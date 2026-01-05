
import React from 'react';
import { View, Profile } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  profile: Profile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, profile }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Painel', icon: 'dashboard' },
    { view: View.CREATE_PLAN, label: 'Registrar Plano', icon: 'add_circle' },
    { view: View.HISTORY, label: 'Histórico de Planos', icon: 'history' },
    { view: View.SETTINGS, label: 'Configurações', icon: 'settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#1a2634] border-r border-[#e5e7eb] dark:border-gray-800 flex flex-col transition-all duration-300">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined !text-2xl">health_and_safety</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">DAPS/CAP5.3</h1>
            <p className="text-[#617589] dark:text-gray-400 text-xs text-nowrap">PLANEJAMENTO APOIADORES</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === item.view
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 font-semibold'
                : 'text-[#111418] dark:text-gray-200 hover:bg-[#f0f2f4] dark:hover:bg-gray-800'
                }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.view ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <p className="text-sm font-medium leading-normal">{item.label}</p>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[#e5e7eb] dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col overflow-hidden justify-center">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <p className="text-sm font-semibold dark:text-white truncate">{profile?.full_name || 'Usuário'}</p>
              {profile?.role === 'admin' && (
                <span className="bg-primary/10 text-primary text-[8px] font-black px-1 rounded border border-primary/20 uppercase tracking-tighter">Admin</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium">Sair</p>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
