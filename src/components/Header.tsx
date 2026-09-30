import React from 'react';
import { UserProfile } from '../types';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  PlusCircle,
  HelpCircle,
  Calendar,
  Lock,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenSearch: () => void;
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  onQuickAction: (action: 'meeting' | 'ticket' | 'search' | 'ai' | 'admin') => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  onOpenSearch,
  onOpenLoginModal,
  onLogout,
  onQuickAction,
}) => {
  const isMasterAdmin = currentUser.email.toLowerCase() === 'ti@mota.adv.br';
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top Banner with Corporate Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Firm Credentials */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-md flex items-center justify-center text-white ring-1 ring-amber-500/30">
              <div className="h-full w-full bg-slate-950/40 rounded-[6px] flex items-center justify-center">
                <span className="font-serif font-black text-xl tracking-wider text-amber-200">M</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  Mota &amp; Advogados Associados
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OAB/DF 1413-A
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Edifício Athenas • Brasília/DF</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300/90 font-medium">+26 anos (Desde 2000)</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Domínio Corporativo @mota.adv.br
                </span>
              </p>
            </div>
          </div>

          {/* Quick Search and User Switcher */}
          <div className="flex items-center gap-3 self-end md:self-center">
            
            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all shadow-inner group"
              title="Abrir Busca Inteligente (Google Sites, Drive, Docs, Sheets e POPs)"
            >
              <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Busca Inteligente (IA)...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">
                Ctrl + K
              </kbd>
            </button>

            {/* Quick Actions Shortcuts */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => onQuickAction('meeting')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700/80 transition-colors"
                title="Agendar nova audiência ou reunião no Google Meet"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Meet</span>
              </button>
              <button
                onClick={() => onQuickAction('ticket')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700/80 transition-colors"
                title="Abrir chamado na Central de TI"
              >
                <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Chamado TI</span>
              </button>
              <button
                onClick={() => onQuickAction('ai')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-xs text-amber-300 border border-amber-500/40 transition-all"
                title="Assistente IA Jurídico & MCP"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Agente IA</span>
              </button>
            </div>

            {/* Active User Dropdown Switcher */}
            <div className="relative flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'partner' && <Lock className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="text-[11px] text-amber-400/90 font-mono">
                  {currentUser.email}
                </div>
              </div>

              <div className="relative group">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/40 shadow-sm cursor-pointer"
                />
                
                {/* User Switcher Dropdown */}
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Identidade Conectada
                    </p>
                    <button
                      onClick={onOpenLoginModal}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Trocar Login
                    </button>
                  </div>
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-500/50" />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-slate-100 text-xs truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-amber-400 font-mono truncate">{currentUser.email}</div>
                        <div className="text-[10px] text-slate-400 truncate">{currentUser.roleTitle}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 pt-2 border-t border-slate-800 px-2 space-y-1.5 text-[10px]">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Domínio Autorizado:</span>
                      <span className="font-mono text-emerald-400 font-bold">@mota.adv.br</span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Departamento:</span>
                      <span className="text-slate-200">{currentUser.department}</span>
                    </div>
                    {isMasterAdmin && (
                      <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold text-center">
                        ★ Superadministrador TI Master
                      </div>
                    )}
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair da Conta (Logout)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
