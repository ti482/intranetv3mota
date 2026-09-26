import { UserProfile, UserRole } from '../types';

export const ADMIN_EMAIL = 'ti@mota.adv.br';
export const ALLOWED_DOMAIN = 'mota.adv.br';

// Role determination rules
export function determineRole(email: string): { role: UserRole; roleTitle: string } {
  const normalized = email.toLowerCase().trim();

  // Super Admin check (You)
  if (normalized === ADMIN_EMAIL) {
    return {
      role: 'ti_admin',
      roleTitle: 'Gestor de TI & Administrador Geral da Intranet',
    };
  }

  // Partners (Sócios)
  if (normalized.includes('roberto') || normalized.includes('mota.adv') || normalized.includes('socio')) {
    return {
      role: 'partner',
      roleTitle: 'Sócio Fundador & Coordenador Geral',
    };
  }

  // Senior Attorneys
  if (normalized.includes('beatriz') || normalized.includes('advogado') || normalized.includes('senior')) {
    return {
      role: 'senior_attorney',
      roleTitle: 'Advogado(a) Sênior - Ações Coletivas',
    };
  }

  // General Staff / Trainees / Analysts
  return {
    role: 'trainee',
    roleTitle: 'Analista Jurídico / Colaborador',
  };
}

export function isDomainAuthorized(email: string): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  // Allow @mota.adv.br or specific authorized administrative accounts
  return domain === ALLOWED_DOMAIN || email.toLowerCase() === ADMIN_EMAIL;
}
