import React, { useState } from 'react';
import { Meeting, UserProfile } from '../types';
import { 
  Calendar as CalendarIcon, 
  Video, 
  Clock, 
  Users, 
  Plus, 
  Check, 
  Send, 
  Building2, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  X,
  Scale
} from 'lucide-react';

interface MeetingSchedulerProps {
  currentUser: UserProfile;
  meetings: Meeting[];
  onAddMeeting: (meeting: Meeting) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  currentUser,
  meetings,
  onAddMeeting,
  isOpenModal,
  onCloseModal,
}) => {
  const [showForm, setShowForm] = useState(isOpenModal || false);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Meeting['type']>('Audiência Virtual');
  const [date, setDate] = useState('2026-10-02');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [tribunalOrOrg, setTribunalOrOrg] = useState('STF - Gabinete da Presidência');
  const [agenda, setAgenda] = useState('');
  const [participantsText, setParticipantsText] = useState(`${currentUser.email}, beatriz.lima@mota.adv.br`);
  const [notifyChat, setNotifyChat] = useState(true);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Generate real-style Google Meet link
    const randomSlug = Math.random().toString(36).substring(2, 5) + '-' + 
                       Math.random().toString(36).substring(2, 6) + '-' + 
                       Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${randomSlug}`;

    const participants = participantsText
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title,
      type,
      date,
      startTime,
      endTime,
      tribunalOrOrg: tribunalOrOrg || undefined,
      meetLink,
      participants,
      agenda,
      status: 'Agendada',
      notifiedChat: notifyChat,
    };

    onAddMeeting(newMeeting);
    setScheduledSuccess(true);

    setTimeout(() => {
      setScheduledSuccess(false);
      setShowForm(false);
      if (onCloseModal) onCloseModal();
      // Reset
      setTitle('');
      setAgenda('');
    }, 1500);
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredMeetings = meetings.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Google Meet &amp; Calendar Nativo
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Salas de Audiência e Reuniões Virtuais
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Agendamento de Reuniões &amp; Audiências Virtuais
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Gere links automáticos do Google Meet, integre à Google Agenda da banca Mota &amp; Advogados e notifique os participantes por e-mail e espaços do Google Chat.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all self-start md:self-center"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Fechar Formulário' : 'Novo Agendamento Meet'}</span>
        </button>
      </div>

      {/* Booking Form (Dropdown or Modal) */}
      {showForm && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          {scheduledSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Compromisso Agendado com Sucesso!</h3>
              <p className="text-xs text-slate-300">
                Link do Google Meet gerado e notificação enviada aos participantes e ao Google Chat da firma.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Formulário Integrado do Google Workspace
                </h3>
                <span className="text-xs text-slate-400">
                  Responsável: <strong className="text-slate-200">{currentUser.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Assunto / Título do Compromisso *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Audiência de Conciliação Virtual - TRF1 ou Despacho com Ministro Relator STJ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tipo de Compromisso *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Meeting['type'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  >
                    <option value="Audiência Virtual">Audiência Virtual</option>
                    <option value="Despacho com Ministro/Desembargador">Despacho com Ministro/Desembargador</option>
                    <option value="Assembleia com Sindicato">Assembleia com Sindicato</option>
                    <option value="Reunião de Alinhamento Interno">Reunião de Alinhamento Interno</option>
                    <option value="Atendimento a Cliente">Atendimento a Cliente</option>
                  </select>
                </div>

                {/* Tribunal or Entity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tribunal / Gabinete / Entidade
                  </label>
                  <input
                    type="text"
                    value={tribunalOrOrg}
                    onChange={(e) => setTribunalOrOrg(e.target.value)}
                    placeholder="Ex: STF - 2ª Turma ou Sede CONDSEF"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Início *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Término *</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    E-mails dos Participantes (separados por vírgula) *
                  </label>
                  <input
                    type="text"
                    required
                    value={participantsText}
                    onChange={(e) => setParticipantsText(e.target.value)}
                    placeholder="beatriz.lima@mota.adv.br, ti@mota.adv.br, cliente@exemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>

                {/* Agenda */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Pauta da Reunião / Documentos Necessários
                  </label>
                  <textarea
                    rows={3}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Descreva os pontos a tratar, memoriais a apresentar ou certidões exigidas..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>

              </div>

              {/* Notification Toggles */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={notifyChat}
                    onChange={(e) => setNotifyChat(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Disparar alerta automático no canal Google Chat #audiencias-prazos
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar &amp; Gerar Meet</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filterType === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Todas as Reuniões ({meetings.length})
        </button>
        <button
          onClick={() => setFilterType('Audiência Virtual')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filterType === 'Audiência Virtual' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Audiências Virtuais
        </button>
        <button
          onClick={() => setFilterType('Despacho com Ministro/Desembargador')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filterType === 'Despacho com Ministro/Desembargador' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Despachos STF / STJ
        </button>
        <button
          onClick={() => setFilterType('Assembleia com Sindicato')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filterType === 'Assembleia com Sindicato' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Assembleias Coletivas
        </button>
      </div>

      {/* Schedule Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.map((m) => (
          <div
            key={m.id}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 shadow-lg flex flex-col justify-between gap-3 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {m.type}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {m.date}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">
                {m.title}
              </h4>

              {m.tribunalOrOrg && (
                <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>{m.tribunalOrOrg}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                {m.agenda}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-cyan-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{m.startTime} às {m.endTime} (Horário de Brasília)</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{m.participants.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Meet Link & Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(m.meetLink)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  title="Copiar Link do Google Meet"
                >
                  {copiedLink === m.meetLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLink === m.meetLink ? 'Copiado' : 'Copiar Link'}</span>
                </button>

                {m.notifiedChat && (
                  <span className="text-[11px] text-emerald-400/90 flex items-center gap-1" title="Notificação disparada no Google Chat">
                    <MessageSquare className="w-3 h-3" />
                    Chat Sincronizado
                  </span>
                )}
              </div>

              <a
                href={m.meetLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Entrar no Google Meet</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
