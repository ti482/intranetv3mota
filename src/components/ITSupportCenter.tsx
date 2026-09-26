import React, { useState } from 'react';
import { Ticket, UserProfile } from '../types';
import { 
  HelpCircle, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Laptop, 
  Key, 
  Mail, 
  Wifi, 
  Calculator, 
  BookOpen, 
  MessageSquare, 
  Search,
  ExternalLink,
  Table,
  Check
} from 'lucide-react';

interface ITSupportCenterProps {
  currentUser: UserProfile;
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus?: (ticketId: string, newStatus: Ticket['status'], solutionNotes?: string) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const ITSupportCenter: React.FC<ITSupportCenterProps> = ({
  currentUser,
  tickets,
  onAddTicket,
  onUpdateTicketStatus,
  isOpenModal,
  onCloseModal,
}) => {
  const isMasterAdmin = currentUser.email.toLowerCase() === 'ti@mota.adv.br';
  const [activeTab, setActiveTab] = useState<'tickets' | 'new_ticket' | 'wiki'>(isOpenModal ? 'new_ticket' : 'tickets');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'mine'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState<Ticket['status']>('Novo');
  const [solutionInput, setSolutionInput] = useState<string>('');

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('PJe/e-SAJ');
  const [priority, setPriority] = useState<Ticket['priority']>('Alta');
  const [description, setDescription] = useState('');
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const protocolNum = String(tickets.length + 92).padStart(3, '0');
    const protocol = `MOTA-TI-2026-${protocolNum}`;

    const newTicket: Ticket = {
      id: `tk-${Date.now()}`,
      protocol,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      category,
      subject,
      description,
      priority,
      status: 'Novo',
      createdAt: '2026-09-25 10:15',
      updatedAt: '2026-09-25 10:15',
      assignedTo: 'Carlos Eduardo Siqueira',
    };

    onAddTicket(newTicket);
    setSubmittedProtocol(protocol);

    setTimeout(() => {
      setSubmittedProtocol(null);
      setActiveTab('tickets');
      setSubject('');
      setDescription('');
      if (onCloseModal) onCloseModal();
    }, 1800);
  };

  const getCategoryIcon = (cat: Ticket['category']) => {
    switch (cat) {
      case 'Certificado Digital':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'PJe/e-SAJ':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'PJe-Calc':
        return <Calculator className="w-4 h-4 text-purple-400" />;
      case 'Hardware':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'E-mail/Workspace':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'VPN/Rede':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (userFilter === 'mine' && t.requesterEmail.toLowerCase() !== currentUser.email.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Central de TI &amp; Suporte Técnico
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Gestão: Carlos Eduardo Siqueira (ti@mota.adv.br)
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Help Desk &amp; Suporte Jurídico-Tecnológico
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Abra chamados para suporte em Certificados Digitais A1, assinadores PJeOffice, sistemas PJe/e-SAJ/PJe-Calc, e-mails corporativos e infraestrutura do Edifício Athenas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setActiveTab('new_ticket')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Chamado Google Forms</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
            activeTab === 'tickets'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table className="w-4 h-4 text-emerald-400" />
          <span>Controle de Chamados (Google Sheets)</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] text-slate-300">
            {tickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('new_ticket')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
            activeTab === 'new_ticket'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4 text-rose-400" />
          <span>Abertura de Chamado (Google Forms)</span>
        </button>

        <button
          onClick={() => setActiveTab('wiki')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
            activeTab === 'wiki'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Base de Conhecimento TI &amp; Tutoriais</span>
        </button>
      </div>

      {/* TAB 1: TICKETS SHEET VIEW */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          
          {/* Status & Scope Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* User Scope: Todos vs Meus Chamados */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    userFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({tickets.length})
                </button>
                <button
                  onClick={() => setUserFilter('mine')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    userFilter === 'mine'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Meus Chamados</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-850 text-amber-300 font-mono">
                    {tickets.filter(t => t.requesterEmail.toLowerCase() === currentUser.email.toLowerCase()).length}
                  </span>
                </button>
              </div>

              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

              <span className="text-slate-400 font-medium">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg ${
                  statusFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('Novo')}
                className={`px-2.5 py-1 rounded-lg ${
                  statusFilter === 'Novo' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                Novos
              </button>
              <button
                onClick={() => setStatusFilter('Em Análise')}
                className={`px-2.5 py-1 rounded-lg ${
                  statusFilter === 'Em Análise' ? 'bg-blue-500 text-white font-bold' : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                Em Análise
              </button>
              <button
                onClick={() => setStatusFilter('Resolvido')}
                className={`px-2.5 py-1 rounded-lg ${
                  statusFilter === 'Resolvido' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                Resolvidos
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sincronizado com Google Sheets TI
              </span>
            </div>
          </div>

          {/* Table / Card List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Protocolo</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Assunto / Descrição</th>
                    <th className="py-3 px-4">Solicitante</th>
                    <th className="py-3 px-4">Prioridade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Abertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {t.protocol}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {getCategoryIcon(t.category)}
                          <span>{t.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        <div className="font-semibold text-white truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">{t.description}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{t.requesterName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{t.requesterEmail}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Urgente'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : t.priority === 'Alta'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Resolvido'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : t.status === 'Em Análise'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {t.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: NEW TICKET FORM (GOOGLE FORMS NATIVE STYLE) */}
      {activeTab === 'new_ticket' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto">
          {submittedProtocol ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Chamado Registrado na Central!</h3>
              <p className="text-sm font-mono text-amber-400">Protocolo: {submittedProtocol}</p>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                O chamado foi gravado na planilha de triagem e uma notificação imediata foi enviada ao canal de TI no Google Chat.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-rose-400 font-semibold uppercase tracking-wider">
                  Google Forms • Central de Suporte Mota &amp; Advogados
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Abertura de Chamado Técnico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preencha os dados do incidente para receber suporte ágil da equipe de infraestrutura.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Requester info card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Solicitante: </span>
                    <strong className="text-slate-200">{currentUser.name}</strong>
                  </div>
                  <div className="font-mono text-amber-400">
                    {currentUser.email}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Título / Resumo do Problema *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: PJeOffice falha ao assinar agravo no PJe TRF1 ou Erro de conexão VPN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Categoria do Chamado *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Ticket['category'])}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                    >
                      <option value="PJe/e-SAJ">PJe / e-SAJ / Tribunais</option>
                      <option value="Certificado Digital">Certificado Digital A1 ICP-Brasil</option>
                      <option value="PJe-Calc">PJe-Calc / Cálculos Judiciais</option>
                      <option value="Hardware">Hardware / Impressoras / Estação</option>
                      <option value="E-mail/Workspace">Google Workspace / E-mail @mota.adv.br</option>
                      <option value="VPN/Rede">VPN Corporativa / Conexão DF</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nível de Prioridade *
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                    >
                      <option value="Baixa">Baixa (Dúvidas gerais / Configurações)</option>
                      <option value="Média">Média (Impacto parcial de rotina)</option>
                      <option value="Alta">Alta (Impedimento de trabalho)</option>
                      <option value="Urgente">Urgente (Prazo fatal judicial hoje antes das 23h59)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Detalhamento do Incidente &amp; Mensagens de Erro *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o passo a passo que levou ao erro, o sistema afetado (STF, STJ, TRF1, PJeOffice) e prints se houver..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                  />
                </div>

              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-cyan-400" />
                  Notificação no Google Chat Space #suporte-ti ativada
                </span>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Chamado</span>
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* TAB 3: WIKI TI & KNOWLEDGE BASE */}
      {activeTab === 'wiki' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Guide 1: Certificado Digital A1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Key className="w-4 h-4" />
              <span>Validação e Instalação de Certificado Digital A1 ICP-Brasil</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O Certificado Digital A1 é um arquivo com extensão .PFX instalado diretamente no sistema operacional e integrado ao navegador Chrome.
            </p>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>Dê dois cliques no arquivo <code className="text-amber-300">.pfx</code> fornecido pela TI.</li>
              <li>Selecione &apos;Usuário Atual&apos; e clique em Avançar.</li>
              <li>Insira a senha fornecida pelo gestor de TI em cofre seguro.</li>
              <li>Marque a opção &apos;Marcar esta chave como exportável&apos;.</li>
              <li>Abra o PJeOffice Pro e confirme que o certificado é listado.</li>
            </ol>
          </div>

          {/* Guide 2: PJeOffice Troubleshooting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Falha de Assinatura no PJeOffice (Erro de Handshake / Porta 8800)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quando o tribunal judicial acusa &apos;Assinador Não Encontrado&apos;, a porta de loopback local 8800 está bloqueada ou o serviço está pausado.
            </p>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>Verifique se o ícone do PJeOffice está ativo na bandeja do Windows/Mac.</li>
              <li>Clique com botão direito no ícone e selecione &apos;Reiniciar Aplicação&apos;.</li>
              <li>No Chrome, acesse <code className="text-rose-300">https://localhost:8800</code> e aceite o certificado de segurança se solicitado.</li>
              <li>Limpe o cache SSL do navegador e recarregue a aba do tribunal.</li>
            </ol>
          </div>

          {/* Guide 3: E-mail Corporativo Google Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>Configuração do E-mail @mota.adv.br em Celulares e Tablets</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Como o escritório utiliza Google Workspace Enterprise nativo, configure a conta diretamente no aplicativo oficial do Gmail ou Google Calendar.
            </p>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>Instale o aplicativo oficial do Gmail na App Store ou Google Play.</li>
              <li>Selecione &apos;Adicionar Conta&apos; &gt; &apos;Google&apos;.</li>
              <li>Insira seu endereço completo <code className="text-emerald-300">nome@mota.adv.br</code>.</li>
              <li>Realize a autenticação de 2 fatores (2FA) configurada pela TI.</li>
            </ol>
          </div>

          {/* Guide 4: PJe-Calc */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Calculator className="w-4 h-4" />
              <span>Atualização das Tabelas de Correção no PJe-Calc</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              As tabelas de índices monetários (IPCA-E, Selic, TR) devem ser mantidas atualizadas mensalmente para evitar erros de cálculo em liquidações contra a União.
            </p>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>Baixe o arquivo de tabelas atualizado disponibilizado no Drive da banca.</li>
              <li>Acesse o menu &apos;Tabelas&apos; &gt; &apos;Importar Tabelas do TRF/TST&apos;.</li>
              <li>Selecione o arquivo e confirme a sobreposição de índices.</li>
            </ol>
          </div>

        </div>
      )}

      {/* Ticket Details & Status Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400">{selectedTicket.protocol}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
                  {selectedTicket.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedTicket.status === 'Resolvido'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedTicket.status === 'Em Análise'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {selectedTicket.subject}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Solicitante: <strong className="text-slate-200">{selectedTicket.requesterName}</strong> ({selectedTicket.requesterEmail})</span>
                <span>•</span>
                <span>Prioridade: <strong className="text-amber-400">{selectedTicket.priority}</strong></span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Relato do Chamado:</span>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {selectedTicket.description}
              </div>
            </div>

            {/* Apenas TI (ti@mota.adv.br) pode alterar status e adicionar notas de resolução */}
            {isMasterAdmin ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Controle de Atendimento (Exclusivo ti@mota.adv.br)
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Permissão de Superadmin</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Atualizar Status de Atendimento:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Novo', 'Em Análise', 'Resolvido'] as Ticket['status'][]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setEditStatus(st);
                          if (onUpdateTicketStatus && selectedTicket) {
                            onUpdateTicketStatus(selectedTicket.id, st, solutionInput || selectedTicket.solutionNotes);
                            setSelectedTicket(prev => prev ? { ...prev, status: st } : null);
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          selectedTicket.status === st
                            ? st === 'Resolvido'
                              ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                              : st === 'Em Análise'
                              ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-400'
                              : 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Parecer Técnico / Solução TI:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={solutionInput || selectedTicket.solutionNotes || ''}
                      onChange={(e) => setSolutionInput(e.target.value)}
                      placeholder="Ex: PJeOffice reiniciado na porta 8800. Certificado A1 renovado."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateTicketStatus && selectedTicket) {
                          onUpdateTicketStatus(selectedTicket.id, selectedTicket.status, solutionInput);
                          setSelectedTicket(prev => prev ? { ...prev, solutionNotes: solutionInput } : null);
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Visualização para outros usuários (somente leitura do andamento) */
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-slate-400">Andamento do Atendimento:</div>
                  <div className="text-xs text-slate-300">
                    {selectedTicket.status === 'Resolvido' ? (
                      <span className="text-emerald-400 font-semibold">✓ Chamado atendido e finalizado pelo Gestor de TI.</span>
                    ) : selectedTicket.status === 'Em Análise' ? (
                      <span className="text-blue-400 font-semibold">⏳ Chamado em triagem técnica por Carlos Eduardo (TI).</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">⏱ Chamado registrado na fila de atendimento da TI.</span>
                    )}
                  </div>
                </div>

                {selectedTicket.solutionNotes && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-emerald-400">Parecer Técnico da TI:</div>
                    <div className="text-emerald-200">{selectedTicket.solutionNotes}</div>
                  </div>
                )}
                
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Gerenciamento de status restrito:</span>
                  <span className="font-mono text-amber-400">ti@mota.adv.br</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Responsável Técnico: <strong className="text-slate-200">{selectedTicket.assignedTo || 'Carlos Eduardo Siqueira'}</strong></span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
