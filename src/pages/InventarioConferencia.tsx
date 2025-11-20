import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Loader2,
  AlertCircle as AlertCircleIcon,
  Save,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import {
  getInventario,
  getEstatisticasInventario,
  listItensInventario,
  atualizarItemInventario,
  adicionarItemInventario,
  removerItemInventario,
  finalizarInventario,
  cancelarInventario,
} from '../services/controlapi';
import type {
  InventarioComItens,
  ItemInventario,
  InventarioStats,
  SituacaoItem,
} from '../types/inventarios.types';
import { useAuth } from '../hooks/useAuth';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const InventarioConferencia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ========================================
  // ESTADOS
  // ========================================

  const [inventario, setInventario] = useState<InventarioComItens | null>(null);
  const [stats, setStats] = useState<InventarioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buscaLocal, setBuscaLocal] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('todos');
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingObservacoes, setEditingObservacoes] = useState('');
  const [editingSituacao, setEditingSituacao] = useState<SituacaoItem | ''>('');
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [observacoesFinais, setObservacoesFinais] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  // ========================================
  // PERMISSÕES
  // ========================================

  const userRole = user?.role?.toLowerCase() || '';
  const canEdit = ['administrador', 'gerente'].includes(userRole);

  // ========================================
  // FETCH DE DADOS
  // ========================================

  const fetchData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [invData, statsData] = await Promise.all([
        getInventario(parseInt(id)),
        getEstatisticasInventario(parseInt(id)),
      ]);

      setInventario(invData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(
        err.response?.data?.detail || 'Erro ao carregar dados do inventário',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ========================================
  // FILTROS
  // ========================================

  const itensFiltrados = useMemo(() => {
    if (!inventario) return [];

    let resultado = [...inventario.itens];

    // Filtro de busca
    if (buscaLocal) {
      const buscaLower = buscaLocal.toLowerCase();
      resultado = resultado.filter((item) => {
        return (
          item.patrimonio?.nome?.toLowerCase().includes(buscaLower) ||
          item.patrimonio?.numero_serie?.toLowerCase().includes(buscaLower)
        );
      });
    }

    // Filtro de situação
    if (filtroSituacao && filtroSituacao !== 'todos') {
      resultado = resultado.filter((item) => item.situacao === filtroSituacao);
    }

    return resultado;
  }, [inventario, buscaLocal, filtroSituacao]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleEditItem = (item: ItemInventario) => {
    setEditingItemId(item.id);
    setEditingSituacao(item.situacao);
    setEditingObservacoes(item.observacoes || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingSituacao('');
    setEditingObservacoes('');
  };

  const handleSaveItem = async (itemId: number) => {
    if (!id || !editingSituacao) return;

    setSavingItemId(itemId);
    try {
      await atualizarItemInventario(parseInt(id), itemId, {
        situacao: editingSituacao,
        observacoes: editingObservacoes || null,
      });

      // Atualiza localmente
      setInventario((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          itens: prev.itens.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  situacao: editingSituacao,
                  observacoes: editingObservacoes || null,
                  conferido_por: user?.id,
                  data_conferencia: new Date().toISOString(),
                }
              : item,
          ),
        };
      });

      // Atualiza estatísticas
      await getEstatisticasInventario(parseInt(id)).then(setStats);

      handleCancelEdit();
    } catch (err: any) {
      console.error('Erro ao salvar item:', err);
      alert(err.response?.data?.detail || 'Erro ao salvar alterações do item');
    } finally {
      setSavingItemId(null);
    }
  };

  const handleFinalizar = async () => {
    if (!id) return;

    setFinalizing(true);
    try {
      await finalizarInventario(parseInt(id), {
        observacoes_finais: observacoesFinais || null,
      });

      alert('Inventário finalizado com sucesso!');
      navigate('/inventarios');
    } catch (err: any) {
      console.error('Erro ao finalizar inventário:', err);
      alert(err.response?.data?.detail || 'Erro ao finalizar inventário');
    } finally {
      setFinalizing(false);
      setShowFinalizarModal(false);
    }
  };

  const handleCancelar = async () => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja cancelar este inventário?')) return;

    try {
      await cancelarInventario(parseInt(id));
      alert('Inventário cancelado!');
      navigate('/inventarios');
    } catch (err: any) {
      console.error('Erro ao cancelar inventário:', err);
      alert(err.response?.data?.detail || 'Erro ao cancelar inventário');
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getSituacaoLabel = (situacao: string) => {
    const labels: { [key: string]: string } = {
      encontrado: 'Encontrado',
      nao_encontrado: 'Não Encontrado',
      divergencia: 'Divergência',
      conferido: 'Conferido',
    };
    return labels[situacao] || situacao;
  };

  const getSituacaoColor = (situacao: string) => {
    const colors: { [key: string]: string } = {
      encontrado: 'text-green-600',
      nao_encontrado: 'text-red-600',
      divergencia: 'text-orange-600',
      conferido: 'text-blue-600',
    };
    return colors[situacao] || 'text-gray-600';
  };

  const getSituacaoIcon = (situacao: string) => {
    const icons: { [key: string]: any } = {
      encontrado: CheckCircle,
      nao_encontrado: XCircle,
      divergencia: AlertTriangle,
      conferido: CheckCircle,
    };
    return icons[situacao] || Package;
  };

  // ========================================
  // LOADING & ERROR STATES
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !inventario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erro ao carregar inventário
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Inventário não encontrado'}
          </p>
          <button
            onClick={() => navigate('/inventarios')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Inventários
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl shadow-md border border-gray-200 dark:border-[#2d2d2d] p-6 mb-6 transition-colors">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/inventarios')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Inventários
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Título e descrição */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight">
              {inventario.titulo}
            </h1>

            {inventario.descricao && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {inventario.descricao}
              </p>
            )}
          </div>

          {/* Botões de ação */}
          {canEdit && inventario.status === 'em_andamento' && (
            <div className="flex flex-wrap gap-2">
              {/* Cancelar */}
              <button
                onClick={handleCancelar}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                  text-gray-700 dark:text-gray-300
                  bg-white dark:bg-[#1f1f1f]
                  border border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                  shadow-sm hover:shadow-md
                  transition-all duration-200"
              >
                Cancelar Inventário
              </button>

              {/* Finalizar */}
              <button
                onClick={() => setShowFinalizarModal(true)}
                className="flex items-center gap-2 px-4 py-2 
                  bg-gradient-to-r from-green-500 to-emerald-600
                  text-white font-medium rounded-lg shadow-md
                  hover:from-green-400 hover:to-emerald-500
                  dark:hover:from-green-600 dark:hover:to-green-500
                  transition-all duration-300"
              >
                Finalizar Inventário
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total de Itens */}
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Total de Itens
                </p>
                <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400 mt-2 tracking-tight">
                  {stats.total_itens}
                </p>
              </div>
              <div className="bg-blue-100/70 dark:bg-blue-900/40 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Encontrados */}
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Encontrados
                </p>
                <p className="text-3xl font-semibold text-green-600 dark:text-green-400 mt-2 tracking-tight">
                  {stats.encontrados}
                </p>
              </div>
              <div className="bg-green-100/70 dark:bg-green-900/40 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Não Encontrados */}
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Não Encontrados
                </p>
                <p className="text-3xl font-semibold text-red-600 dark:text-red-400 mt-2 tracking-tight">
                  {stats.nao_encontrados}
                </p>
              </div>
              <div className="bg-red-100/70 dark:bg-red-900/40 p-3 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Divergências */}
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Divergências
                </p>
                <p className="text-3xl font-semibold text-orange-600 dark:text-orange-400 mt-2 tracking-tight">
                  {stats.divergencias}
                </p>
              </div>
              <div className="bg-orange-100/70 dark:bg-orange-900/40 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Conferidos */}
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Conferidos
                </p>
                <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400 mt-2 tracking-tight">
                  {stats.conferidos}
                </p>
              </div>
              <div className="bg-blue-100/70 dark:bg-blue-900/40 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Patrimônio
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                placeholder="Nome ou número de série..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Situação
            </label>
            <select
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="encontrado">Encontrado</option>
              <option value="nao_encontrado">Não Encontrado</option>
              <option value="divergencia">Divergência</option>
              <option value="conferido">Conferido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2d2d2d]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Itens do Inventário ({itensFiltrados.length})
          </h2>
        </div>

        {itensFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum item encontrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
            {itensFiltrados.map((item) => {
              const Icon = getSituacaoIcon(item.situacao);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-6 transition-colors ${
                    isEditing
                      ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-600/60'
                      : 'hover:bg-gray-100 dark:hover:bg-[#333333]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.patrimonio?.nome || 'N/A'}
                        </h3>
                        <Icon
                          className={`w-5 h-5 ${getSituacaoColor(item.situacao)}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Número de Série
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.patrimonio?.numero_serie || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Situação
                          </p>
                          <p
                            className={`font-medium ${getSituacaoColor(item.situacao)}`}
                          >
                            {getSituacaoLabel(item.situacao)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Data Conferência
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.data_conferencia
                              ? new Date(
                                  item.data_conferencia,
                                ).toLocaleDateString('pt-BR')
                              : '-'}
                          </p>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Situação
                            </label>
                            <select
                              value={editingSituacao}
                              onChange={(e) =>
                                setEditingSituacao(
                                  e.target.value as SituacaoItem,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
                              <option value="encontrado">Encontrado</option>
                              <option value="nao_encontrado">
                                Não Encontrado
                              </option>
                              <option value="divergencia">Divergência</option>
                              <option value="conferido">Conferido</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Observações
                            </label>
                            <textarea
                              value={editingObservacoes}
                              onChange={(e) =>
                                setEditingObservacoes(e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Adicione observações sobre este item..."
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveItem(item.id)}
                              disabled={
                                !editingSituacao || savingItemId === item.id
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
               hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {savingItemId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Salvar
                            </button>

                            <button
                              onClick={handleCancelEdit}
                              disabled={savingItemId === item.id}
                              className="px-4 py-2 rounded-lg transition-colors
               bg-red-100 dark:bg-red-900/30 
               text-red-700 dark:text-red-300
               hover:bg-red-200 dark:hover:bg-red-900/50 
               disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.observacoes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Observações:
                              </p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {item.observacoes}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!isEditing &&
                      canEdit &&
                      inventario.status === 'em_andamento' && (
                        <button
                          onClick={() => handleEditItem(item)}
                          className="ml-4 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Editar"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          
        )}
      </div>

      {/* Modal Finalizar */}
      {showFinalizarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !finalizing && setShowFinalizarModal(false)}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Finalizar Inventário
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações Finais (opcional)
              </label>
              <textarea
                value={observacoesFinais}
                onChange={(e) => setObservacoesFinais(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicione observações sobre o inventário..."
              />
            </div>

            {stats && stats.pendentes > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Atenção:</strong> Existem {stats.pendentes} itens
                  ainda não conferidos.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowFinalizarModal(false)}
                disabled={finalizing}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizar}
                disabled={finalizing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {finalizing && <Loader2 className="w-4 h-4 animate-spin" />}
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioConferencia;
