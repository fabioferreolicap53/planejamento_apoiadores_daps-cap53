import React from 'react';
import { Plan } from '../types';
import { STATUS_COLORS } from '../constants';

interface PrintablePlanListProps {
  plans: Plan[];
  filters: {
    status: string;
    eixo: string;
    linha: string;
    apoiador: string;
    startDate: string;
    endDate: string;
    search: string;
  };
}

const PrintablePlanList: React.FC<PrintablePlanListProps> = ({ plans, filters }) => {
  const reportDate = new Date().toLocaleString('pt-BR');

  return (
    <div className="print-container p-8 bg-white text-black">
      {/* Cabeçalho Profissional */}
      <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">DAPS / CAP 5.3</h1>
          <p className="text-sm font-bold text-gray-600">Relatório Geral de Planejamento e Atividades</p>
        </div>
        <div className="text-right text-xs text-gray-500 font-medium">
          <p>Gerado em: {reportDate}</p>
          <p>Total de Registros: {plans.length}</p>
        </div>
      </div>

      {/* Resumo dos Filtros Aplicados */}
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-widest">Filtros Aplicados</h2>
        <div className="grid grid-cols-4 gap-4 text-[11px]">
          <div><span className="font-bold text-gray-700">Status:</span> {filters.status}</div>
          <div><span className="font-bold text-gray-700">Eixo:</span> {filters.eixo}</div>
          <div><span className="font-bold text-gray-700">Linha:</span> {filters.linha}</div>
          <div><span className="font-bold text-gray-700">Apoiador:</span> {filters.apoiador}</div>
          {(filters.startDate || filters.endDate) && (
            <div className="col-span-2">
              <span className="font-bold text-gray-700">Período:</span> {filters.startDate || 'Início'} até {filters.endDate || 'Fim'}
            </div>
          )}
          {filters.search && (
            <div className="col-span-2">
              <span className="font-bold text-gray-700">Busca:</span> "{filters.search}"
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Dados */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="p-2 border border-blue-900 text-left uppercase">Resumo do Planejamento</th>
            <th className="p-2 border border-blue-900 text-center uppercase w-24">Status</th>
            <th className="p-2 border border-blue-900 text-left uppercase w-32">Eixo / Linha</th>
            <th className="p-2 border border-blue-900 text-center uppercase w-20">Início</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Fim</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Meta</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Apoiadores</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Avaliação</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Categorias</th>
            <th className="p-2 border border-blue-900 text-left uppercase">Observações</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, index) => (
            <tr key={plan.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 border border-gray-300 align-top">
                <div className="font-bold text-blue-900 mb-1">{plan.resumo}</div>
              </td>
              <td className="p-2 border border-gray-300 text-center align-top">
                <span className="font-bold text-[9px]">{plan.status}</span>
              </td>
              <td className="p-2 border border-gray-300 align-top">
                <div className="font-bold">{plan.eixo}</div>
                <div className="text-gray-600">{plan.linha_cuidado}</div>
              </td>
              <td className="p-2 border border-gray-300 text-center align-top">
                {plan.data_inicial ? new Date(plan.data_inicial).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="p-2 border border-gray-300 text-center align-top">
                {plan.data_final ? new Date(plan.data_final).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="p-2 border border-gray-300 align-top">
                {plan.meta}
              </td>
              <td className="p-2 border border-gray-300 align-top">
                {plan.apoiadores?.join(', ')}
              </td>
              <td className="p-2 border border-gray-300 align-top">
                {plan.avaliacao}
              </td>
              <td className="p-2 border border-gray-300 align-top">
                {plan.categorias?.join(', ')}
              </td>
              <td className="p-2 border border-gray-300 align-top">
                {plan.observacoes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rodapé de Assinatura */}
      <div className="mt-12 pt-8 flex justify-around border-t border-gray-200">
        <div className="text-center">
          <div className="w-48 border-b border-black mb-1"></div>
          <p className="text-[10px] font-bold uppercase">Assinatura do Responsável</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b border-black mb-1"></div>
          <p className="text-[10px] font-bold uppercase">Carimbo da Unidade</p>
        </div>
      </div>

      <div className="mt-8 text-center text-[9px] text-gray-400">
        Este documento é um relatório oficial gerado pelo Sistema de Planejamento DAPS/CAP 5.3.
      </div>
    </div>
  );
};

export default PrintablePlanList;