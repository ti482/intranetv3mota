import React, { useState } from 'react';
import { ShieldCheck, Building2, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { ADMIN_EMAIL, ALLOWED_DOMAIN } from '../services/authService';

interface DomainGatekeeperProps {
  onLoginSuccess: (email: string, name: string) => void;
}

export const DomainGatekeeper: React.FC<DomainGatekeeperProps> = ({ onLoginSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError('Por favor, informe seu e-mail institucional.');
      return;
    }

    const domain = email.split('@')[1];
    if (domain !== ALLOWED_DOMAIN && email !== ADMIN_EMAIL) {
      setError(`Acesso negado: Este portal é restrito exclusivamente aos advogados e colaboradores da banca Mota & Advogados Associados (@${ALLOWED_DOMAIN}). Contas externas não são autorizadas.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Derive readable name from email if not provided
      let derivedName = nameInput.trim();
      if (!derivedName) {
        const username = email.split('@')[0];
        derivedName = username
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
      onLoginSuccess(email, derivedName);
      setLoading(false);
    }, 600);
  };

  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    onLoginSuccess(demoEmail, demoName);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

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

        {/* Security Invariant Notice */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Intranet Corporativa Google Workspace</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Acesso estritamente restrito a e-mails autenticados com o domínio corporativo <strong className="text-amber-400 font-mono">@mota.adv.br</strong>. Cada colaborador deve utilizar suas próprias credenciais para acessar os módulos e o histórico de seus chamados.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Seu E-mail Corporativo (@mota.adv.br) *
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="seu.nome@mota.adv.br"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Seu Nome Completo (opcional)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Carlos Eduardo, Dra. Beatriz ou Dr. Roberto"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Google Sign-in Styled Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{loading ? 'Validando conta @mota.adv.br...' : 'Entrar com Google Workspace'}</span>
          </button>
        </form>

        {/* Quick Testing Shortcuts for Demonstration */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Perfis de Demonstração (@mota.adv.br)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('ti@mota.adv.br', 'Carlos Eduardo Siqueira')}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-colors"
            >
              <div className="text-xs font-bold text-amber-300">Você (TI Admin)</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">ti@mota.adv.br</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('roberto.mota@mota.adv.br', 'Dr. Roberto Mota')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Sócio Fundador</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">roberto.mota@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('beatriz.lima@mota.adv.br', 'Dra. Beatriz Alcântara Lima')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Advogada Sênior</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">beatriz.lima@...</div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500 font-mono">
            Suporte técnico: ti@mota.adv.br • Gestor: Carlos Eduardo Siqueira
          </p>
        </div>

      </div>
    </div>
  );
};
