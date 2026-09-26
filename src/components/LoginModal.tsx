import React, { useState } from 'react';
import { ShieldCheck, Lock, Building2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { ADMIN_EMAIL, ALLOWED_DOMAIN } from '../services/authService';

interface LoginModalProps {
  onLogin: (email: string, name: string) => void;
  onCancel?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onCancel }) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    const domain = email.split('@')[1];
    if (domain !== ALLOWED_DOMAIN && email !== ADMIN_EMAIL) {
      setError(`Acesso restrito. Apenas contas corporativas @${ALLOWED_DOMAIN} são autorizadas.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const derivedName = nameInput.trim() || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
      onLogin(email, derivedName);
      setIsSubmitting(false);
    }, 600);
  };

  const handleQuickAdminLogin = () => {
    onLogin(ADMIN_EMAIL, 'Carlos Eduardo Siqueira');
  };

  const handleQuickAttorneyLogin = () => {
    onLogin('beatriz.lima@mota.adv.br', 'Dra. Beatriz Alcântara Lima');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 mx-auto flex items-center justify-center text-white shadow-lg ring-1 ring-amber-500/30">
            <span className="font-serif font-black text-2xl text-amber-200">M</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white tracking-tight">
            Mota &amp; Advogados Associados
          </h2>
          <p className="text-xs text-slate-400">
            Intranet Corporativa • Acesso Exclusivo via Google SSO
          </p>
        </div>

        {/* Security Alert Badge */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-200">Autenticação Corporativa Individual</div>
            <div className="text-[11px] text-slate-400">
              Cada colaborador utiliza seu e-mail próprio. Privilégios administrativos restritos a <strong className="text-amber-400">{ADMIN_EMAIL}</strong>.
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGoogleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              E-mail Corporativo (@mota.adv.br)
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="seu.nome@mota.adv.br"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Nome Completo do Usuário
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Carlos Eduardo ou Dra. Ana Paula"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Sign-In Styled Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{isSubmitting ? 'Autenticando...' : 'Entrar com Conta Google Workspace'}</span>
          </button>
        </form>

        {/* Quick Profiles for Demonstration & Testing */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Acesso Rápido de Teste (Perfis)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left text-xs transition-colors"
            >
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <span>TI Admin (Você)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">ti@mota.adv.br</div>
            </button>

            <button
              type="button"
              onClick={handleQuickAttorneyLogin}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition-colors"
            >
              <div className="font-bold text-slate-200">Advogada Sênior</div>
              <div className="text-[10px] text-slate-400 font-mono">beatriz.lima@...</div>
            </button>
          </div>
        </div>

        {onCancel && (
          <div className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Continuar como visitante
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
