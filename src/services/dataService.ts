import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { 
  UserProfile,
  Ticket, 
  Meeting, 
  LegalDocument, 
  POPProcedure, 
  PrecatorioRecord, 
  CrmEntity,
  SearchableItem 
} from '../types';
import { 
  INITIAL_TICKETS, 
  INITIAL_MEETINGS, 
  INITIAL_DOCUMENTS, 
  INITIAL_POPS, 
  INITIAL_PRECATARIOS, 
  INITIAL_CRM 
} from '../data/initialData';

export interface AnnouncementItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  priority: 'Alta' | 'Média' | 'Informativa';
  author: string;
  authorEmail: string;
  date: string;
  link?: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Escala de Plantão Forense: Recesso Judiciário STF/STJ 2026/2027',
    category: 'Plantão Forense',
    summary: 'Portaria conjunta define suspensão de prazos e escala presencial no Edifício Athenas.',
    content: 'Durante o período de 20 de dezembro a 20 de janeiro, os prazos processuais estarão suspensos. A banca manterá atendimento presencial e virtual 24h para tutelas de urgência, liminares e sustação de leilões. Contato urgente via canal #plantao no Google Chat.',
    priority: 'Alta',
    author: 'Carlos Eduardo Siqueira',
    authorEmail: 'ti@mota.adv.br',
    date: '2026-09-26',
    link: 'https://sites.google.com/mota.adv.br/intranet/plantao',
  },
  {
    id: 'ann-2',
    title: 'Migração de Segurança: Autenticação Google Workspace e Tokens A1',
    category: 'Segurança TI',
    summary: 'Novas diretrizes para acesso à nuvem corporativa e renovação de certificados.',
    content: 'Todos os colaboradores devem manter o segundo fator de autenticação (2FA) ativo em suas contas @mota.adv.br. Em caso de dúvidas na configuração do PJeOffice ou assinatura digital em lote, abrir chamado diretamente pela Central de TI da Intranet.',
    priority: 'Média',
    author: 'Gestão de Tecnologia',
    authorEmail: 'ti@mota.adv.br',
    date: '2026-09-25',
  },
  {
    id: 'ann-3',
    title: 'Tema 1.100 STF: Vitória Histórica em Ação Coletiva de Servidores Federais',
    category: 'Jurídico',
    summary: 'Acórdão publicado reconhece paridade de gratificações a mais de 3.500 substituídos.',
    content: 'O Supremo Tribunal Federal concluiu o julgamento de mérito com tese favorável à tese capitaneada pelo Dr. Roberto Mota. O setor de cálculos iniciará a elaboração das planilhas de liquidação no PJe-Calc para cumprimento de sentença.',
    priority: 'Informativa',
    author: 'Dr. Roberto Mota',
    authorEmail: 'roberto.mota@mota.adv.br',
    date: '2026-09-24',
  }
];

/**
 * Initializes Firestore collections with baseline data on first run if empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // Check if tickets collection has items
    const ticketsSnap = await getDocs(collection(db, 'tickets'));
    if (ticketsSnap.empty) {
      console.log('Seeding baseline tickets into Firestore...');
      for (const t of INITIAL_TICKETS) {
        await setDoc(doc(db, 'tickets', t.id), t);
      }
    }

    // Check meetings
    const meetingsSnap = await getDocs(collection(db, 'meetings'));
    if (meetingsSnap.empty) {
      console.log('Seeding baseline meetings into Firestore...');
      for (const m of INITIAL_MEETINGS) {
        await setDoc(doc(db, 'meetings', m.id), m);
      }
    }

    // Check documents
    const docsSnap = await getDocs(collection(db, 'documents'));
    if (docsSnap.empty) {
      console.log('Seeding baseline documents into Firestore...');
      for (const d of INITIAL_DOCUMENTS) {
        await setDoc(doc(db, 'documents', d.id), d);
      }
    }

    // Check pops
    const popsSnap = await getDocs(collection(db, 'pops'));
    if (popsSnap.empty) {
      console.log('Seeding baseline POPs into Firestore...');
      for (const p of INITIAL_POPS) {
        await setDoc(doc(db, 'pops', p.id), p);
      }
    }

    // Check announcements
    const annSnap = await getDocs(collection(db, 'announcements'));
    if (annSnap.empty) {
      console.log('Seeding baseline announcements into Firestore...');
      for (const a of INITIAL_ANNOUNCEMENTS) {
        await setDoc(doc(db, 'announcements', a.id), a);
      }
    }

    // Check precatorios
    const precSnap = await getDocs(collection(db, 'precatorios'));
    if (precSnap.empty) {
      console.log('Seeding baseline precatorios into Firestore...');
      for (const pr of INITIAL_PRECATARIOS) {
        await setDoc(doc(db, 'precatorios', pr.id), pr);
      }
    }

    // Check CRM
    const crmSnap = await getDocs(collection(db, 'crm_entities'));
    if (crmSnap.empty) {
      console.log('Seeding baseline CRM entities into Firestore...');
      for (const c of INITIAL_CRM) {
        await setDoc(doc(db, 'crm_entities', c.id), c);
      }
    }
  } catch (err) {
    console.warn('Note on database initial seeding:', err);
  }
}

// -------------------------------------------------------------
// Real-time Firestore Subscriptions
// -------------------------------------------------------------

export function subscribeTickets(onData: (tickets: Ticket[]) => void): () => void {
  const q = collection(db, 'tickets');
  return onSnapshot(q, (snapshot) => {
    const items: Ticket[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Ticket);
    });
    // Sort newest first
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'tickets');
  });
}

export function subscribeMeetings(onData: (meetings: Meeting[]) => void): () => void {
  const q = collection(db, 'meetings');
  return onSnapshot(q, (snapshot) => {
    const items: Meeting[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Meeting);
    });
    items.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'meetings');
  });
}

export function subscribeDocuments(onData: (docs: LegalDocument[]) => void): () => void {
  const q = collection(db, 'documents');
  return onSnapshot(q, (snapshot) => {
    const items: LegalDocument[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as LegalDocument);
    });
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'documents');
  });
}

export function subscribePops(onData: (pops: POPProcedure[]) => void): () => void {
  const q = collection(db, 'pops');
  return onSnapshot(q, (snapshot) => {
    const items: POPProcedure[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as POPProcedure);
    });
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'pops');
  });
}

export function subscribeAnnouncements(onData: (items: AnnouncementItem[]) => void): () => void {
  const q = collection(db, 'announcements');
  return onSnapshot(q, (snapshot) => {
    const items: AnnouncementItem[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as AnnouncementItem);
    });
    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'announcements');
  });
}

export function subscribePrecatorios(onData: (records: PrecatorioRecord[]) => void): () => void {
  const q = collection(db, 'precatorios');
  return onSnapshot(q, (snapshot) => {
    const items: PrecatorioRecord[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as PrecatorioRecord);
    });
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'precatorios');
  });
}

export function subscribeCrmEntities(onData: (entities: CrmEntity[]) => void): () => void {
  const q = collection(db, 'crm_entities');
  return onSnapshot(q, (snapshot) => {
    const items: CrmEntity[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as CrmEntity);
    });
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'crm_entities');
  });
}

// -------------------------------------------------------------
// Real CRUD Operations on Firestore
// -------------------------------------------------------------

function cleanObject<T extends Record<string, any>>(obj: T): any {
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
  const id = `tk-${Date.now()}`;
  const fullTicket: Ticket = { ...ticket, id };
  try {
    await setDoc(doc(db, 'tickets', id), cleanObject(fullTicket));
    return fullTicket;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `tickets/${id}`);
  }
}

export async function updateTicketStatus(
  ticketId: string, 
  status: Ticket['status'], 
  solutionNotes?: string
): Promise<void> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updatePayload: any = { status, updatedAt: now };
  if (solutionNotes !== undefined && solutionNotes !== null) {
    updatePayload.solutionNotes = solutionNotes;
  }
  try {
    await updateDoc(doc(db, 'tickets', ticketId), cleanObject(updatePayload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tickets/${ticketId}`);
  }
}

export async function createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
  const id = `meet-${Date.now()}`;
  const fullMeeting: Meeting = { ...meeting, id };
  try {
    await setDoc(doc(db, 'meetings', id), cleanObject(fullMeeting));
    return fullMeeting;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `meetings/${id}`);
  }
}

export function subscribeUsers(onData: (users: UserProfile[]) => void): () => void {
  const q = collection(db, 'users');
  return onSnapshot(q, (snapshot) => {
    const items: UserProfile[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
    });
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'users');
  });
}

export async function updateUserRole(userId: string, newRole: string): Promise<void> {
  let roleTitle = 'Analista Jurídico / Colaborador';
  if (newRole === 'partner') roleTitle = 'Sócio da Banca';
  if (newRole === 'senior_attorney') roleTitle = 'Advogado(a) Sênior';
  if (newRole === 'ti_admin') roleTitle = 'Gestor de TI & Administrador';

  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      roleTitle,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

