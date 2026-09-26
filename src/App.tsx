/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  USERS, 
  INITIAL_SEARCH_INDEX, 
  INITIAL_TICKETS, 
  INITIAL_MEETINGS, 
  INITIAL_DOCUMENTS, 
  INITIAL_POPS, 
  INITIAL_PRECATARIOS, 
  INITIAL_CRM 
} from './data/initialData';
import { UserProfile, Ticket, Meeting, SearchableItem } from './types';
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
  Lock,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS[0]); // Default: Carlos Eduardo Siqueira
  const [activeTab, setActiveTab] = useState<string>('command_center');

  // Application State
  const [searchIndex, setSearchIndex] = useState<SearchableItem[]>(INITIAL_SEARCH_INDEX);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [precatorios, setPrecatorios] = useState(INITIAL_PRECATARIOS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [pops, setPops] = useState(INITIAL_POPS);
  const [crmEntities, setCrmEntities] = useState(INITIAL_CRM);

  // Global Quick Action Modals
  const [openMeetingModal, setOpenMeetingModal] = useState(false);
  const [openTicketModal, setOpenTicketModal] = useState(false);

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

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
    // Also index ticket in search index
    const searchItem: SearchableItem = {
      id: newTicket.id,
      title: `Chamado TI: ${newTicket.subject} (${newTicket.protocol})`,
      source: 'google_forms',
      category: 'chamado_ti',
      summary: newTicket.description,
      content: `${newTicket.subject} - Solicitante: ${newTicket.requesterName}. ${newTicket.description}`,
      lastUpdated: newTicket.createdAt.split(' ')[0],
      author: newTicket.requesterName,
      externalUrl: 'https://docs.google.com/forms/d/mota-ti',
      tags: ['Chamado TI', newTicket.category, newTicket.priority, newTicket.status],
    };
    setSearchIndex(prev => [searchItem, ...prev]);
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    setMeetings(prev => [newMeeting, ...prev]);
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
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={USERS}
        onSelectUser={setCurrentUser}
        onOpenSearch={() => setActiveTab('search')}
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
        
        {/* Navigation Sidebar (Vertical on Desktop, horizontal scroll on Mobile) */}
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap lg:whitespace-normal group ${
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
              <div className="text-[10px] text-slate-500">
                Sede: Edifício Athenas, Brasília
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
        </main>

      </div>

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
            <span className="text-amber-400">Google Workspace Native</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
