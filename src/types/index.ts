export type UserRole = 'ti_admin' | 'partner' | 'senior_attorney' | 'trainee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department: string;
  oab?: string;
}

export type WorkspaceSource = 'google_drive' | 'google_docs' | 'google_sheets' | 'google_sites' | 'google_calendar' | 'google_forms';

export interface SearchableItem {
  id: string;
  title: string;
  source: WorkspaceSource;
  category: 'peca_juridica' | 'jurisprudencia' | 'planilha_operacional' | 'procedimento_pop' | 'institucional' | 'chamado_ti';
  tribunal?: 'STF' | 'STJ' | 'TRF1' | 'TST' | 'Geral';
  summary: string;
  content: string;
  lastUpdated: string;
  author: string;
  externalUrl: string;
  tags: string[];
  relevanceScore?: number;
  highlight?: string;
}

export interface Ticket {
  id: string;
  protocol: string;
  requesterName: string;
  requesterEmail: string;
  category: 'PJe/e-SAJ' | 'Certificado Digital' | 'Hardware' | 'E-mail/Workspace' | 'VPN/Rede' | 'PJe-Calc';
  subject: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Novo' | 'Em Análise' | 'Aguardando Usuário' | 'Resolvido';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  solutionNotes?: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: 'Audiência Virtual' | 'Despacho com Ministro/Desembargador' | 'Assembleia com Sindicato' | 'Reunião de Alinhamento Interno' | 'Atendimento a Cliente';
  date: string;
  startTime: string;
  endTime: string;
  tribunalOrOrg?: string;
  meetLink: string;
  participants: string[];
  agenda: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
  notifiedChat: boolean;
}

export interface LegalDocument {
  id: string;
  title: string;
  folder: string;
  tribunal: 'STF' | 'STJ' | 'TRF1' | 'TST' | 'Administrativo';
  description: string;
  variables: string[];
  fullText: string;
  fileFormat: 'DOCX' | 'PDF' | 'GDOC';
  lastModified: string;
  driveUrl: string;
}

export interface POPProcedure {
  id: string;
  code: string;
  title: string;
  category: 'Processual' | 'Tecnologia' | 'Atendimento' | 'Segurança';
  version: string;
  approvedBy: string;
  effectiveDate: string;
  steps: {
    order: number;
    title: string;
    instructions: string;
    responsible: string;
    systemUrl?: string;
  }[];
  criticalRules: string[];
}

export interface PrecatorioRecord {
  id: string;
  numero: string;
  processoOrigem: string;
  tribunal: string;
  entidadeDevedora: string;
  anoOrcamentario: number;
  valorTotal: number;
  honorariosBanca: number;
  numeroBeneficiarios: number;
  status: 'Em Processamento' | 'Liberado para Saque' | 'Impugnado Fazenda' | 'Depósito Efetuado';
  dataPrevisao: string;
  sindicatoParceiro: string;
}

export interface CrmEntity {
  id: string;
  nome: string;
  sigla: string;
  tipo: 'Sindicato' | 'Associação' | 'Federação' | 'Confederação' | 'Grupo de Servidores';
  baseRepresentada: string;
  contatoPrincipal: string;
  cargoContato: string;
  email: string;
  telefone: string;
  acoesAtivas: number;
  totalSubstituidos: number;
  proximaAssembleia?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingMode?: boolean;
}
