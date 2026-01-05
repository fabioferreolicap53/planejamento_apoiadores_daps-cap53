
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
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white h-screen w-full flex overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} profile={profile} />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
