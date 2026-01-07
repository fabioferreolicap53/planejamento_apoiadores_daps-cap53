
import React, { useState } from 'react';
import { View, Plan, Profile } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import PlanDetailsModal from '../components/PlanDetailsModal';

interface HistoryViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: () => void;
  profile: Profile | null;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate, plans, onEdit, onDelete, profile }) => {
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const canManage = (plan: Plan) => {
    return profile?.role === 'admin' || profile?.id === plan.professional_id;
  };

  const filteredPlans = plans.filter(p =>
    p.linha_cuidado.toLowerCase().includes(search.toLowerCase()) ||
    p.eixo.toLowerCase().includes(search.toLowerCase()) ||
    (p.resumo || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.meta || '').toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (!error) {
        onDelete();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white dark:bg-[#1a2634] border-b border-[#e5e7eb] dark:border-gray-800 flex-shrink-0 z-10">
        <div className="px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap justify-between items-end gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl font-black tracking-tighter">Histórico de Planos</h1>
              <p className="text-[#617589] dark:text-gray-400 text-sm sm:text-base">Revise e gerencie seu arquivo de planos registrados.</p>
            </div>
            <button
              onClick={() => onNavigate(View.CREATE_PLAN)}
              className="flex w-full sm:w-auto items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white gap-2 text-sm font-bold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Criar Novo Plano</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-[#1a2634] p-4 rounded-xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm">
            <div className="w-full md:w-96">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input flex w-full rounded-lg border-[#e5e7eb] dark:border-gray-700 bg-[#f0f2f4] dark:bg-gray-800 pl-10 h-10 text-sm"
                  placeholder="Buscar por linha, eixo, resumo ou ID..."
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {['Status: Todos', 'Data: Últimos 30 Dias'].map((filter) => (
                <button key={filter} className="flex h-8 items-center gap-x-2 rounded-lg bg-[#f0f2f4] dark:bg-gray-800 border border-transparent px-3 text-sm font-medium">
                  <span>{filter}</span>
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                </button>
              ))}
              <button className="flex h-8 items-center gap-x-2 rounded-lg bg-[#f0f2f4] dark:bg-gray-800 border border-transparent px-3 text-sm font-medium">
                <span>Ordenar: Mais Recentes</span>
                <span className="material-symbols-outlined text-[18px]">sort</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9fafb] dark:bg-gray-800/50 border-b border-[#e5e7eb] dark:border-gray-800 text-left">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] sticky left-0 bg-[#f9fafb] dark:bg-gray-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Eixo</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Linha de Cuidado</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Início</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Fim</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Resumo</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Meta</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Apoiadores</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Avaliação</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Categorias</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589]">Observações</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right text-[#617589] sticky right-0 bg-[#f9fafb] dark:bg-gray-800 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-800">
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="group hover:bg-[#f0f9ff] dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap sticky left-0 bg-white dark:bg-[#1a2634] group-hover:bg-[#f0f9ff] dark:group-hover:bg-blue-900/10 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold border uppercase ${STATUS_COLORS[plan.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'CONCLUÍDO' ? 'bg-emerald-500' :
                            plan.status === 'EM ANDAMENTO' ? 'bg-amber-500' :
                              plan.status === 'PLANEJADO' ? 'bg-blue-500' : 'bg-red-500'
                            }`}></span>
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">{plan.eixo}</div>
                        {plan.ciclo && <div className="text-[10px] text-gray-400 font-medium">Ciclo: {plan.ciclo}</div>}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 shrink-0`}>
                            {plan.linha_cuidado.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-[#111418] dark:text-white capitalize">{plan.linha_cuidado.toLowerCase()}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.data_inicial ? new Date(plan.data_inicial).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.data_final ? new Date(plan.data_final).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[300px]">
                        <div className="text-sm text-[#617589] line-clamp-2 leading-relaxed" title={plan.resumo}>
                          {plan.resumo}
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[250px]">
                        <div className="text-sm text-[#617589] line-clamp-2 italic" title={plan.meta}>
                          "{plan.meta}"
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {plan.apoiadores?.slice(0, 2).map(a => (
                            <span key={a} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] rounded text-gray-600 dark:text-gray-400">
                              {a}
                            </span>
                          ))}
                          {plan.apoiadores?.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{plan.apoiadores.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{plan.avaliacao}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(plan.categorias || []).map(c => (
                            <span key={c} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] rounded border border-emerald-100 dark:border-emerald-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="text-sm text-gray-400 italic truncate max-w-[200px]" title={plan.observacoes}>
                          {plan.observacoes || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right sticky right-0 bg-white dark:bg-[#1a2634] group-hover:bg-[#f0f9ff] dark:group-hover:bg-blue-900/10 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedPlan(plan)}
                            className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Ver detalhes"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {canManage(plan) ? (
                            <>
                              <button
                                onClick={() => onEdit(plan)}
                                className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Editar plano"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(plan.id)}
                                className="text-[#617589] hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Excluir plano"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-300 material-symbols-outlined cursor-not-allowed text-[20px]" title="Sem permissão para alterar">lock</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-t border-[#e5e7eb] dark:border-gray-800">
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#617589]">Linhas por página:</p>
                <select className="bg-[#f0f2f4] dark:bg-gray-800 border-none rounded text-sm font-medium py-1 px-2 pr-8 focus:ring-0">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#617589] mr-4">1-10 de 124</p>
                <div className="flex gap-1">
                  <button disabled className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-[#617589] opacity-50">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {[1, 2, 3].map(page => (
                    <button key={page} className={`w-8 h-8 rounded text-sm font-medium ${page === 1 ? 'bg-primary text-white' : 'hover:bg-gray-100 text-[#617589]'}`}>
                      {page}
                    </button>
                  ))}
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-[#617589]">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};

export default HistoryView;
