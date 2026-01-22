
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
  const isAdmin = profile?.role === 'Administrador';
  const canManage = !editingPlan || isAdmin || profile?.id === editingPlan.professional_id;

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

  // States for management UI selection
  const [supporterToManage, setSupporterToManage] = useState('');
  const [categoryToManage, setCategoryToManage] = useState('');

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

  const handleAddOption = async (type: string, autoInclude = true) => {
    const label = prompt(`Digite o novo item para ${type.replace('_', ' ').toUpperCase()}:`);
    if (label && label.trim()) {
      const formattedLabel = label.trim().toUpperCase();
      const { error } = await supabase
        .from('config_options')
        .insert([{ type, label: formattedLabel }]);

      if (error) {
        alert('Erro ao adicionar item. Verifique se já existe.');
      } else {
        if (autoInclude) {
          if (type === 'apoiador' && !selectedApoiadores.includes(formattedLabel)) {
            setSelectedApoiadores([...selectedApoiadores, formattedLabel]);
          } else if (type === 'categoria' && !selectedCategories.includes(formattedLabel)) {
            setSelectedCategories([...selectedCategories, formattedLabel]);
          } else if (type === 'linha_cuidado') {
            setLinhaCuidado(formattedLabel);
          } else if (type === 'eixo') {
            setEixo(formattedLabel);
          }
        }
        fetchOptions();
      }
    }
  };

  const handleHeaderAction = (type: 'apoiador' | 'categoria') => {
    const selected = type === 'apoiador' ? supporterToManage : categoryToManage;
    const currentList = type === 'apoiador' ? selectedApoiadores : selectedCategories;
    const setList = type === 'apoiador' ? setSelectedApoiadores : setSelectedCategories;
    const setManage = type === 'apoiador' ? setSupporterToManage : setCategoryToManage;

    if (selected) {
      if (!currentList.includes(selected)) {
        setList([...currentList, selected]);
      }
      setManage('');
    } else {
      handleAddOption(type);
    }
  };

  const handleSupporterSelect = (val: string) => {
    if (val && !selectedApoiadores.includes(val)) {
      setSelectedApoiadores([...selectedApoiadores, val]);
    }
    setSupporterToManage(''); // Reset selection
  };


  const handleEditOption = async (type: string, oldLabel: string) => {
    const newLabel = prompt(`Renomear "${oldLabel}" para:`, oldLabel);
    if (newLabel && newLabel.trim() && newLabel.trim().toUpperCase() !== oldLabel.toUpperCase()) {
      const formattedNewLabel = newLabel.trim().toUpperCase();

      // Check if the new label already exists
      const { data: existing } = await supabase
        .from('config_options')
        .select('id')
        .eq('type', type)
        .eq('label', formattedNewLabel)
        .single();

      if (existing) {
        alert('Este nome já existe.');
        return;
      }

      // Update the option itself
      const { error: updateOptError } = await supabase
        .from('config_options')
        .update({ label: formattedNewLabel })
        .eq('type', type)
        .eq('label', oldLabel);

      if (updateOptError) {
        alert('Erro ao renomear item.');
        return;
      }

      // Update existing plans to maintain consistency
      if (type === 'linha_cuidado') {
        await supabase.from('plans').update({ linha_cuidado: formattedNewLabel }).eq('linha_cuidado', oldLabel);
        if (linhaCuidado === oldLabel) setLinhaCuidado(formattedNewLabel);
      } else if (type === 'eixo') {
        await supabase.from('plans').update({ eixo: formattedNewLabel }).eq('eixo', oldLabel);
        if (eixo === oldLabel) setEixo(formattedNewLabel);
      } else if (type === 'apoiador') {
        // Handle array update for supporters
        const { data: plansWithSupporter } = await supabase
          .from('plans')
          .select('id, apoiadores')
          .contains('apoiadores', [oldLabel]);

        if (plansWithSupporter) {
          for (const plan of plansWithSupporter) {
            const updatedApoiadores = plan.apoiadores.map((a: string) => a === oldLabel ? formattedNewLabel : a);
            await supabase.from('plans').update({ apoiadores: updatedApoiadores }).eq('id', plan.id);
          }
        }

        // Update local state if needed
        if (selectedApoiadores.includes(oldLabel)) {
          setSelectedApoiadores(selectedApoiadores.map(a => a === oldLabel ? formattedNewLabel : a));
        }
      } else if (type === 'categoria') {
        // Handle array update for categories
        const { data: plansWithCategory } = await supabase
          .from('plans')
          .select('id, categorias')
          .contains('categorias', [oldLabel]);

        if (plansWithCategory) {
          for (const plan of plansWithCategory) {
            const updatedCats = plan.categorias.map((c: string) => c === oldLabel ? formattedNewLabel : c);
            await supabase.from('plans').update({ categorias: updatedCats }).eq('id', plan.id);
          }
        }

        if (selectedCategories.includes(oldLabel)) {
          setSelectedCategories(selectedCategories.map(c => c === oldLabel ? formattedNewLabel : c));
        }
      }

      fetchOptions();
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

    if (selectedApoiadores.length === 0) {
      alert('Por favor, selecione pelo menos um apoiador envolvido.');
      return;
    }

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
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-10 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl sm:text-3xl">assignment_add</span>
          </div>
          <h2 className="text-[#111418] text-base sm:text-lg font-bold leading-tight truncate">Registro de Planejamento</h2>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <div className="flex flex-1 justify-center py-5 px-4 lg:px-40">
        <div className="max-w-[960px] flex-1">
          <div className="p-4 mb-4">
            <h1 className="text-[#111418] text-2xl sm:text-[32px] font-bold leading-tight">
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
            <form className="flex flex-col gap-5 sm:gap-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">
                      EIXOS <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
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
                    {isAdmin && eixo && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditOption('eixo', eixo)}
                          className="size-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex-shrink-0"
                          title="Renomear este item"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption('eixo', eixo)}
                          className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                          title="Excluir este item permanentemente"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">
                      LINHA DE CUIDADO <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
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
                    {isAdmin && linhaCuidado && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditOption('linha_cuidado', linhaCuidado)}
                          className="size-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex-shrink-0"
                          title="Renomear este item"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption('linha_cuidado', linhaCuidado)}
                          className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                          title="Excluir este item permanentemente"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">
                      STATUS <span className="text-red-500">*</span>
                    </label>
                  </div>
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
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">
                      APOIADOR(ES) ENVOLVIDO(S) <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleAddOption('apoiador')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar Novo
                      </button>
                    )}
                  </div>
                  {selectedApoiadores.length > 0 && (
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
                  )}
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="form-select w-full rounded-lg border-gray-300 focus:border-primary h-14 pr-10 appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!canManage}
                        onChange={(e) => handleSupporterSelect(e.target.value)}
                        value={supporterToManage}
                      >
                        <option value="" disabled>Selecione um apoiador...</option>
                        {configOptions.apoiador.filter(opt => !selectedApoiadores.includes(opt)).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>

                    <div className="flex gap-1">
                      {isAdmin && supporterToManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditOption('apoiador', supporterToManage)}
                            className="size-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex-shrink-0"
                            title="Renomear este item"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteOption('apoiador', supporterToManage);
                              setSupporterToManage('');
                            }}
                            className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                            title="Excluir este item permanentemente"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center min-h-[24px]">
                  <label className="text-[#111418] text-base font-medium uppercase">
                    RESUMO DO PLANEJAMENTO <span className="text-red-500">*</span>
                  </label>
                </div>
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
                <div className="flex justify-between items-center min-h-[24px]">
                  <label className="text-[#111418] text-base font-medium uppercase">META / OBJETIVO</label>
                </div>
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
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">AVALIAÇÃO PERIÓDICA</label>
                  </div>
                  <div className="relative">
                    <select
                      value={avaliacao}
                      onChange={(e) => setAvaliacao(e.target.value)}
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
                    <div className="flex justify-between items-center min-h-[24px]">
                      <label className="text-[#111418] text-base font-medium uppercase">CICLO DE AGENDA PADRÃO</label>
                    </div>
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
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">
                      DATA INICIAL <span className="text-red-500">*</span>
                    </label>
                  </div>
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
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">DATA FINAL</label>
                  </div>
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
                  <div className="flex justify-between items-center min-h-[24px]">
                    <label className="text-[#111418] text-base font-medium uppercase">CATEGORIA(S) A CAPACITAR (QUALIFICAÇÃO)</label>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleHeaderAction('categoria')}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">{categoryToManage ? 'add' : 'add_circle'}</span>
                        {categoryToManage ? 'Incluir no Plano' : 'Adicionar Novo'}
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
                        onChange={(e) => setCategoryToManage(e.target.value)}
                        value={categoryToManage}
                      >
                        <option value="" disabled>Selecione uma categoria...</option>
                        {configOptions.categoria.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                    </div>

                    <div className="flex gap-1">
                      {isAdmin && categoryToManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditOption('categoria', categoryToManage)}
                            className="size-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex-shrink-0"
                            title="Renomear este item"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteOption('categoria', categoryToManage);
                              setCategoryToManage('');
                            }}
                            className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0"
                            title="Excluir este item permanentemente"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center min-h-[24px]">
                  <label className="text-[#111418] text-base font-medium uppercase">OBSERVAÇÕES</label>
                </div>
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
