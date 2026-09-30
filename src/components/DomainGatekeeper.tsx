import React, { useState } from 'react';
import { ShieldCheck, Building2, AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { ADMIN_EMAIL, ALLOWED_DOMAIN, loginWithGoogle } from '../services/authService';
import { UserProfile } from '../types';

interface DomainGatekeeperProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const DomainGatekeeper: React.FC<DomainGatekeeperProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const userProfile = await loginWithGoogle();
      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O popup de login do Google foi fechado antes da conclusão.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored or harmless
      } else {
        let msg = err.message || 'Falha ao autenticar com a conta Google corporativa.';
        try {
          const parsed = JSON.parse(msg);
          if (parsed && parsed.error) {
            msg = parsed.error;
          }
        } catch {}
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Login Box */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 mx-auto flex items-center justify-center text-white shadow-xl ring-2 ring-amber-500/30">
            <span className="font-serif font-black text-3xl text-amber-200">M</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                Mota &amp; Advogados Associados
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                OAB/DF 1413-A
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edifício Athenas • Brasília/DF</span>
              <span>•</span>
              <span className="text-amber-300 font-medium">Desde 2000</span>
            </p>
          </div>
        </div>

        {/* Security Requirement Notice */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Autenticação Google Workspace Corporativa</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Acesso estritamente restrito a colaboradores com e-mail corporativo no domínio <strong className="text-amber-400 font-mono">@{ALLOWED_DOMAIN}</strong> ou ao gestor de TI homologado (<strong className="text-amber-400 font-mono">{ADMIN_EMAIL}</strong>).
          </p>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Validação criptográfica direta via Google Accounts e Firebase Auth oficial.</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Official Google Sign-In Action */}
        <div className="space-y-3.5 pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-slate-200 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>{loading ? 'Conectando ao Google...' : 'Entrar com Conta Google (@mota.adv.br)'}</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-500 font-mono">
            Administração de TI: {ADMIN_EMAIL} • Suporte Técnico e Acesso
          </p>
        </div>

      </div>
    </div>
  );
};
