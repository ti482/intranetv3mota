import React from 'react';
import { Ticket, Meeting, PrecatorioRecord, UserProfile } from '../types';
import { 
  Scale, 
  Users, 
  Coins, 
  HelpCircle, 
  Calendar, 
  Video, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  FileText, 
  Sparkles, 
  Search,
  ExternalLink
} from 'lucide-react';

interface CommandCenterProps {
  currentUser: UserProfile;
  tickets: Ticket[];
  meetings: Meeting[];
  precatorios: PrecatorioRecord[];
  onNavigate: (tab: string) => void;
  onOpenNewMeeting: () => void;
  onOpenNewTicket: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentUser,
  tickets,
  meetings,
  precatorios,
  onNavigate,
  onOpenNewMeeting,
  onOpenNewTicket,
}) => {
  // Compute operational statistics
  const totalSubstituidos = 58750;
  const totalPrecatóriosValor = precatorios.reduce((acc, curr) => acc + curr.valorTotal, 0);
  const openTickets = tickets.filter(t => t.status !== 'Resolvido').length;
  const upcomingMeetings = meetings.filter(m => m.status === 'Agendada');

  return (
    <div className="space-y-6">
      
      {/* Welcome & Firm Announcement Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Command Center Operacional
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Brasília/DF • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Olá, {currentUser.name}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bem-vindo ao portal corporativo da banca <strong className="text-amber-300">Mota &amp; Advogados Associados (OAB/DF 1413-A)</strong>, 
              100% nativo no ecossistema Google Workspace. Acompanhe os julgamentos nos Tribunais Superiores, 
              as execuções coletivas e a operação técnica do escritório.
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('search')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Busca Inteligente (IA)</span>
              </button>

              <button
                onClick={onOpenNewMeeting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Agendar Google Meet</span>
              </button>

              <button
                onClick={onOpenNewTicket}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Central de TI</span>
              </button>
            </div>
          </div>

          {/* Urgent Judicial Notice Card */}
          <div className="lg:w-80 bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 shadow-xl space-y-2.5 flex-shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Aviso STF &amp; STJ
              </span>
              <span className="text-[10px] text-slate-500 font-mono">DJe 25/09</span>
            </div>
            <p className="text-xs text-slate-200 leading-snug">
              Pauta da 2ª Turma do STF confirmada para a próxima terça-feira (RE 1.234.567 - Tema 1.100).
              Memoriais finais protocolados e validados no Google Drive da banca.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Plantão STF/STJ:</span>
              <strong className="text-slate-200">Dr. Roberto Mota</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ações Coletivas */}
        <div 
          onClick={() => onNavigate('crm')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ações Coletivas Ativas</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif text-white">66</div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">+4</span> novas ações em 2026 (STF / TRF1)
            </p>
          </div>
        </div>

        {/* Card 2: Servidores Substituídos */}
        <div 
          onClick={() => onNavigate('crm')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Servidores Substituídos</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif text-white">{totalSubstituidos.toLocaleString('pt-BR')}</div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              Distribuídos em <span className="text-blue-300 font-semibold">34 sindicatos e associações</span>
            </p>
          </div>
        </div>

        {/* Card 3: Precatórios em Execução */}
        <div 
          onClick={() => onNavigate('finance')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Precatórios em Execução</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-serif text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalPrecatóriosValor)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              Lotes 2026/2027 • TRF1 e STJ
            </p>
          </div>
        </div>

        {/* Card 4: Central de TI */}
        <div 
          onClick={() => onNavigate('it_support')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-xl p-5 shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Chamados TI Abertos</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif text-white">{openTickets}</div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              SLA médio de <span className="text-rose-300 font-semibold">&lt; 45 minutos</span> (PJe / Certificados)
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Meetings/Hearings & IT Support Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Meetings & Court Hearings with Google Meet (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Audiências, Despachos &amp; Reuniões no Google Meet
              </h3>
            </div>
            <button
              onClick={() => onNavigate('meetings')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Ver Google Agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {m.type}
                    </span>
                    {m.tribunalOrOrg && (
                      <span className="text-xs text-slate-400 font-medium">
                        • {m.tribunalOrOrg}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-semibold text-white">
                    {m.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-1">
                    {m.agenda}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {m.date} às {m.startTime} - {m.endTime}
                    </span>
                    <span>{m.participants.length} participante(s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <a
                    href={m.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Acessar Meet</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts to Modules */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Módulos da Intranet Corporativa (Google Workspace Native)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('documents')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-left transition-all hover:border-amber-500/30 group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">Hub de Peças</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Minutas no Google Drive</div>
              </button>

              <button
                onClick={() => onNavigate('wiki')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-left transition-all hover:border-blue-500/30 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300">Wiki &amp; POPs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Procedimentos no Docs</div>
              </button>

              <button
                onClick={() => onNavigate('mural')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-left transition-all hover:border-purple-500/30 group"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">Plantão Forense</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Escala STF / STJ / TRF1</div>
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-left transition-all hover:border-emerald-500/30 group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">Financeiro</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Precatórios &amp; Honorários</div>
              </button>

              <button
                onClick={() => onNavigate('crm')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-left transition-all hover:border-cyan-500/30 group"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">CRM Sindicatos</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Entidades &amp; Servidores</div>
              </button>

              <button
                onClick={() => onNavigate('ai')}
                className="bg-gradient-to-br from-slate-900 to-amber-950/40 hover:from-slate-850 hover:to-amber-950/60 border border-amber-500/30 p-3.5 rounded-xl text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 w-fit mb-2 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-amber-300">Agente IA &amp; MCP</div>
                <div className="text-[11px] text-amber-200/70 mt-0.5">Gemini 3.1 Pro &amp; Hub</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: IT Support Status & Active Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold text-white">Central de TI &amp; Suporte</h3>
            </div>
            <button
              onClick={() => onNavigate('it_support')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Responsável TI:</span>
              <span className="text-slate-200 font-semibold">Carlos Eduardo Siqueira</span>
            </div>

            <div className="space-y-2.5">
              {tickets.slice(0, 3).map((t) => (
                <div 
                  key={t.id}
                  onClick={() => onNavigate('it_support')}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 font-medium">{t.protocol}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Resolvido'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.priority === 'Urgente'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {t.subject}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{t.category}</span>
                    <span>{t.createdAt.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={onOpenNewTicket}
                className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Abrir Novo Chamado na Central</span>
              </button>
            </div>
          </div>

          {/* Quick IT Knowledge Base Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Base de Conhecimento A1 ICP-Brasil</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Guia rápido para instalação de certificados digitais em computadores Windows e Mac com suporte ao PJeOffice Pro.
            </p>
            <button
              onClick={() => onNavigate('wiki')}
              className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 pt-1"
            >
              <span>Acessar POP-TI-02</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
