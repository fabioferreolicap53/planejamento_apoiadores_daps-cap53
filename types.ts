
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
  linha_cuidado: string[];
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

// Helper function to recursively clean strings
function recursiveClean(val: any): string[] {
  if (val === null || val === undefined) return [];
  if (typeof val !== 'string') return [String(val)];
  
  let current = val.trim();
  if (!current) return [];
  
  // Try JSON parse first
  try {
    const parsed = JSON.parse(current);
    if (Array.isArray(parsed)) {
      return parsed.flatMap(recursiveClean);
    }
    if (typeof parsed === 'string' && parsed !== current) {
      return recursiveClean(parsed);
    }
    if (typeof parsed !== 'string') {
        return [String(parsed)];
    }
  } catch (e) {
    // Ignore parse error
  }

  // Handle array-like strings [A, B]
  if (current.startsWith('[') && current.endsWith(']')) {
    const content = current.slice(1, -1);
    if (!content.trim()) return [];
    return content.split(',').flatMap(part => recursiveClean(part.trim()));
  }

  // Handle quotes
  if ((current.startsWith('"') && current.endsWith('"')) || (current.startsWith("'") && current.endsWith("'"))) {
     return recursiveClean(current.slice(1, -1));
  }
  
  // Final aggressive cleanup for nested JSON artifacts
  current = current.replace(/[\[\]"'\\]/g, '').trim();
  
  return current ? [current] : [];
}

export function parseLinhaCuidado(value: string | string[] | undefined): string[] {
  if (!value) return [];

  let initialInput: any[] = [];
  if (Array.isArray(value)) {
    initialInput = value;
  } else {
    initialInput = [value];
  }

  const result = new Set<string>();
  
  initialInput.forEach(item => {
    recursiveClean(item).forEach(cleaned => {
        if (cleaned && cleaned !== 'null' && cleaned !== 'undefined') {
            result.add(cleaned);
        }
    });
  });
  
  return Array.from(result);
}
