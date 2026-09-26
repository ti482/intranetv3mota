import React from 'react';
import { 
  Building2, 
  Calendar, 
  ShieldAlert, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  Scale, 
  CheckCircle2, 
  Sparkles,
  MapPin
} from 'lucide-react';

export const InstitutionalMural: React.FC = () => {
  const courtCalendar = [
    {
      court: 'STF (Supremo Tribunal Federal)',
      sessions: 'Quartas e Quintas-feiras às 14h00 (Plenário)',
      urgentNotice: 'Prazos processuais correndo normalmente. Sustentações orais virtuais devem ser inscritas com 48h de antecedência.',
      status: 'Sessões Ordinárias Presenciais e Virtuais',
    },
    {
      court: 'STJ (Superior Tribunal de Justiça)',
      sessions: 'Terças e Quintas-feiras às 14h00 (Turmas)',
      urgentNotice: 'Julgamento dos Temas Repetitivos relativos a servidores civis federais pautados para o mês de Outubro/2026.',
      status: 'PJe em Pleno Funcionamento',
    },
    {
      court: 'TRF1 (Tribunal Regional Federal da 1ª Região)',
      sessions: 'Segundas e Quartas-feiras às 13h30',
      urgentNotice: 'Processamento do lote de Precatórios 2026/2027 com liberação de contas judiciais na Caixa e Banco do Brasil.',
      status: 'Contingência PJe Ativa',
    },
    {
      court: 'TST (Tribunal Superior do Trabalho)',
      sessions: 'Quartas-feiras às 09h00 (Subseção de Dissídios Individuais)',
      urgentNotice: 'Acompanhamento das ações sindicais de empregados de empresas públicas e sociedades de economia mista.',
      status: 'Normalidade Operacional',
    },
  ];

  const plantaoRoster = [
    {
      period: '25/09 a 01/10/2026',
      attorney: 'Dra. Beatriz Alcântara Lima (OAB/DF 28.490)',
      phone: '(61) 99876-1234',
      email: 'beatriz.lima@mota.adv.br',
      focus: 'Medidas Urgentes TRF1 / Liminares em Ações Coletivas',
      chatSpace: '#plantao-urgente-trf1',
    },
    {
      period: '02/10 a 08/10/2026',
      attorney: 'Dr. Roberto Mota (OAB/DF 14.130)',
      phone: '(61) 99988-5678',
      email: 'roberto.mota@mota.adv.br',
      focus: 'Plantão STF / STJ / Despachos com Gabinetes',
      chatSpace: '#plantao-stf-stj',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Mural Institucional &amp; Plantão Judiciário
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Comunicação Corporativa • Edifício Athenas
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Escala de Plantão &amp; Calendário dos Tribunais Superiores
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Avisos de sessões nos tribunais (STF, STJ, TRF1 e TST), recessos regimentais e canais oficiais de plantão 24h para tutelas de urgência.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Tribunais Superiores Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Sessões Plenárias &amp; Prazos Judiciais</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Brasília/DF</span>
          </div>

          <div className="space-y-3">
            {courtCalendar.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-amber-300">{item.court}</h4>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-400 font-medium">
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.sessions}</span>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                  {item.urgentNotice}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Escala de Plantão Forense & Infraestrutura */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold text-white">Escala Oficial de Plantão Forense</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold">24 Horas / Finais de Semana</span>
          </div>

          <div className="space-y-3">
            {plantaoRoster.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-mono text-amber-400 font-bold">{p.period}</span>
                  <span className="text-slate-400 text-[11px]">{p.focus}</span>
                </div>

                <div>
                  <div className="text-sm font-bold text-white">{p.attorney}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{p.email}</div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{p.phone}</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    <span>{p.chatSpace}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Physical & Digital Headquarters Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Sede Física &amp; Infraestrutura Tecnológica</span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Edifício Athenas, Setor de Autarquias Sul (SAS), Brasília/DF. CEP 70070-900.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <span>Central Telefônica PABX: <strong>(61) 3321-4500</strong></span>
                <span>•</span>
                <span>Operações TI: <strong className="text-amber-300">Carlos Eduardo Siqueira</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Google Workspace Enterprise</span>
              <span className="text-emerald-400 font-mono">100% Nativo na Nuvem</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
