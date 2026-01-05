
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
    professional: "Dra. Sarah M.",
    eixo: "INOVAÇÃO",
    linhaCuidado: "SAÚDE MENTAL",
    status: "EM ANDAMENTO",
    apoiadores: ["ALINE", "ANA ALICE"],
    resumo: "Implementação de novos protocolos de atendimento para saúde mental.",
    meta: "Reduzir tempo de espera em 20%",
    avaliacao: "Mensal",
    dataInicial: "2023-10-01",
    dataFinal: "2023-12-31",
    registrationDate: "24 Out, 2023",
    registrationTime: "10:42",
    initials: "SM",
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "PLN-4918",
    professional: "Dra. Sarah M.",
    eixo: "QUALIFICAÇÃO",
    linhaCuidado: "TUBERCULOSE",
    status: "PLANEJADO",
    apoiadores: ["RICARDO EMANUEL"],
    categorias: ["ENFERMEIRO(A)", "MÉDICO(A)"],
    resumo: "Capacitação técnica para manejo de casos complexos.",
    meta: "Capacitar 100% da equipe local",
    avaliacao: "Trimestral",
    dataInicial: "2023-11-01",
    dataFinal: "2024-02-01",
    registrationDate: "22 Out, 2023",
    registrationTime: "14:15",
    initials: "RE",
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "PLN-4890",
    professional: "Dra. Sarah M.",
    eixo: "PROCESSO DE TRABALHO",
    linhaCuidado: "HAS/DM/CURATIVO",
    status: "CONCLUÍDO",
    apoiadores: ["SIMONE"],
    ciclo: "Semanal",
    resumo: "Otimização do fluxo de curativos na unidade.",
    meta: "Padronizar 5 técnicas de curativo",
    avaliacao: "Semestral",
    dataInicial: "2023-08-01",
    dataFinal: "2023-10-20",
    registrationDate: "20 Out, 2023",
    registrationTime: "09:00",
    initials: "SI",
    color: "bg-pink-100 text-pink-700"
  }
];

export const STATUS_COLORS: Record<PlanStatus, string> = {
  'PLANEJADO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  'EM ANDAMENTO': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  'CONCLUÍDO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  'SUSPENSO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
};
