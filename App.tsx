import React, { useState, useEffect } from 'react';
import { View, Plan, Profile } from './types';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import CreatePlanView from './views/CreatePlanView';
import SettingsView from './views/SettingsView';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Handle email confirmation redirect
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=signup')) {
        // Sign out to ensure we go to login screen instead of auto-logging in
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setSuccessMessage('E-mail confirmado com sucesso! Agora você pode fazer login.');
        setCurrentView(View.LOGIN);
        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleEmailConfirmation();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      const { data: { user } } = await supabase.auth.getUser();
      setProfile({
        ...data,
        full_name: user?.user_metadata?.full_name || data.username || 'Usuário',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || userId}`
      });
    } else {
      // If profile doesn't exist, use auth data as fallback
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          id: user.id,
          username: user.email?.split('@')[0] || 'usuario',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          role: user.user_metadata?.role === 'Administrador' ? 'Administrador' : 'Normal',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        });
      }
    }
  };

  const fetchPlans = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPlans(data);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id);
        fetchPlans();
      }
      if (!session && currentView !== View.REGISTER) setCurrentView(View.LOGIN);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id);
        fetchPlans();
        if (currentView === View.LOGIN || currentView === View.REGISTER) {
          setCurrentView(View.DASHBOARD);
        }
      } else {
        setProfile(null);
        if (currentView !== View.REGISTER) {
          setCurrentView(View.LOGIN);
        }
      }
    });

    return () => {
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentView(View.LOGIN);
  };

  const handleNavigate = (view: View) => {
    setEditingPlan(null);
    setCurrentView(view);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setCurrentView(View.CREATE_PLAN);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (currentView === View.REGISTER) {
      return (
        <RegisterView
          onBackToLogin={() => setCurrentView(View.LOGIN)}
          onRegisterSuccess={() => setCurrentView(View.LOGIN)}
        />
      );
    }
    return (
      <LoginView
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentView(View.REGISTER)}
        successMessage={successMessage}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView onNavigate={handleNavigate} plans={plans} />;
      case View.HISTORY:
        return (
          <HistoryView
            onNavigate={handleNavigate}
            plans={plans}
            onEdit={handleEditPlan}
            onDelete={fetchPlans}
            profile={profile}
          />
        );
      case View.CREATE_PLAN:
        return (
          <CreatePlanView
            onNavigate={handleNavigate}
            onSaveSuccess={fetchPlans}
            editingPlan={editingPlan}
            profile={profile}
          />
        );
      case View.SETTINGS:
        return <SettingsView onNavigate={handleNavigate} profile={profile} />;
      default:
        return <DashboardView onNavigate={handleNavigate} plans={plans} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout} profile={profile}>
      {renderView()}
    </Layout>
  );
};

export default App;
