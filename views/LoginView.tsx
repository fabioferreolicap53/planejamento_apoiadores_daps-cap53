
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      onLogin();
    }
  };

  return (
    <div className="bg-background-light font-display text-[#1d1b20] min-h-screen flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 lg:px-10 py-3 bg-white shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <h2 className="text-[#1d1b20] text-lg font-bold leading-tight tracking-[-0.015em]">PLANEJAMENTO APOIADORES DAPS/CAP5.3</h2>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f0f2f5]">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(19, 127, 236, 0.08) 0%, transparent 60%)' }}></div>
        <div className="flex flex-col max-w-[960px] w-full items-center z-10">
          <div className="flex flex-col md:flex-row w-full max-w-[960px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Blue Side */}
            <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 p-10 flex-col justify-between relative text-white">
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: 'url("https://picsum.photos/id/403/800/1200")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="relative z-10">
                <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-8 border border-white/30">
                  <span className="material-symbols-outlined !text-3xl">verified_user</span>
                </div>
                <h1 className="text-white text-3xl font-bold leading-tight mb-4">PLANEJAMENTO APOIADORES DAPS/CAP5.3</h1>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  Acesse o portal profissional para registrar, gerenciar e auditar planos. Sua porta de entrada para operações DAPS/CAP5.3 simplificadas.
                </p>
              </div>
              <div className="relative z-10 mt-12">
                <div className="flex items-center gap-3 text-sm text-blue-50">
                  <span className="material-symbols-outlined filled text-white">check_circle</span>
                  <span>Conformidade HIPAA</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-50 mt-3">
                  <span className="material-symbols-outlined filled text-white">check_circle</span>
                  <span>Criptografia de 256 bits</span>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="w-full md:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-white">
              <div className="mb-8">
                <h2 className="text-[#1d1b20] text-2xl font-bold leading-tight tracking-[-0.015em] mb-2">Bem-vindo de volta</h2>
                <p className="text-gray-600 text-sm">Por favor, faça login para acessar seu painel.</p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleSignIn}>
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                )}
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
                  <div className="flex justify-between items-center">
                    <label className="text-[#1d1b20] text-sm font-medium">Senha</label>
                    <a className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors" href="#">Esqueceu a senha?</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
                    <input
                      className="form-input flex w-full rounded-lg border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 pl-12 pr-12 text-base"
                      placeholder="Digite sua senha"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1d1b20] p-2"
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center rounded-full h-12 px-5 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{loading ? "Entrando..." : "Entrar"}</span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Ainda não tem uma conta?
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="font-bold text-primary hover:text-primary-dark transition-colors ml-1 underline decoration-transparent hover:decoration-current"
                  >
                    Cadastrar
                  </button>
                </p>
              </div>
              <div className="mt-8 flex justify-center gap-6">
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">Desenvolvido por Fabio Ferreira de Oliveira - DAPS/CAP5.3</p>
        </div>
      </main>
    </div>
  );
};

export default LoginView;
