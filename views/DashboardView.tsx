
import React from 'react';
import { View, Plan } from '../types';
import { STATUS_COLORS } from '../constants';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import PlanDetailsModal from '../components/PlanDetailsModal';
import { FilterDropdown } from '../components/FilterDropdown';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, plans }) => {
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [filterLinha, setFilterLinha] = React.useState<string>('Todos');
  const [filterEixo, setFilterEixo] = React.useState<string>('Todos');
  const [filterApoiador, setFilterApoiador] = React.useState<string>('Todos');
  const [isClearing, setIsClearing] = React.useState(false);

  const clearFilters = () => {
    setIsClearing(true);
    setFilterLinha('Todos');
    setFilterEixo('Todos');
    setFilterApoiador('Todos');
    setTimeout(() => setIsClearing(false), 300);
  };

  // Derive unique options for filters
  const linhaOptions = ['Todos', ...new Set(plans.map(p => p.linha_cuidado))].sort();
  const eixoOptions = ['Todos', ...new Set(plans.map(p => p.eixo))].sort();
  const apoiadorOptions = ['Todos', ...new Set(plans.flatMap(p => p.apoiadores))].sort();

  // Filter plans based on selection
  const filteredPlans = plans.filter(p =>
    (filterLinha === 'Todos' || p.linha_cuidado === filterLinha) &&
    (filterEixo === 'Todos' || p.eixo === filterEixo) &&
    (filterApoiador === 'Todos' || p.apoiadores.includes(filterApoiador))
  );

  // New Metrics Calculations
  const concludedPlans = filteredPlans.filter(p => p.status === 'CONCLUÍDO');
  const resolutividade = filteredPlans.length > 0
    ? Math.round((concludedPlans.length / filteredPlans.length) * 100)
    : 0;

  const avgLeadTime = concludedPlans.length > 0
    ? Math.round(concludedPlans.reduce((acc, p) => {
      const start = new Date(p.data_inicial).getTime();
      const end = p.created_at ? new Date(p.created_at).getTime() : Date.now();
      return acc + (end - start) / (1000 * 60 * 60 * 24);
    }, 0) / concludedPlans.length)
    : 0;

  const chartData = [
    { name: 'PLANEJADO', value: filteredPlans.filter(p => p.status === 'PLANEJADO').length, color: '#137fec' },
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

  const categoriasData = filteredPlans.reduce((acc: any[], plan) => {
    (plan.categorias || []).forEach(cat => {
      const existing = acc.find(c => c.name === cat);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: cat, value: 1 });
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
    { label: 'Taxa Resolutividade', value: `${resolutividade}%`, change: `${concludedPlans.length} Concluídos`, type: resolutividade > 50 ? 'positive' : 'negative', icon: 'auto_graph', color: 'green' },
    { label: 'Lead Time Médio', value: `${avgLeadTime} dias`, change: 'Tempo Médio', type: 'positive', icon: 'timer', color: 'purple' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header and Filter Bar */}
      <div className="sticky top-0 z-30 bg-background-light/80 dark:bg-[#0f1721]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 lg:px-8 py-3 transition-all duration-200">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[#111418] dark:text-white text-xl md:text-2xl font-black tracking-tight">Painel</h1>
            <p className="text-[#617589] dark:text-gray-400 text-[10px] font-medium uppercase tracking-[0.1em]">Gestão Estratégica</p>
          </div>

          <div className="flex-1 flex justify-center px-0 lg:px-4">
            <div className="w-full max-w-5xl bg-white/50 dark:bg-[#1A2633]/50 backdrop-blur-sm rounded-xl border border-[#dbe0e6] dark:border-gray-700 p-1 flex flex-col md:flex-row items-center gap-1 shadow-sm transition-all hover:bg-white dark:hover:bg-[#1A2633] focus-within:ring-2 focus-within:ring-primary/20">
              <FilterDropdown
                label="Linha"
                value={filterLinha}
                options={linhaOptions}
                onChange={setFilterLinha}
                icon="health_and_safety"
              />
              <FilterDropdown
                label="Eixo"
                value={filterEixo}
                options={eixoOptions}
                onChange={setFilterEixo}
                icon="account_tree"
              />
              <FilterDropdown
                label="Apoiador"
                value={filterApoiador}
                options={apoiadorOptions}
                onChange={setFilterApoiador}
                icon="group"
              />

              <div className="hidden xl:flex items-center px-4 py-2 bg-primary/5 dark:bg-primary/20 rounded-lg mr-1 border border-primary/10 transition-colors group-hover:bg-primary/10">
                <span className="text-[10px] font-black text-primary uppercase whitespace-nowrap">
                  {filteredPlans.length} {filteredPlans.length === 1 ? 'PLANO' : 'PLANOS'}
                </span>
              </div>
            </div>

            <button
              onClick={clearFilters}
              disabled={filterLinha === 'Todos' && filterEixo === 'Todos' && filterApoiador === 'Todos'}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-[#617589] dark:text-gray-400 px-4 text-xs font-bold border border-[#dbe0e6] dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              title="Limpar todos os filtros"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              <span className="hidden xl:inline">Limpar</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate(View.CREATE_PLAN)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white rounded-xl px-5 h-10 text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Novo Plano</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 w-full">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
              <div className={`absolute right-[-8px] top-[-8px] bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-full p-6 transition-transform group-hover:scale-110`}>
                <span className={`material-symbols-outlined text-${stat.color}-500 text-3xl opacity-20`}>{stat.icon}</span>
              </div>
              <div className="flex flex-col gap-0.5 relative z-10">
                <p className="text-[#617589] dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[#111418] dark:text-white text-2xl font-bold">{stat.value}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${stat.type === 'positive' ? 'text-[#078838] bg-green-100 dark:bg-green-900/30' : 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Taxas de Conclusão de Iniciativa</h3>
              <button className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-lg">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {[
                { label: 'INOVAÇÃO', color: 'bg-primary' },
                { label: 'QUALIFICAÇÃO', color: 'bg-orange-500' },
                { label: 'PROCESSO DE TRABALHO', color: 'bg-green-600' },
              ].map((item) => {
                const ejePlans = filteredPlans.filter(p => p.eixo === item.label);
                const ejeConcluded = ejePlans.filter(p => p.status === 'CONCLUÍDO').length;
                const percentage = ejePlans.length > 0 ? Math.round((ejeConcluded / ejePlans.length) * 100) : 0;
                return (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-[#111418] dark:text-white">{item.label}</span>
                      <span className="text-sm font-bold text-[#111418] dark:text-white">{ejeConcluded}/{ejePlans.length} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Visão Geral do Status do Plano</h3>
              <button className="text-[#617589] hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span>
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
                    <Tooltip
                      contentStyle={{
                        fontFamily: "'Inter', sans-serif",
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-display">
                  <span className="text-3xl font-black text-[#111418] dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{filteredPlans.length}</span>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>Planos Filtrados</span>
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

        <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Progressão Temporal de Planos</h3>
              <p className="text-[#617589] dark:text-gray-400 text-xs">Volume de planos iniciados por mês/ano</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-lg">calendar_month</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#617589', fontSize: 12, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#617589', fontSize: 12, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Planos por Apoiador</h3>
              <span className="material-symbols-outlined text-gray-400 text-lg">groups</span>
            </div>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apoiadoresData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fill: '#617589', fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    width={160}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                    label={{ position: 'right', fill: '#617589', fontSize: 12, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Distribuição por Categorias</h3>
              <span className="material-symbols-outlined text-gray-400 text-lg">category</span>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriasData.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fill: '#617589', fontSize: 10, fontWeight: '700', fontFamily: "'Inter', sans-serif" }}
                    width={180}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      background: '#fff',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                    label={{ position: 'right', fill: '#617589', fontSize: 10, fontWeight: '700', fontFamily: "'Inter', sans-serif" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Resolutividade por Linha</h3>
              <span className="material-symbols-outlined text-gray-400 text-lg">verified</span>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {linhaCuidadoData.map((item) => {
                const linhaPlans = filteredPlans.filter(p => p.linha_cuidado === item.name);
                const linhaConcluded = linhaPlans.filter(p => p.status === 'CONCLUÍDO').length;
                const percentage = linhaPlans.length > 0 ? Math.round((linhaConcluded / linhaPlans.length) * 100) : 0;
                return (
                  <div key={item.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold text-[#111418] dark:text-white truncate max-w-[150px]">{item.name}</span>
                      <span className="text-[10px] font-black text-primary">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1A2633] border border-[#dbe0e6] dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#111418] dark:text-white text-base font-bold">Volume por Linha de Cuidado</h3>
              <span className="material-symbols-outlined text-gray-400 text-lg">bar_chart</span>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={linhaCuidadoData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fill: '#617589', fontSize: 10, fontWeight: '700', fontFamily: "'Inter', sans-serif" }}
                    width={200}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(19, 127, 236, 0.05)' }}
                    contentStyle={{
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#137fec"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    label={{ position: 'right', fill: '#617589', fontSize: 10, fontWeight: '700', fontFamily: "'Inter', sans-serif" }}
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
                <thead className="bg-[#f9fafb] dark:bg-gray-800/80 border-b border-[#e5e7eb] dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Linha de Cuidado</th>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Eixo</th>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Apoiadores</th>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider text-center">Registrado</th>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-[#617589] dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe0e6] dark:divide-gray-700">
                  {filteredPlans.slice(0, 8).map((plan) => (
                    <tr key={plan.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-primary border border-blue-100/50 dark:border-blue-800/30 transition-transform group-hover:scale-110">
                            {plan.linha_cuidado.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-[#111418] dark:text-white text-xs font-bold truncate max-w-[200px]">{plan.linha_cuidado}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#617589] dark:text-gray-300 text-[11px] font-bold bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                          {plan.eixo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {plan.apoiadores.slice(0, 3).map(a => (
                            <span key={a} className="px-2 py-0.5 bg-blue-50/50 dark:bg-blue-900/10 text-[10px] rounded-md text-primary font-bold border border-blue-100/30 dark:border-blue-800/20">
                              {a}
                            </span>
                          ))}
                          {plan.apoiadores.length > 3 && (
                            <span className="text-[10px] font-bold text-[#617589] bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
                              +{plan.apoiadores.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#617589] dark:text-gray-400 text-[11px] font-medium">
                          {plan.data_inicial ? new Date(plan.data_inicial).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider ${STATUS_COLORS[plan.status]}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="p-2 text-[#617589] hover:text-primary dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                          title="Visualizar Detalhes"
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
        <p className="text-xs text-[#617589] dark:text-gray-500 text-center pb-8">Desenvolvido por Fabio Ferreira de Oliveira - DAPS/CAP5.3</p>
      </div>
    </div>
  );
};

export default DashboardView;
