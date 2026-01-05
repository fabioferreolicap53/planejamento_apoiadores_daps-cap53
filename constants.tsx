
import { Plan, PlanStatus } from './types';

export const MOCK_USER = {
  name: "Dr. A. Smith",
  role: "Senior DAPS/CAP5.3 Pro",
  email: "asmith@cap53.org",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOTH0-V_-vm8xXz-aHR2GbaXIbAAAsGbkjBjMSgbvrB2prokfWlA6-GmL_JZQqTBhj3MAbM8dj44YbYq0FXtBHctOGrzWT1hlIS6xg2DysjTO1bTS4H1lUSxkguHjd1e7Rv-LFb2GpqqiUpWR0vMSvJW2HhO4qtmRuacvMTCGz7e710Y6mpZAjbxFzeD_VUKjl3vZrHzTrdXqoLUr7ls6XIIyqnEGuR9R1Zss3V_WRh6YWRWYjIhPRkQrY5GOTpQqg4Qj9FxhLE28"
};

export const MOCK_PLANS: Plan[] = [
  {
    id: "PLN-4920",
    professional_id: "user-1",
    eixo: "INOVAÇÃO",
    linha_cuidado: "SAÚDE MENTAL",
    status: "EM ANDAMENTO",
    apoiadores: ["ALINE", "ANA ALICE"],
    resumo: "Implementação de novos protocolos de atendimento para saúde mental.",
    meta: "Reduzir tempo de espera em 20%",
    avaliacao: "Mensal",
    data_inicial: "2023-10-01",
    data_final: "2023-12-31"
  },
  {
    id: "PLN-4918",
    professional_id: "user-1",
    eixo: "QUALIFICAÇÃO",
    linha_cuidado: "TUBERCULOSE",
    status: "PLANEJADO",
    apoiadores: ["RICARDO EMANUEL"],
    categorias: ["ENFERMEIRO(A)", "MÉDICO(A)"],
    resumo: "Capacitação técnica para manejo de casos complexos.",
    meta: "Capacitar 100% da equipe local",
    avaliacao: "Trimestral",
    data_inicial: "2023-11-01",
    data_final: "2024-02-01"
  },
  {
    id: "PLN-4890",
    professional_id: "user-1",
    eixo: "PROCESSO DE TRABALHO",
    linha_cuidado: "HAS/DM/CURATIVO",
    status: "CONCLUÍDO",
    apoiadores: ["SIMONE"],
    ciclo: "Semanal",
    resumo: "Otimização do fluxo de curativos na unidade.",
    meta: "Padronizar 5 técnicas de curativo",
    avaliacao: "Semestral",
    data_inicial: "2023-08-01",
    data_final: "2023-10-20"
  }
];

export const STATUS_COLORS: Record<PlanStatus, string> = {
  'PLANEJADO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  'EM ANDAMENTO': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  'CONCLUÍDO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  'SUSPENSO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
};
