/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Ticket, Meeting, SearchableItem, LegalDocument, POPProcedure, PrecatorioRecord, CrmEntity } from './types';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { SmartSearch } from './components/SmartSearch';
import { MeetingScheduler } from './components/MeetingScheduler';
import { ITSupportCenter } from './components/ITSupportCenter';
import { DocumentLibrary } from './components/DocumentLibrary';
import { WikiPop } from './components/WikiPop';
import { InstitutionalMural } from './components/InstitutionalMural';
import { FinancialModule } from './components/FinancialModule';
import { CrmModule } from './components/CrmModule';
import { AiAssistant } from './components/AiAssistant';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { DomainGatekeeper } from './components/DomainGatekeeper';
import { ADMIN_EMAIL, logoutUser, syncUserProfile } from './services/authService';
import { auth, onAuthStateChanged } from './services/firebase';
import { 
  seedFirestoreIfEmpty,
  subscribeTickets,
  subscribeMeetings,
  subscribeDocuments,
  subscribePops,
  subscribePrecatorios,
  subscribeCrmEntities,
  subscribeUsers,
  updateUserRole,
  createTicket,
  updateTicketStatus,
  createMeeting
} from './services/dataService';
import { 
  LayoutDashboard, 
  Search, 
  Video, 
  HelpCircle, 
  FolderGit2, 
  BookOpen, 
  ShieldAlert, 
  Coins, 
  Users, 
  Sparkles,
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('command_center');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Firestore Live State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [pops, setPops] = useState<POPProcedure[]>([]);
  const [precatorios, setPrecatorios] = useState<PrecatorioRecord[]>([]);
  const [crmEntities, setCrmEntities] = useState<CrmEntity[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Search Index derived from real Firestore documents
  const [searchIndex, setSearchIndex] = useState<SearchableItem[]>([]);

  // Modals
  const [openMeetingModal, setOpenMeetingModal] = useState(false);
  const [openTicketModal, setOpenTicketModal] = useState(false);

  // Super Admin Check
  const isMasterAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setCurrentUser(profile);
        } catch (err) {
          console.error('Domain authorization error:', err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections when authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Seed baseline data on first run if database is clean
    seedFirestoreIfEmpty();

    const unsubTickets = subscribeTickets(setTickets);
    const unsubMeetings = subscribeMeetings(setMeetings);
    const unsubDocs = subscribeDocuments(setDocuments);
    const unsubPops = subscribePops(setPops);
    const unsubPrec = subscribePrecatorios(setPrecatorios);
    const unsubCrm = subscribeCrmEntities(setCrmEntities);
    const unsubUsers = subscribeUsers(setAllUsers);

    return () => {
      unsubTickets();
      unsubMeetings();
      unsubDocs();
      unsubPops();
      unsubPrec();
      unsubCrm();
      unsubUsers();
    };
  }, [currentUser]);

  // Dynamically update Search Index from real Firestore entities
  useEffect(() => {
    const items: SearchableItem[] = [];

    // Documents
    documents.forEach(d => {
      items.push({
        id: d.id,
        title: d.title,
        source: 'google_docs',
        category: 'peca_juridica',
        tribunal: d.tribunal === 'Administrativo' ? 'Geral' : d.tribunal,
        summary: d.description,
        content: `${d.title} - ${d.folder}. ${d.fullText?.substring(0, 300) || d.description}`,
        lastUpdated: d.lastModified || '2026-09-26',
        author: 'Núcleo Jurídico',
        externalUrl: d.driveUrl || 'https://drive.google.com',
        tags: [d.tribunal, d.folder, 'Peça Jurídica', 'Drive'],
      });
    });

    // POPs
    pops.forEach(p => {
      items.push({
        id: p.id,
        title: `${p.code}: ${p.title}`,
        source: 'google_docs',
        category: 'procedimento_pop',
        tribunal: 'Geral',
        summary: `Procedimento Operacional Padrão aprovado por ${p.approvedBy} (${p.category}).`,
        content: `${p.code} - ${p.title}. Regras: ${p.criticalRules?.join(' ') || ''}`,
        lastUpdated: p.effectiveDate || '2026-09-26',
        author: p.approvedBy,
        externalUrl: 'https://docs.google.com',
        tags: ['POP', p.category, p.code, 'Normas Internas'],
      });
    });

    // Tickets
    tickets.forEach(t => {
      items.push({
        id: t.id,
        title: `Chamado TI: ${t.subject} (${t.protocol})`,
        source: 'google_forms',
        category: 'chamado_ti',
        summary: t.description,
        content: `${t.subject} - Solicitante: ${t.requesterName}. ${t.description} - Solução: ${t.solutionNotes || ''}`,
        lastUpdated: t.createdAt.split(' ')[0] || '2026-09-26',
        author: t.requesterName,
        externalUrl: 'https://docs.google.com/forms',
        tags: ['TI', t.category, t.priority, t.status],
      });
    });

    setSearchIndex(items);
  }, [documents, pops, tickets]);

  // Keyboard shortcut Ctrl+K / Cmd+K to jump to Smart Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const handleAddTicket = async (newTicket: Ticket) => {
    await createTicket({
      protocol: newTicket.protocol,
      requesterName: currentUser?.name || newTicket.requesterName,
      requesterEmail: currentUser?.email || newTicket.requesterEmail,
      category: newTicket.category,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'Novo',
      assignedTo: 'Carlos Eduardo Siqueira',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: Ticket['status'], solutionNotes?: string) => {
    if (currentUser?.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return;
    }
    await updateTicketStatus(ticketId, newStatus, solutionNotes);
  };

  const handleAddMeeting = async (newMeeting: Meeting) => {
    await createMeeting({
      title: newMeeting.title,
      type: newMeeting.type,
      date: newMeeting.date,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      tribunalOrOrg: newMeeting.tribunalOrOrg,
      meetLink: newMeeting.meetLink,
      participants: newMeeting.participants || [currentUser?.email || 'ti@mota.adv.br'],
      agenda: newMeeting.agenda,
      status: 'Agendada',
      notifiedChat: true,
    });
  };

  const navItems = [
    { id: 'command_center', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'search', label: 'Busca Inteligente (IA)', icon: Search, badge: 'IA' },
    { id: 'meetings', label: 'Google Meet & Agenda', icon: Video, badge: null },
    { id: 'it_support', label: 'Central de TI', icon: HelpCircle, badge: tickets.filter(t => t.status !== 'Resolvido').length || null },
    { id: 'documents', label: 'Hub de Peças (Drive)', icon: FolderGit2, badge: null },
    { id: 'wiki', label: 'Wiki & POPs (Docs)', icon: BookOpen, badge: null },
    { id: 'mural', label: 'Mural & Plantão', icon: ShieldAlert, badge: null },
    { id: 'finance', label: 'Financeiro', icon: Coins, badge: 'Restrito' },
    { id: 'crm', label: 'CRM Sindicatos', icon: Users, badge: null },
    { id: 'ai', label: 'Agente Jurídico IA', icon: Sparkles, badge: 'Gemini' },
    ...(isMasterAdmin ? [{ id: 'admin', label: 'Admin Geral (Você)', icon: ShieldCheck, badge: 'TI Master' }] : []),
  ];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-wider">
            Validando sessão corporativa Google Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <DomainGatekeeper
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={[currentUser]}
        onSelectUser={() => {}}
        onOpenSearch={() => setActiveTab('search')}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onQuickAction={(action) => {
          if (action === 'meeting') {
            setActiveTab('meetings');
            setOpenMeetingModal(true);
          } else if (action === 'ticket') {
            setActiveTab('it_support');
            setOpenTicketModal(true);
          } else if (action === 'search') {
            setActiveTab('search');
          } else if (action === 'ai') {
            setActiveTab('ai');
          }
        }}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible sticky top-24">
            
            <div className="hidden lg:block px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
              Portal Corporativo Mota
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap lg:whitespace-normal group cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400 transition-colors'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : item.badge === 'Restrito'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Workspace Status Widget */}
            <div className="hidden lg:block mt-4 pt-3 border-t border-slate-800 px-3 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Google Workspace</span>
                <span className="text-emerald-400">Ativo</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Domínio: @mota.adv.br
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Banco: Firestore Ativo
              </div>
            </div>

          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'command_center' && (
            <CommandCenter
              currentUser={currentUser}
              tickets={tickets}
              meetings={meetings}
              precatorios={precatorios}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewMeeting={() => {
                setActiveTab('meetings');
                setOpenMeetingModal(true);
              }}
              onOpenNewTicket={() => {
                setActiveTab('it_support');
                setOpenTicketModal(true);
              }}
            />
          )}

          {activeTab === 'search' && (
            <SmartSearch items={searchIndex} />
          )}

          {activeTab === 'meetings' && (
            <MeetingScheduler
              currentUser={currentUser}
              meetings={meetings}
              onAddMeeting={handleAddMeeting}
              isOpenModal={openMeetingModal}
              onCloseModal={() => setOpenMeetingModal(false)}
            />
          )}

          {activeTab === 'it_support' && (
            <ITSupportCenter
              currentUser={currentUser}
              tickets={tickets}
              onAddTicket={handleAddTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              isOpenModal={openTicketModal}
              onCloseModal={() => setOpenTicketModal(false)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentLibrary documents={documents} />
          )}

          {activeTab === 'wiki' && (
            <WikiPop procedures={pops} />
          )}

          {activeTab === 'mural' && (
            <InstitutionalMural />
          )}

          {activeTab === 'finance' && (
            <FinancialModule currentUser={currentUser} precatorios={precatorios} />
          )}

          {activeTab === 'crm' && (
            <CrmModule entities={crmEntities} />
          )}

          {activeTab === 'ai' && (
            <AiAssistant currentUser={currentUser} />
          )}

          {activeTab === 'admin' && isMasterAdmin && (
            <AdminPanel
              currentUser={currentUser}
              allUsers={allUsers.length > 0 ? allUsers : [currentUser]}
              onUpdateUserRole={async (userId, newRole) => {
                await updateUserRole(userId, newRole);
              }}
            />
          )}
        </main>

      </div>

      {showLoginModal && (
        <LoginModal
          onLogin={(user) => {
            setCurrentUser(user);
            setShowLoginModal(false);
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Mota &amp; Advogados Associados</span>
            <span className="text-slate-600">•</span>
            <span>OAB/DF 1413-A • Desde 2000</span>
            <span className="text-slate-600">•</span>
            <span>Edifício Athenas, Brasília/DF</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Gestor de TI: ti@mota.adv.br</span>
            <span>•</span>
            <span className="text-amber-400">Google Workspace &amp; Firebase</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
