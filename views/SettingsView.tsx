import React from 'react';
import { View, Profile } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
    onNavigate: (view: View) => void;
    profile: Profile | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, profile }) => {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-[#1a2634] border-b border-[#e5e7eb] dark:border-gray-800 flex-shrink-0 z-10">
                <div className="px-8 py-6 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#111418] dark:text-white text-3xl font-black tracking-tighter">Configurações</h1>
                        <p className="text-[#617589] dark:text-gray-400 text-base">Gerencie seu perfil e níveis de acesso.</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
                    <div className="bg-white dark:bg-[#1a2634] rounded-2xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">person</span>
                            Informações do Perfil
                        </h2>

                        <div className="flex items-center gap-6 mb-8">

                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-bold">{profile?.full_name || 'Usuário'}</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                                    {profile?.role === 'Administrador' ? 'Administrador' : 'Profissional'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                    Você está autenticado
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nível de Privilégio</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 font-bold text-primary">
                                    {profile?.role?.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a2634] rounded-2xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm p-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">security</span>
                            Privilégios de Acesso
                        </h2>
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {profile?.role === 'admin'
                                                ? 'Você tem acesso total ao sistema.'
                                                : 'Você tem acesso restrito.'}
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-400">
                                            {profile?.role === 'Administrador'
                                                ? 'Como administrador, você pode visualizar, editar e excluir qualquer plano registrado por qualquer profissional.'
                                                : 'Como profissional, você pode visualizar todos os planos, mas só tem permissão para editar ou excluir os planos criados por você mesmo.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Alterar Nível de Privilégio (Demo/Admin)</h3>
                                <p className="text-xs text-gray-500 mb-4">Insira o código administrativo para alterar seu papel.</p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        id="admin-code"
                                        placeholder="Código administrativo"
                                        className="h-10 flex-1 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                                    />
                                    <button
                                        onClick={async () => {
                                            const code = (document.getElementById('admin-code') as HTMLInputElement).value;
                                            if (code === 'DAPS-ADMIN' || code === 'DAPS-USER') {
                                                const newRole = code === 'DAPS-ADMIN' ? 'Administrador' : 'Normal';
                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .upsert({
                                                        id: profile?.id,
                                                        role: newRole,
                                                        updated_at: new Date().toISOString()
                                                    });
                                                if (!error) {
                                                    alert(`Privilégio alterado para ${newRole === 'Administrador' ? 'Administrador' : 'Profissional'}!`);
                                                    window.location.reload();
                                                } else {
                                                    alert('Erro ao alterar privilégio.');
                                                }
                                            } else {
                                                alert('Código inválido.');
                                            }
                                        }}
                                        className="h-10 px-6 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
