
import React from 'react';
import { Plan } from '../types';
import { STATUS_COLORS } from '../constants';

interface PlanDetailsModalProps {
  plan: Plan;
  onClose: () => void;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ plan, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A2633] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Detalhes do Plano</h2>
              <p className="text-sm text-gray-500 font-medium">ID: {plan.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</label>
              <div className="pt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[plan.status]}`}>
                  {plan.status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Eixo</label>
              <p className="text-sm font-bold text-primary">{plan.eixo}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Linha de Cuidado</label>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.linha_cuidado}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ciclo</label>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan.ciclo || 'N/A'}</p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-blue-400">Data Inicial</label>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {plan.data_inicial ? new Date(plan.data_inicial).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-emerald-400">Data Final</label>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {plan.data_final ? new Date(plan.data_final).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="material-symbols-outlined text-[16px]">summarize</span>
                Resumo do Planejamento
              </label>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 text-sm leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                {plan.resumo}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Meta a ser Alcançada
              </label>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 text-sm leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 border-l-4 border-l-primary">
                {plan.meta}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                Avaliação dos Resultados
              </label>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 text-sm leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                {plan.avaliacao || 'Nenhuma avaliação registrada.'}
              </div>
            </div>
          </div>

          {/* Tags & Supporters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Apoiadores Envolvidos</label>
              <div className="flex flex-wrap gap-2">
                {plan.apoiadores?.length ? plan.apoiadores.map(a => (
                  <span key={a} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-400">
                    {a}
                  </span>
                )) : <span className="text-sm text-gray-400 italic">Nenhum apoiador listado</span>}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categorias</label>
              <div className="flex flex-wrap gap-2">
                {plan.categorias?.length ? plan.categorias.map(c => (
                  <span key={c} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-100 dark:border-emerald-800">
                    {c}
                  </span>
                )) : <span className="text-sm text-gray-400 italic">Sem categorias</span>}
              </div>
            </div>
          </div>

          {plan.observacoes && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Observações Adicionais</label>
              <p className="text-sm italic text-gray-500 bg-amber-50/30 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                {plan.observacoes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/30 dark:bg-gray-800/20">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsModal;
