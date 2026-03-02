
import React, { useState, useRef } from 'react';
import { View, Plan, Profile } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import PlanDetailsModal from '../components/PlanDetailsModal';
import { FilterDropdown } from '../components/FilterDropdown';
import PrintablePlanList from '../components/PrintablePlanList'; // Importar o novo componente
import TablePrintButton from '../components/TablePrintButton';

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

  // New filter states
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterEixo, setFilterEixo] = useState<string>('Todos');
  const [filterLinha, setFilterLinha] = useState<string>('Todos');
  const [filterApoiador, setFilterApoiador] = useState<string>('Todos');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tableRef = useRef<HTMLTableElement>(null); // Referência para a tabela

  const canManage = (plan: Plan) => {
    return profile?.role === 'Administrador' || profile?.id === plan.professional_id;
  };

  // Derive unique options for filters from the plans list
  const statusOptions = ['Todos', ...new Set(plans.map(p => p.status))].sort();
  const eixoOptions = ['Todos', ...new Set(plans.map(p => p.eixo))].sort();
  const linhaOptions = ['Todos', ...new Set(plans.map(p => p.linha_cuidado))].sort();
  const apoiadorOptions = ['Todos', ...new Set(plans.flatMap(p => p.apoiadores))].sort();

  const filteredPlans = plans.filter(p => {
    const matchesSearch =
      p.linha_cuidado.toLowerCase().includes(search.toLowerCase()) ||
      p.eixo.toLowerCase().includes(search.toLowerCase()) ||
      (p.resumo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.meta || '').toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    const matchesEixo = filterEixo === 'Todos' || p.eixo === filterEixo;
    const matchesLinha = filterLinha === 'Todos' || p.linha_cuidado === filterLinha;
    const matchesApoiador = filterApoiador === 'Todos' || p.apoiadores.includes(filterApoiador);

    const planDateStr = p.data_inicial ? p.data_inicial.substring(0, 10) : null;
    const startStr = startDate || null;
    const endStr = endDate || null;

    const matchesDate = (!startStr || (planDateStr && planDateStr >= startStr)) &&
      (!endStr || (planDateStr && planDateStr <= endStr));

    return matchesSearch && matchesStatus && matchesEixo && matchesLinha && matchesApoiador && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPlans.length / rowsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterEixo, filterLinha, filterApoiador, startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (!error) {
        onDelete();
      }
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('Todos');
    setFilterEixo('Todos');
    setFilterLinha('Todos');
    setFilterApoiador('Todos');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };



  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Sticky Header and Filter Bar */}
        <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-[#0f1721]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto w-full px-3 md:px-8 py-2 md:py-4 flex flex-col gap-2 md:gap-4">
          {/* Title and Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-[#111418] dark:text-white text-base md:text-2xl font-black tracking-tight">Histórico</h1>
                <div className="flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800">
                  <span className="text-[9px] md:text-xs font-bold text-primary whitespace-nowrap">
                    {filteredPlans.length} {filteredPlans.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                  </span>
                </div>
              </div>
              <p className="hidden md:block text-[#617589] dark:text-gray-400 text-xs font-medium">Arquivo Geral de Atividades</p>
            </div>
            <div className="flex gap-2">
              <TablePrintButton
                tableRef={tableRef}
                title="Relatório de Planos - Histórico"
                filters={{
                  status: filterStatus,
                  eixo: filterEixo,
                  linha: filterLinha,
                  apoiador: filterApoiador,
                  startDate: startDate,
                  endDate: endDate,
                  search: search,
                }}
                totalRecords={filteredPlans.length}
              />
              <button
                onClick={() => onNavigate(View.CREATE_PLAN)}
                className="flex items-center justify-center rounded-xl h-9 md:h-10 px-3 md:px-5 bg-primary hover:bg-blue-600 text-white gap-1.5 text-[10px] md:text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">add</span>
                <span>Novo</span>
                <span className="hidden sm:inline">Plano</span>
              </button>
            </div>
          </div>

          {/* Search and Clear Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] text-[16px] md:text-[20px] group-focus-within:text-primary transition-colors">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input flex w-full rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white/50 dark:bg-gray-800 pl-9 h-9 md:h-11 text-[11px] md:text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                placeholder="Buscar..."
              />
            </div>

            <button
              onClick={clearFilters}
              className="flex h-9 md:h-11 items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-[#617589] dark:text-gray-400 px-3 md:px-4 text-[11px] md:text-sm font-bold border border-[#dbe0e6] dark:border-gray-700 hover:bg-red-50 hover:text-red-600 transition-all shrink-0"
              title="Limpar todos os filtros"
            >
              <span className="material-symbols-outlined text-[16px] md:text-[20px]">filter_alt_off</span>
              <span className="hidden xs:inline">Limpar</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-stretch gap-2 w-full md:grid md:grid-cols-6 md:gap-3">
              <div className="min-w-[130px] md:col-span-1 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 flex">
                <FilterDropdown
                  label="Status"
                  value={filterStatus}
                  options={statusOptions}
                  onChange={setFilterStatus}
                  icon="info"
                  className="bg-transparent px-3 py-1.5"
                />
              </div>
              <div className="min-w-[130px] md:col-span-1 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 flex">
                <FilterDropdown
                  label="Eixo"
                  value={filterEixo}
                  options={eixoOptions}
                  onChange={setFilterEixo}
                  icon="account_tree"
                  className="bg-transparent px-3 py-1.5"
                />
              </div>
              <div className="min-w-[130px] md:col-span-1 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 flex">
                <FilterDropdown
                  label="Linha"
                  value={filterLinha}
                  options={linhaOptions}
                  onChange={setFilterLinha}
                  icon="health_and_safety"
                  className="bg-transparent px-3 py-1.5"
                />
              </div>
              <div className="min-w-[130px] md:col-span-1 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 flex">
                <FilterDropdown
                  label="Apoiador"
                  value={filterApoiador}
                  options={apoiadorOptions}
                  onChange={setFilterApoiador}
                  icon="group"
                  className="bg-transparent px-3 py-1.5"
                />
              </div>

              <div className="lg:col-span-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 flex">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 flex-1 group cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && 'showPicker' in input) (input as any).showPicker();
                  }}
                >
                  <span className="material-symbols-outlined text-primary/70 !text-[20px] group-hover:text-primary shrink-0 transition-colors">calendar_today</span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-[#617589] dark:text-gray-400 uppercase leading-none mb-0.5 whitespace-nowrap">Data Inicial Entre</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="form-input flex-1 min-w-0 border-none bg-transparent p-0 h-6 text-xs font-bold text-primary focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[#617589] text-[10px] font-bold shrink-0 opacity-40 px-1">e</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="form-input flex-1 min-w-0 border-none bg-transparent p-0 h-6 text-xs font-bold text-primary focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full h-full px-3 md:px-8 py-4 md:py-6 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 bg-white dark:bg-[#1A2633] rounded-2xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm overflow-hidden transition-all flex flex-col">
            <div className="flex-1 overflow-auto">
              <table ref={tableRef} className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#f9fafb] dark:bg-gray-800/95 border-b border-[#e5e7eb] dark:border-gray-800 text-left backdrop-blur-md">
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] sticky left-0 bg-[#f9fafb] dark:bg-gray-800 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Planejamento (Resumo)</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Status</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Eixo</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Linha de Cuidado</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Início</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Fim</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Meta</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Apoiadores</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Avaliação</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Categorias</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#617589] bg-[#f9fafb] dark:bg-gray-800">Observações</th>
                    <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-right text-[#617589] sticky right-0 bg-[#f9fafb] dark:bg-gray-800 z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">Ações</th>
                  </tr>
                </thead>




                <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-800 text-[13px] md:text-sm">
                  {paginatedPlans.map((plan) => (
                    <tr key={plan.id} className="group hover:bg-[#f0f9ff] dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 md:py-4 px-4 md:px-6 min-w-[180px] md:min-w-[300px] sticky left-0 bg-white dark:bg-[#1a2634] group-hover:bg-[#f0f9ff] dark:group-hover:bg-blue-900/10 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="font-bold line-clamp-2 leading-relaxed text-[#111418] dark:text-white" title={plan.resumo}>
                          {plan.resumo}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
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
                        <div 
                          className="flex flex-nowrap gap-1 max-w-[200px] overflow-hidden" 
                          title={(plan.categorias || []).join(', ')}
                        >
                          {(plan.categorias || []).map(c => (
                            <span key={c} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] rounded border border-emerald-100 dark:border-emerald-800 shrink-0">
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

            <div className="sticky bottom-0 z-20 border-t border-[#e5e7eb] dark:border-gray-800 px-4 md:px-6 py-3 md:py-4 bg-[#f9fafb] dark:bg-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2">
                <p className="text-[11px] md:text-sm text-[#617589] font-medium whitespace-nowrap">
                  <span className="hidden sm:inline">Linhas por página:</span>
                  <span className="sm:hidden">Linhas:</span>
                </p>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#f0f2f4] dark:bg-gray-800 border-none rounded text-sm font-medium py-1 px-2 pr-8 focus:ring-0 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[11px] md:text-sm text-[#617589] font-medium">
                  {filteredPlans.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}-{Math.min(currentPage * rowsPerPage, filteredPlans.length)} <span className="hidden xs:inline">de</span><span className="xs:hidden">/</span> {filteredPlans.length}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-[#617589] ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show a window of pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-primary text-white' : 'hover:bg-gray-100 text-[#617589]'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-[#617589] ${currentPage === totalPages || totalPages === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
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
