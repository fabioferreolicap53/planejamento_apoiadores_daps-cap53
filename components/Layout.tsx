
import React from 'react';
import { View, Profile } from '../types';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  profile: Profile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, onLogout, profile }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white h-screen w-full flex overflow-hidden relative">
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        onLogout={onLogout}
        profile={profile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a2634] border-b border-[#e5e7eb] dark:border-gray-800">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-sm font-bold truncate px-4">PLANEJAMENTO APOIADORES</h2>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
