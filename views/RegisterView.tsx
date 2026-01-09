import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RegisterViewProps {
    onBackToLogin: () => void;
    onRegisterSuccess: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onBackToLogin, onRegisterSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: import.meta.env.VITE_REDIRECT_URL || window.location.origin
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            // Sign out immediately to prevent auto-login
            await supabase.auth.signOut();
            setSuccess(true);
            setLoading(false);
            // Wait a bit before redirecting or notifying
            setTimeout(() => {
                onRegisterSuccess();
            }, 3000);
        }
    };

    return (
        <div className="bg-background-light font-display text-[#1d1b20] min-h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 lg:px-10 py-3 bg-white shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="size-8 sm:size-10 rounded-full bg-blue-50 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined !text-[20px] sm:!text-[24px]">health_and_safety</span>
                    </div>
                    <h2 className="text-[#1d1b20] text-sm sm:text-lg font-bold leading-tight tracking-[-0.015em] whitespace-normal sm:whitespace-nowrap">PLANEJAMENTO APOIADORES DAPS/CAP5.3</h2>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f0f2f5]">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.08) 0%, transparent 60%)' }}></div>
                <div className="flex flex-col max-w-[480px] w-full items-center z-10">
                    <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 sm:p-8 lg:p-12">
                        <div className="mb-8">
                            <h2 className="text-[#1d1b20] text-2xl font-bold leading-tight tracking-[-0.015em] mb-2">Criar sua conta</h2>
                            <p className="text-gray-600 text-sm">Preencha os dados abaixo para se cadastrar no portal.</p>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined !text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Cadastro realizado!</h3>
                                <p className="text-gray-600 mb-4">
                                    Sua conta foi criada com sucesso para <strong>{email}</strong>.
                                    Você já pode fazer login no portal.
                                </p>
                                <p className="text-sm text-gray-500">Redirecionando para o login em instantes...</p>
                            </div>
                        ) : (
                            <form className="flex flex-col gap-6" onSubmit={handleSignUp}>
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-[#1d1b20] text-sm font-medium">Nome Completo</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">person</span>
                                        <input
                                            className="form-input flex w-full rounded-lg border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 pl-12 text-base"
                                            placeholder="Seu nome completo"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>


                                <div className="flex flex-col gap-2">
                                    <label className="text-[#1d1b20] text-sm font-medium">Endereço de E-mail</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
                                        <input
                                            className="form-input flex w-full rounded-lg border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 pl-12 text-base"
                                            placeholder="nome@organizacao.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[#1d1b20] text-sm font-medium">Senha</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
                                        <input
                                            className="form-input flex w-full rounded-lg border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 pl-12 text-base"
                                            placeholder="Crie uma senha forte"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-4 flex w-full items-center justify-center rounded-full h-12 px-5 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    <span className="truncate">{loading ? "Cadastrando..." : "Cadastrar"}</span>
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={onBackToLogin}
                                        className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                                    >
                                        Já tem uma conta? Entrar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterView;
