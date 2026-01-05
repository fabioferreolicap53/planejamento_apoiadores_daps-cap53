
import React, { useState, useEffect } from 'react';
import { View, Plan, Profile } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../lib/supabase';

interface CreatePlanViewProps {
  onNavigate: (view: View) => void;
  onSaveSuccess: () => void;
  editingPlan: Plan | null;
  profile: Profile | null;
}

const CreatePlanView: React.FC<CreatePlanViewProps> = ({ onNavigate, onSaveSuccess, editingPlan, profile }) => {
  const canManage = !editingPlan || profile?.role === 'admin' || profile?.id === editingPlan.professional_id;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(editingPlan?.categorias || []);
  const [selectedApoiadores, setSelectedApoiadores] = useState<string[]>(editingPlan?.apoiadores || []);
  const [eixo, setEixo] = useState(editingPlan?.eixo || '');
  const [linhaCuidado, setLinhaCuidado] = useState(editingPlan?.linha_cuidado || '');
  const [status, setStatus] = useState(editingPlan?.status || '');
  const [resumo, setResumo] = useState(editingPlan?.resumo || '');
  const [meta, setMeta] = useState(editingPlan?.meta || '');
  const [avaliacao, setAvaliacao] = useState(editingPlan?.avaliacao || '');
  const [ciclo, setCiclo] = useState(editingPlan?.ciclo || '');
  const [dataInicial, setDataInicial] = useState(editingPlan?.data_inicial || '');
  const [dataFinal, setDataFinal] = useState(editingPlan?.data_final || '');
  const [observacoes, setObservacoes] = useState(editingPlan?.observacoes || '');
  const [isSaving, setIsSaving] = useState(false);

  const [configOptions, setConfigOptions] = useState<{
    eixo: string[];
    linha_cuidado: string[];
    apoiador: string[];
    categoria: string[];
  }>({
    eixo: [],
    linha_cuidado: [],
    apoiador: [],
    categoria: []
  });

  const fetchOptions = async () => {
    const { data, error } = await supabase
      .from('config_options')
      .select('*')
      .order('label', { ascending: true });

    if (data && !error) {
      const grouped = data.reduce((acc: any, curr: any) => {
        if (!acc[curr.type]) acc[curr.type] = [];
        acc[curr.type].push(curr.label);
        return acc;
      }, { eixo: [], linha_cuidado: [], apoiador: [], categoria: [] });
      setConfigOptions(grouped);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleAddOption = async (type: string) => {
    const label = prompt(`Digite o novo item para ${type.replace('_', ' ').toUpperCase()}:`);
    if (label) {
      const { error } = await supabase
        .from('config_options')
        .insert([{ type, label: label.toUpperCase() }]);

      if (error) {
        alert('Erro ao adicionar item. Verifique se já existe.');
      } else {
        fetchOptions();
      }
    }
  };

  const handleDeleteOption = async (type: string, label: string) => {
    if (confirm(`Tem certeza que deseja excluir "${label}" de ${type.replace('_', ' ').toUpperCase()} permanentemente?`)) {
      const { error } = await supabase
        .from('config_options')
        .delete()
        .eq('type', type)
        .eq('label', label);

      if (error) {
        alert('Erro ao excluir item. Pode estar sendo usado por algum plano.');
      } else {
        if (type === 'eixo' && eixo === label) setEixo('');
        if (type === 'linha_cuidado' && linhaCuidado === label) setLinhaCuidado('');
        fetchOptions();
      }
    }
  };

  const FREQUENCY_OPTIONS = [
    "DIÁRIO", "SEMANAL", "QUINZENAL", "MENSAL", "BIMENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"
  ];

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedApoiadores([]);
    setEixo('');
    setLinhaCuidado('');
    setStatus('');
    setResumo('');
    setMeta('');
    setAvaliacao('');
    setCiclo('');
    setDataInicial('');
    setDataFinal('');
    setObservacoes('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const planData = {
      professional_id: session.user.id,
      eixo,
      linha_cuidado: linhaCuidado,
      status,
      apoiadores: selectedApoiadores,
      resumo,
      meta,
      avaliacao,
      ciclo: ciclo || null,
      categorias: selectedCategories,
      data_inicial: dataInicial,
      data_final: dataFinal || null,
      observacoes: observacoes || null,
    };

    let error;
    if (editingPlan) {
      const { error: updateError } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', editingPlan.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('plans')
        .insert([planData]);
      error = insertError;
    }

    if (!error) {
      onSaveSuccess();
      onNavigate(View.HISTORY);
    } else {
      console.error('Save error:', error);
      alert('Erro ao salvar o plano: ' + (error.message || 'Tente novamente.'));
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingPlan) return;
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      const { error } = await supabase.from('plans').delete().eq('id', editingPlan.id);
      if (!error) {
        onSaveSuccess();
        onNavigate(View.HISTORY);
      }
    }
  };

  const toggleSelection = (option: string, selected: string[], setSelected: (val: string[]) => void) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(i => i !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">assignment_add</span>
          </div>
          <h2 className="text-[#111418] text-lg font-bold leading-tight">Registro de Planejamento</h2>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <div className="flex flex-1 justify-center py-5 px-4 md:px-40">
        <div className="max-w-[960px] flex-1">
          <div className="p-4 mb-4">
            <h1 className="text-[#111418] text-[32px] font-bold leading-tight">
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </h1>
            <p className="text-[#637588] text-sm mt-2">
              {editingPlan
                ? 'Atualize os detalhes do plano registrado.'
                : 'Registre um novo plano de desenvolvimento profissional para a equipe DAPS/CAP5.3.'}
            </p>
            {!canManage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
                <span className="material-symbols-outlined text-[20px]">lock_person</span>
                Atenção: Você está visualizando um plano de outro profissional e não possui permissão para alterá-lo.
              </div>
            )}
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
            <form className="flex flex-col gap-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[#111418] text-base font-medium uppercase">EIXOS</label>
                    {profile?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleAddOption('eixo')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={eixo}
                        onChange={(e) => setEixo(e.target.value)}
                        required
                        disabled={!canManage}
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="" disabled>Selecione um eixo</option>
                        {configOptions.eixo.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                    {profile?.role === 'admin' && eixo && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOption('eixo', eixo)}
                        className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                        title="Excluir este item permanentemente"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[#111418] text-base font-medium uppercase">LINHA DE CUIDADO</label>
                    {profile?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleAddOption('linha_cuidado')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={linhaCuidado}
                        onChange={(e) => setLinhaCuidado(e.target.value)}
                        required
                        disabled={!canManage}
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="" disabled>Selecione a linha de cuidado</option>
                        {configOptions.linha_cuidado.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                    {profile?.role === 'admin' && linhaCuidado && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOption('linha_cuidado', linhaCuidado)}
                        className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                        title="Excluir este item permanentemente"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#111418] text-base font-medium uppercase">STATUS</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                      disabled={!canManage}
                      className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="" disabled>Selecione o status</option>
                      <option value="PLANEJADO">PLANEJADO</option>
                      <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                      <option value="CONCLUÍDO">CONCLUÍDO</option>
                      <option value="SUSPENSO">SUSPENSO</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[#111418] text-base font-medium uppercase">APOIADOR(ES) ENVOLVIDO(S)</label>
                    {profile?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleAddOption('apoiador')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {selectedApoiadores.map(name => (
                      <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-primary text-xs font-bold rounded-md border border-blue-100 shadow-sm">
                        {name}
                        {canManage && (
                          <button type="button" onClick={() => toggleSelection(name, selectedApoiadores, setSelectedApoiadores)} className="hover:text-red-500 flex items-center">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!canManage}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !selectedApoiadores.includes(val)) {
                            setSelectedApoiadores([...selectedApoiadores, val]);
                          }
                          e.target.value = "";
                        }}
                        value=""
                      >
                        <option value="" disabled>Adicionar apoiador(es)...</option>
                        {configOptions.apoiador.map(opt => (
                          <option key={opt} value={opt} disabled={selectedApoiadores.includes(opt)}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                    {/* For Apoiadores, we delete from the selection above or from the system via a list in the future. 
                        But the user asked for deletion. Let's provide a way to delete the available options too.
                    */}
                    {profile?.role === 'admin' && (
                      <select
                        className="size-10 rounded-lg border border-red-100 bg-red-50 text-red-500 appearance-none text-center cursor-pointer"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDeleteOption('apoiador', e.target.value);
                            e.target.value = "";
                          }
                        }}
                        title="Excluir um apoiador do sistema"
                      >
                        <option value="">🗑️</option>
                        {configOptions.apoiador.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#111418] text-base font-medium uppercase">RESUMO DO PLANEJAMENTO</label>
                <textarea
                  className="form-textarea w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary/50 h-32 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Descreva um resumo das ações planejadas..."
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  required
                  disabled={!canManage}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#111418] text-base font-medium uppercase">META / OBJETIVO</label>
                <input
                  className="form-input w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary/50 h-14 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Ex: Melhorar protocolos de comunicação da equipe"
                  type="text"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  required
                  disabled={!canManage}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#111418] text-base font-medium uppercase">AVALIAÇÃO PERIÓDICA</label>
                  <div className="relative">
                    <select
                      value={avaliacao}
                      onChange={(e) => setAvaliacao(e.target.value)}
                      required
                      disabled={!canManage}
                      className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Selecione a frequência</option>
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                  </div>
                </div>
                {eixo === 'PROCESSO DE TRABALHO' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[#111418] text-base font-medium uppercase">CICLO DE AGENDA PADRÃO</label>
                    <div className="relative">
                      <select
                        value={ciclo}
                        onChange={(e) => setCiclo(e.target.value)}
                        disabled={!canManage}
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Selecione o tipo de ciclo</option>
                        {FREQUENCY_OPTIONS.map(opt => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#111418] text-base font-medium uppercase">DATA INICIAL</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 h-14 disabled:bg-gray-50 disabled:text-gray-500"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    required
                    disabled={!canManage}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#111418] text-base font-medium uppercase">DATA FINAL</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 h-14 disabled:bg-gray-50 disabled:text-gray-500"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    disabled={!canManage}
                  />
                </div>
              </div>

              {eixo === 'QUALIFICAÇÃO' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[#111418] text-base font-medium uppercase">CATEGORIA(S) A CAPACITAR (QUALIFICAÇÃO)</label>
                    {profile?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleAddOption('categoria')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100 shadow-sm">
                        {cat}
                        {canManage && (
                          <button type="button" onClick={() => toggleSelection(cat, selectedCategories, setSelectedCategories)} className="hover:text-red-500 flex items-center">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!canManage}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !selectedCategories.includes(val)) {
                            setSelectedCategories([...selectedCategories, val]);
                          }
                          e.target.value = "";
                        }}
                        value=""
                      >
                        <option value="" disabled>Adicionar categoria(s)...</option>
                        {configOptions.categoria.map(opt => (
                          <option key={opt} value={opt} disabled={selectedCategories.includes(opt)}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                    {profile?.role === 'admin' && (
                      <select
                        className="size-10 rounded-lg border border-red-100 bg-red-50 text-red-500 appearance-none text-center cursor-pointer"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDeleteOption('categoria', e.target.value);
                            e.target.value = "";
                          }
                        }}
                        title="Excluir uma categoria do sistema"
                      >
                        <option value="">🗑️</option>
                        {configOptions.categoria.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#111418] text-base font-medium uppercase">OBSERVAÇÕES</label>
                <textarea
                  className="form-textarea w-full rounded-lg border-gray-300 h-32 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Adicione quaisquer notas adicionais, restrições ou requisitos aqui..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  disabled={!canManage}
                />
              </div>

              <div className="flex flex-wrap justify-between gap-4 pt-6 border-t border-gray-100 mt-2">
                <div className="flex gap-2">
                  {canManage && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="h-10 px-4 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">backspace</span>
                      Limpar
                    </button>
                  )}
                  {canManage && editingPlan && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="h-10 px-4 rounded-lg text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                      Excluir
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(View.DASHBOARD)}
                    className="h-10 px-6 rounded-lg text-[#637588] font-bold hover:bg-gray-100 transition-colors"
                  >
                    {canManage ? 'Cancelar' : 'Voltar'}
                  </button>
                  {canManage && (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="h-10 px-6 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving && <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {editingPlan ? 'Alterar Plano' : 'Registrar Plano'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanView;
