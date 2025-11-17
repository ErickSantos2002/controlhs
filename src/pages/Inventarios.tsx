import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  InventarioProvider,
  useInventario,
} from '../context/InventarioContext';
import InventarioModal from '../components/InventarioModal';
import InventarioDetalhes from '../components/InventarioDetalhes';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';

// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================

const InventariosContent: React.FC = () => {
  const { user } = useAuth();
  const {
    inventariosFiltrados,
    patrimonios,
    categorias,
    setores,
    usuarios,
    filtros,
    setFiltros,
    kpis,
    loading,
    error,
    deleteInventario,
    refreshData,
  } = useInventario();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================

  // Modais
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null,
  );
  const [inventarioSelecionado, setInventarioSelecionado] = useState<any | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Busca local (com debounce)
  const [buscaLocal, setBuscaLocal] = useState('');

  // Estados UI
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ========================================
  // PERMISSÕES
  // ========================================

  const userRole = user?.role?.toLowerCase() || '';
  const canCreate = ['administrador', 'gestor', 'gerente'].includes(userRole);
  const canEdit = ['administrador', 'gestor', 'gerente'].includes(userRole);
  const canDelete = userRole === 'administrador';

  // ========================================
  // EFEITOS
  // ========================================

  // Atualiza busca no contexto com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ ...filtros, busca: buscaLocal });
      setPaginaAtual(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaLocal]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [
    filtros.situacao,
    filtros.responsavel_id,
    filtros.data_inicio,
    filtros.data_fim,
  ]);

  // ========================================
  // PAGINAÇÃO
  // ========================================

  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return inventariosFiltrados.slice(inicio, fim);
  }, [inventariosFiltrados, paginaAtual]);

  const totalPaginas = Math.ceil(inventariosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(
    paginaAtual * itensPorPagina,
    inventariosFiltrados.length,
  );

  const paginasVisiveis = useMemo(() => {
    const window = Math.min(5, totalPaginas);
    let start = 1;
    if (totalPaginas > 5) {
      if (paginaAtual <= 3) start = 1;
      else if (paginaAtual >= totalPaginas - 2) start = totalPaginas - 4;
      else start = paginaAtual - 2;
    }
    return Array.from({ length: window }, (_, i) => start + i);
  }, [paginaAtual, totalPaginas]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleView = (inventario: any) => {
    setInventarioSelecionado(inventario);
    setModalMode('view');
  };

  const handleEdit = (inventario: any) => {
    setInventarioSelecionado(inventario);
    setModalMode('edit');
  };

  const handleDeleteClick = (inventario: any) => {
    setShowDeleteConfirm(inventario);
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    setDeletingId(showDeleteConfirm.id);
    try {
      await deleteInventario(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir registro de inventário:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      situacao: 'todos',
      responsavel_id: 'todos',
      data_inicio: '',
      data_fim: '',
    });
    setBuscaLocal('');
  };

  const handleExportarExcel = () => {
    if (inventariosFiltrados.length === 0) {
      alert('Nenhum registro de inventário para exportar!');
      return;
    }

    const dados = inventariosFiltrados.map((inv) => {
      const patrimonio = patrimonios.find((p) => p.id === inv.patrimonio_id);
      const responsavel = usuarios.find((u) => u.id === inv.responsavel_id);

      return {
        ID: inv.id,
        'Patrimônio': patrimonio?.nome || 'N/A',
        'Número de Série': patrimonio?.numero_serie || '-',
        'Categoria': categorias.find((c) => c.id === patrimonio?.categoria_id)
          ?.nome || '-',
        'Setor': setores.find((s) => s.id === patrimonio?.setor_id)?.nome || '-',
        'Situação': getSituacaoLabel(inv.situacao),
        'Responsável': responsavel?.username || '-',
        'Data Verificação': inv.data_verificacao
          ? new Date(inv.data_verificacao).toLocaleDateString('pt-BR')
          : '-',
        'Observações': inv.observacoes || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventários');

    const fileName = `inventarios_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ========================================
  // HELPERS
  // ========================================

  const getPatrimonioNome = (id: number) =>
    patrimonios.find((p) => p.id === id)?.nome || 'N/A';

  const getResponsavelNome = (id?: number | null) =>
    usuarios.find((u) => u.id === id)?.username || '-';

  const getSituacaoLabel = (situacao: string) => {
    const labels: { [key: string]: string } = {
      encontrado: 'Encontrado',
      nao_encontrado: 'Não Encontrado',
      divergencia: 'Divergência',
      conferido: 'Conferido',
      pendente: 'Pendente',
    };
    return labels[situacao] || situacao;
  };

  const getSituacaoBadge = (situacao: string) => {
    const configs: {
      [key: string]: { color: string; bgColor: string; icon: any };
    } = {
      encontrado: {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle,
      },
      nao_encontrado: {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: XCircle,
      },
      divergencia: {
        color: 'text-orange-700 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        icon: AlertTriangle,
      },
      conferido: {
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: CheckCircle,
      },
      pendente: {
        color: 'text-gray-700 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        icon: Clock,
      },
    };

    const config = configs[situacao] || configs.pendente;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {getSituacaoLabel(situacao)}
      </span>
    );
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // ========================================
  // LOADING & ERROR STATES
  // ========================================

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Inventário
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerenciamento de verificações patrimoniais
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          {canCreate && (
            <button
              onClick={() => {
                setInventarioSelecionado(null);
                setModalMode('create');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Verificação
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {kpis.total}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conferidos
              </p>
              <p className="text-2xl font-bold text-green-600">
                {kpis.conferidos}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não Encontrados
              </p>
              <p className="text-2xl font-bold text-red-600">
                {kpis.naoEncontrados}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                % Conferido
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {kpis.percentualConferido.toFixed(1)}%
              </p>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${kpis.percentualConferido}, 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                placeholder="Nome do patrimônio..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Situação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Situação
            </label>
            <select
              value={filtros.situacao}
              onChange={(e) =>
                setFiltros({ ...filtros, situacao: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todas</option>
              <option value="pendente">Pendente</option>
              <option value="conferido">Conferido</option>
              <option value="encontrado">Encontrado</option>
              <option value="nao_encontrado">Não Encontrado</option>
              <option value="divergencia">Divergência</option>
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsável
            </label>
            <select
              value={filtros.responsavel_id}
              onChange={(e) =>
                setFiltros({ ...filtros, responsavel_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, data_inicio: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) =>
                setFiltros({ ...filtros, data_fim: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </button>
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg overflow-hidden">
        {/* Cabeçalho da tabela */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2d2d2d]">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {inicio} a {fim} de {inventariosFiltrados.length}{' '}
            registros
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : dadosPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum registro encontrado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data Verificação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                {dadosPaginados.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{inv.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getPatrimonioNome(inv.patrimonio_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getSituacaoBadge(inv.situacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getResponsavelNome(inv.responsavel_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(inv.data_verificacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(inv)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(inv)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(inv)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#2d2d2d]">
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
              disabled={paginaAtual === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#2d2d2d] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="hidden md:flex gap-2">
              {paginasVisiveis.map((num) => (
                <button
                  key={num}
                  onClick={() => setPaginaAtual(num)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    paginaAtual === num
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#2d2d2d] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))
              }
              disabled={paginaAtual === totalPaginas}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#2d2d2d] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalMode && modalMode !== 'view' && (
        <InventarioModal
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setInventarioSelecionado(null);
          }}
          mode={modalMode}
          inventario={inventarioSelecionado}
          onSuccess={() => {
            refreshData();
            setModalMode(null);
            setInventarioSelecionado(null);
          }}
        />
      )}

      {modalMode === 'view' && inventarioSelecionado && (
        <InventarioDetalhes
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setInventarioSelecionado(null);
          }}
          inventario={inventarioSelecionado}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este registro de inventário? Esta
              ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId !== null && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPONENTE EXPORTADO COM PROVIDER
// ========================================

const Inventarios: React.FC = () => {
  return (
    <InventarioProvider>
      <InventariosContent />
    </InventarioProvider>
  );
};

export default Inventarios;
