import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  db, 
  doc, 
  getDoc, 
  setDoc,
  handleFirestoreError,
  OperationType
} from './firebase';
import { User } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';

export const ADMIN_EMAIL = 'ti@mota.adv.br';
export const ALLOWED_DOMAIN = 'mota.adv.br';

export function determineRole(email: string): { role: UserRole; roleTitle: string; department: string } {
  const normalized = email.toLowerCase().trim();

  // Super Admin (ti@mota.adv.br)
  if (normalized === ADMIN_EMAIL) {
    return {
      role: 'ti_admin',
      roleTitle: 'Gestor de TI & Administrador Geral da Intranet',
      department: 'Tecnologia da Informação & Infraestrutura',
    };
  }

  // Partners (Sócios)
  if (normalized.includes('roberto') || normalized.includes('mota.adv') || normalized.includes('socio')) {
    return {
      role: 'partner',
      roleTitle: 'Sócio Fundador & Coordenador Geral',
      department: 'Diretoria Executiva',
    };
  }

  // Senior Attorneys
  if (normalized.includes('beatriz') || normalized.includes('advogado') || normalized.includes('senior')) {
    return {
      role: 'senior_attorney',
      roleTitle: 'Advogada Sênior - Ações Coletivas',
      department: 'Contencioso Coletivo & Servidores Públicos',
    };
  }

  // Trainees / Legal Analysts
  return {
    role: 'trainee',
    roleTitle: 'Analista Jurídico / Colaborador',
    department: 'Núcleo de Pesquisa & Prazos',
  };
}

export function isDomainAuthorized(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  return domain === ALLOWED_DOMAIN || normalized === ADMIN_EMAIL;
}

/**
 * Synchronizes Firebase Auth User with Firestore `/users/{uid}`.
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const email = (user.email || '').toLowerCase().trim();

  if (!isDomainAuthorized(email)) {
    await firebaseSignOut(auth);
    throw new Error(
      `Acesso restrito: A conta ${email} não pertence ao domínio @${ALLOWED_DOMAIN} nem é a conta administrativa autorizada (${ADMIN_EMAIL}).`
    );
  }

  const userRef = doc(db, 'users', user.uid);
  let existingData: any = null;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
  }

  const { role, roleTitle, department } = determineRole(email);

  const profile: UserProfile = {
    id: user.uid,
    name: user.displayName || existingData?.name || email.split('@')[0],
    email: email,
    role: existingData?.role || role,
    roleTitle: existingData?.roleTitle || roleTitle,
    avatar: user.photoURL || existingData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: existingData?.department || department,
    ...(existingData?.oab ? { oab: existingData.oab } : role === 'partner' ? { oab: 'OAB/DF 14.130' } : role === 'senior_attorney' ? { oab: 'OAB/DF 28.490' } : {}),
  };

  const payload: any = {
    id: profile.id,
    uid: user.uid,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    roleTitle: profile.roleTitle,
    avatar: profile.avatar,
    department: profile.department,
    lastLoginAt: new Date().toISOString(),
  };

  if (profile.oab) {
    payload.oab = profile.oab;
  }

  try {
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }

  return profile;
}

/**
 * Triggers the REAL Google Authentication Popup via Firebase.
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

/**
 * Real logout via Firebase Auth.
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}
