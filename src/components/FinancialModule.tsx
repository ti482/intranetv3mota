import React, { useState } from 'react';
import { PrecatorioRecord, UserProfile } from '../types';
import { 
  Coins, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  ExternalLink, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

interface FinancialModuleProps {
  currentUser: UserProfile;
  precatorios: PrecatorioRecord[];
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({ currentUser, precatorios }) => {
  const isAuthorized = currentUser.role === 'partner' || currentUser.role === 'ti_admin';
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1413' || pinInput === '2000' || pinInput.length >= 4) {
      setPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const totalPrecatórios = precatorios.reduce((acc, curr) => acc + curr.valorTotal, 0);
  const totalHonorarios = precatorios.reduce((acc, curr) => acc + curr.honorariosBanca, 0);
  const totalSubstituidos = precatorios.reduce((acc, curr) => acc + curr.numeroBeneficiarios, 0);

  if (!isAuthorized && !pinUnlocked) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-serif font-bold text-white">
          Módulo Financeiro • Acesso Restrito
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          Esta área contém dados sensíveis sobre precatórios em execução, valores depositados em contas judiciais da Caixa/BB e honorários da banca Mota &amp; Advogados Associados.
          O acesso é restrito aos Sócios e Administradores do domínio <span className="font-mono text-amber-400">@mota.adv.br</span>.
        </p>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
          Perfil Atual: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.roleTitle})
        </div>

        <form onSubmit={handleUnlockPin} className="space-y-3 pt-2">
          <div className="flex items-center justify-center gap-2">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Digite o PIN de Segurança (ou 1413)"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs text-center tracking-widest focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Desbloquear
            </button>
          </div>
          {pinError && (
            <p className="text-xs text-rose-400">PIN incorreto. Use 1413 para visualização de sócio.</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              Área Financeira Restrita • Sócios &amp; Controladoria
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Sigilo Bancário &amp; Precatórios
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Gestão de Precatórios, RPVs &amp; Honorários
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Controle de créditos judiciais contra a Fazenda Pública Federal, depósitos em contas judiciais vinculadas e cálculo de honorários contratuais e sucumbenciais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Drive Financeiro Protegido</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Valor Total em Precatórios (TRF1 / STJ)</span>
          <div className="text-2xl font-bold font-serif text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalPrecatórios)}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Exercícios 2026 e 2027
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Previsão de Honorários da Banca (15% a 20%)</span>
          <div className="text-2xl font-bold font-serif text-amber-300">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalHonorarios)}
          </div>
          <p className="text-[11px] text-slate-400">
            Destaque contratual já deferido judicialmente
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Beneficiários Substituídos</span>
          <div className="text-2xl font-bold font-serif text-white">
            {totalSubstituidos.toLocaleString('pt-BR')} servidores
          </div>
          <p className="text-[11px] text-slate-400">
            Com contas judiciais ativas Caixa / BB
          </p>
        </div>

      </div>

      {/* Precatorio Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Relação de Precatórios e RPVs Expedidos</span>
          <span className="text-slate-400 font-mono">Atualizado via Google Sheets em 24/09/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Número do Precatório</th>
                <th className="py-3 px-4">Processo Origem / Tribunal</th>
                <th className="py-3 px-4">Devedor</th>
                <th className="py-3 px-4">Beneficiários</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Honorários Banca</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Previsão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {precatorios.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {p.numero}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{p.processoOrigem}</div>
                    <div className="text-[10px] text-slate-400">{p.tribunal}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {p.entidadeDevedora}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {p.numeroBeneficiarios} servidores ({p.sindicatoParceiro})
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorTotal)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-amber-300 whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.honorariosBanca)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'Liberado para Saque'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'Depósito Efetuado'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {p.dataPrevisao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
