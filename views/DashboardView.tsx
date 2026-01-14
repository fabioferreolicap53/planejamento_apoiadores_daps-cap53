
import React from 'react';
import { View, Plan } from '../types';
import { STATUS_COLORS } from '../constants';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import PlanDetailsModal from '../components/PlanDetailsModal';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, plans }) => {
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [filterLinha, setFilterLinha] = React.useState<string>('Todos');

  // Derive unique options for filter
  const linhaOptions = ['Todos', ...new Set(plans.map(p => p.linha_cuidado))].sort();

  // Filter plans based on selection
  const filteredPlans = plans.filter(p =>
    filterLinha === 'Todos' || p.linha_cuidado === filterLinha
  );

  const chartData = [
    { name: 'PANEJADO', value: filteredPlans.filter(p => p.status === 'PLANEJADO').length, color: '#137fec' },
    { name: 'EM ANDAMENTO', value: filteredPlans.filter(p => p.status === 'EM ANDAMENTO').length, color: '#f97316' },
    { name: 'CONCLUÍDO', value: filteredPlans.filter(p => p.status === 'CONCLUÍDO').length, color: '#078838' },
    { name: 'SUSPENSO', value: filteredPlans.filter(p => p.status === 'SUSPENSO').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const temporalData = filteredPlans.reduce((acc: any[], plan) => {
    if (!plan.data_inicial) return acc;
    const date = new Date(plan.data_inicial);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const key = `${month}/${year}`;

    const existing = acc.find((d: any) => d.name === key);
    if (existing) {
      existing.planos += 1;
    } else {
      acc.push({ name: key, planos: 1, rawDate: date });
    }
    return acc;
  }, [])
    .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime());

  const apoiadoresData = filteredPlans.reduce((acc: any[], plan) => {
    plan.apoiadores.forEach(apoiador => {
      const existing = acc.find(a => a.name === apoiador);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: apoiador, value: 1 });
      }
    });
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const linhaCuidadoData = filteredPlans.reduce((acc: any[], plan) => {
    const existing = acc.find(l => l.name === plan.linha_cuidado);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: plan.linha_cuidado, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const stats = [
    { label: 'Total de Planos', value: filteredPlans.length.toString(), change: 'Total', type: 'positive', icon: 'description', color: 'blue' },
    { label: 'Planos em Andamento', value: filteredPlans.filter(p => p.status === 'EM ANDAMENTO').length.toString(), change: 'Ativo', type: 'positive', icon: 'pending_actions', color: 'orange' },
    { label: 'Resultados Alcançados', value: filteredPlans.filter(p => p.status === 'CONCLUÍDO').length.toString(), change: 'Sucesso', type: 'positive', icon: 'auto_graph', color: 'purple' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Painel</h1>
          <p className="text-[#617589] dark:text-gray-400 text-xs font-medium uppercase tracking-[0.1em]">Gestão Estratégica</p>
        </div>

        <button
          onClick={() => onNavigate(View.CREATE_PLAN)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white rounded-xl px-6 h-12 font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span className="hidden sm:inline">Novo Plano</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center -mt-2">
        <div className="w-full max-w-2xl bg-white dark:bg-[#1A2633] rounded-2xl border border-[#dbe0e6] dark:border-gray-700 p-2 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-20 hidden sm:block"></div>

          <div className="flex items-center gap-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 w-full sm:w-auto min-w-max">
            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined !text-[20px]">filter_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#617589] dark:text-gray-400">Filtrar por</span>
              <span className="text-xs font-bold text-[#111418] dark:text-white">Linha de Cuidado</span>
            </div>
          </div>

          <div className="relative flex-1 w-full px-2 sm:px-0">
            <select
              value={filterLinha}
              onChange={(e) => setFilterLinha(e.target.value)}
              className="form-select flex w-full border-none bg-gray-50/50 dark:bg-gray-800/50 rounded-xl h-12 text-sm pl-4 pr-10 appearance-none font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {linhaOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">expand_more</span>
          </div>

          <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl min-w-max">
            <span className="text-xs font-black text-primary uppercase tracking-tighter">
              {filteredPlans.length} {filteredPlans.length === 1 ? 'PLANO' : 'PLANOS'}
            </span>
          </div>
        </div>
        <div className="h-4 w-px bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
            <div className={`absolute right-[-10px] top-[-10px] bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-full p-8 transition-transform group-hover:scale-110`}>
              <span className={`material-symbols-outlined text-${stat.color}-500 text-4xl opacity-20`}>{stat.icon}</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <p className="text-[#617589] dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[#111418] dark:text-white text-3xl font-bold">{stat.value}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${stat.type === 'positive' ? 'text-[#078838] bg-green-100 dark:bg-green-900/30' : 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Taxas de Conclusão de Iniciativa</h3>
            <button className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-xl">more_horiz</span>
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { label: 'INOVAÇÃO', value: filteredPlans.filter(p => p.eixo === 'INOVAÇÃO').length, color: 'bg-primary' },
              { label: 'QUALIFICAÇÃO', value: filteredPlans.filter(p => p.eixo === 'QUALIFICAÇÃO').length, color: 'bg-orange-500' },
              { label: 'PROCESSO DE TRABALHO', value: filteredPlans.filter(p => p.eixo === 'PROCESSO DE TRABALHO').length, color: 'bg-green-600' },
            ].map((item) => {
              const percentage = filteredPlans.length > 0 ? Math.round((item.value / filteredPlans.length) * 100) : 0;
              return (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-[#111418] dark:text-white">{item.label}</span>
                    <span className="text-sm font-bold text-[#111418] dark:text-white">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Visão Geral do Status do Plano</h3>
            <button className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full py-4">
            <div className="size-48 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.length > 0 ? chartData : [{ name: 'Nenhum', value: 1, color: '#e5e7eb' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(chartData.length > 0 ? chartData : [{ color: '#e5e7eb' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-[#111418] dark:text-white">{filteredPlans.length}</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Planos Filtrados</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm text-[#617589] dark:text-gray-300 flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-[#111418] dark:text-white">{filteredPlans.length > 0 ? Math.round((item.value / filteredPlans.length) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Progressão Temporal de Planos</h3>
            <p className="text-[#617589] dark:text-gray-400 text-sm">Volume de planos iniciados por mês/ano</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">calendar_month</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={temporalData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#617589', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#617589', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar
                dataKey="planos"
                fill="#137fec"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Planos por Apoiador</h3>
            <span className="material-symbols-outlined text-gray-400">groups</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apoiadoresData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#617589', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                  label={{ position: 'right', fill: '#617589', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Distribuição por Linha de Cuidado</h3>
            <span className="material-symbols-outlined text-gray-400">analytics</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linhaCuidadoData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#617589', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="value"
                  fill="#ec4899"
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                  label={{ position: 'right', fill: '#617589', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold">Planos Recentes</h3>
          <button onClick={() => onNavigate(View.HISTORY)} className="text-primary text-sm font-semibold hover:underline">Ver Todos</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1A2633] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Linha de Cuidado</th>
                  <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Eixo</th>
                  <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Registrado</th>
                  <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbe0e6] dark:divide-gray-700">
                {filteredPlans.slice(0, 5).map((plan) => (
                  <tr key={plan.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700">
                          {plan.linha_cuidado.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-[#111418] dark:text-white text-sm font-medium">{plan.linha_cuidado}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#617589] dark:text-gray-300 text-sm">{plan.eixo}</td>
                    <td className="px-6 py-4 text-[#617589] dark:text-gray-400 text-sm">
                      {plan.created_at ? new Date(plan.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[plan.status]}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        className="text-[#617589] hover:text-primary dark:text-gray-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
      <p className="text-xs text-[#617589] dark:text-gray-500 text-center pb-8">© 2023 DAPS/CAP5.3 Pro. Todos os direitos reservados.</p>
    </div>
  );
};

export default DashboardView;
