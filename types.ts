
export enum View {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  CREATE_PLAN = 'CREATE_PLAN',
  SETTINGS = 'SETTINGS'
}

export type PlanStatus = 'PLANEJADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'SUSPENSO';

export interface Plan {
  id: string;
  professional_id: string;
  eixo: string;
  linha_cuidado: string;
  status: PlanStatus;
  apoiadores: string[];
  resumo: string;
  meta: string;
  avaliacao: string;
  ciclo?: string;
  categorias?: string[];
  data_inicial: string;
  data_final: string;
  observacoes?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  username: string;
  unidade?: string;
  equipe?: string;
  microarea?: string;
  role: 'Normal' | 'Administrador';
  updated_at?: string;
  full_name?: string; // Fallback or extra field
  avatar_url?: string; // Fallback or extra field
}

export interface User {
  id: string;
  email: string;
  profile: Profile | null;
}
