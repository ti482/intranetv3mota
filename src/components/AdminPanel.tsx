import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ADMIN_EMAIL } from '../services/authService';
import { 
  ShieldAlert, 
  Users, 
  Key, 
  Server, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  Activity,
  HardDrive
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUserRole: (userId: string, newRole: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, allUsers, onUpdateUserRole }) => {
  const isMasterAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isMasterAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white font-serif">
          Painel Administrativo Restrito
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Este painel é de acesso exclusivo do Gestor Geral de TI da banca (<strong className="text-amber-400">{ADMIN_EMAIL}</strong>).
          Seu usuário atual ({currentUser.email}) não possui privilégios de superadministrador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Painel de Governança &amp; Superadministrador TI
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Admin Master: {ADMIN_EMAIL}
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Gerenciamento de Usuários, Papéis &amp; MCP Servers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Controle de acessos individuais da intranet, matriz RBAC para advogados e auditoria de chamados técnicos da banca Mota &amp; Advogados.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sessão Ativa com Privilégio Total
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Usuários Ativos</span>
          <div className="text-2xl font-bold font-serif text-white">{allUsers.length}</div>
          <p className="text-[10px] text-emerald-400 font-mono">Domínio @mota.adv.br</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Superadministrador</span>
          <div className="text-sm font-bold text-amber-300 truncate">Carlos Eduardo Siqueira</div>
          <p className="text-[10px] text-slate-400 font-mono">{ADMIN_EMAIL}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Segurança de Acesso</span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Restrição por Domínio Ativa
          </div>
          <p className="text-[10px] text-slate-400">Contas externas rejeitadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Infraestrutura Google</span>
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5" />
            Cloud Run + Workspace
          </div>
          <p className="text-[10px] text-slate-400">CI/CD Developer Connect</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Usuários Cadastrados &amp; Controle de Acesso (RBAC)
          </span>
          <span className="text-slate-400 font-mono">Somente {ADMIN_EMAIL} pode alterar papéis</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">E-mail Google Corporativo</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Nível de Permissão (Role)</th>
                <th className="py-3 px-4">Privilégio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allUsers.map((u) => {
                const isSuper = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700" />
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        {u.oab && <div className="text-[10px] text-amber-400">{u.oab}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.department}
                    </td>
                    <td className="py-3 px-4">
                      {isSuper ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono text-[11px]">
                          TI Master Admin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUserRole(u.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="partner">Sócio (Acesso Financeiro &amp; STF)</option>
                          <option value="senior_attorney">Advogado Sênior (Ações Coletivas)</option>
                          <option value="trainee">Analista / Colaborador (Geral)</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isSuper ? (
                        <span className="text-[11px] text-rose-400 font-bold">Acesso Total &amp; Gestão</span>
                      ) : u.role === 'partner' ? (
                        <span className="text-[11px] text-amber-300">Módulo Financeiro + Casos</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Padrão Operacional</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
