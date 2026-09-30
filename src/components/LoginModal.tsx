import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { ADMIN_EMAIL, ALLOWED_DOMAIN, loginWithGoogle } from '../services/authService';
import { UserProfile } from '../types';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
  onCancel?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userProfile = await loginWithGoogle();
      onLogin(userProfile);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O popup de login do Google foi fechado antes da conclusão.');
      } else {
        setError(err.message || 'Falha ao autenticar com a conta Google corporativa.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 mx-auto flex items-center justify-center text-white shadow-lg ring-1 ring-amber-500/30">
            <span className="font-serif font-black text-2xl text-amber-200">M</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white tracking-tight">
            Mota &amp; Advogados Associados
          </h2>
          <p className="text-xs text-slate-400">
            Intranet Corporativa • Acesso via Google Workspace
          </p>
        </div>

        {/* Security Alert Badge */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-200">Autenticação Corporativa Individual</div>
            <div className="text-[11px] text-slate-400">
              Cada colaborador utiliza seu e-mail próprio no domínio <strong className="text-amber-400">@{ALLOWED_DOMAIN}</strong>. Privilégios de TI restritos a <strong className="text-amber-400">{ADMIN_EMAIL}</strong>.
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Official Google Sign-In Styled Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          )}
          <span>{loading ? 'Autenticando via Google...' : 'Entrar com Conta Google Workspace'}</span>
        </button>

      </div>
    </div>
  );
};
