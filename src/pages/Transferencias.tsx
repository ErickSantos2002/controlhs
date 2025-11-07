import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { TransferenciasProvider, useTransferencias } from '../context/TransferenciasContext';
import TransferenciaModal from '../components/TransferenciaModal';
import TransferenciaDetalhes from '../components/TransferenciaDetalhes';
import TransferenciaAprovacao from '../components/TransferenciaAprovacao';
import * as XLSX from 'xlsx';
import {
  Transferencia,
  TransferenciaComStatus,
  FiltrosTransferencia,
  OrdenacaoTransferencia,
  TransferenciaExportData,
  STATUS_LABELS,
  STATUS_COLORS,
  TipoAprovacao
} from '../types/transferencias.types';

// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================

const TransferenciasContent: React.FC = () => {
  const {
    transferenciasFiltradas,
    patrimonios,
    setores,
    usuarios,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    loading,
    error,
    kpis,
    podeAprovar,
    podeEfetivar,
    deleteTransferencia,
    efetivarTransferencia,
    refreshData
  } = useTransferencias();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================
  
  // Modais
  const [modalCriar, setModalCriar] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState<Transferencia | null>(null);
  const [modalAprovacao, setModalAprovacao] = useState<{ transferencia: Transferencia; tipo: TipoAprovacao } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Transferencia | null>(null);
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Busca local (com debounce)
  const [buscaLocal, setBuscaLocal] = useState('');
  
  // Estados UI
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [efetivandoId, setEfetivandoId] = useState<number | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ========================================
  // PERMISSÕES
  // ========================================
  
  const userRole = localStorage.getItem('role')?.toLowerCase() || '';
  const canCreate = true; // Todos podem solicitar transferências
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
  }, [filtros.status, filtros.setorOrigem, filtros.setorDestino, filtros.patrimonio, 
      filtros.solicitante, filtros.aprovador, filtros.dataInicio, filtros.dataFim]);

  // ========================================
  // PAGINAÇÃO
  // ========================================
  
  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return transferenciasFiltradas.slice(inicio, fim);
  }, [transferenciasFiltradas, paginaAtual, itensPorPagina]);

  const totalPaginas = Math.ceil(transferenciasFiltradas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, transferenciasFiltradas.length);

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
  
  const handleOrdenar = (campo: OrdenacaoTransferencia['campo']) => {
    setOrdenacao({
      campo: campo as any,
      direcao: ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleView = (transferencia: Transferencia) => {
    setModalDetalhes(transferencia);
  };

  const handleAprovar = (transferencia: Transferencia) => {
    setModalAprovacao({ transferencia, tipo: 'aprovar' });
  };

  const handleRejeitar = (transferencia: Transferencia) => {
    setModalAprovacao({ transferencia, tipo: 'rejeitar' });
  };

  const handleEfetivar = async (transferencia: Transferencia) => {
    if (!window.confirm('Confirma a efetivação desta transferência? O patrimônio será atualizado com o novo setor e responsável.')) {
      return;
    }

    setEfetivandoId(transferencia.id);
    try {
      await efetivarTransferencia(transferencia.id);
      await refreshData();
    } catch (err) {
      console.error('Erro ao efetivar transferência:', err);
    } finally {
      setEfetivandoId(null);
    }
  };

  const handleDeleteClick = (transferencia: Transferencia) => {
    setShowDeleteConfirm(transferencia);
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    setDeletingId(showDeleteConfirm.id);
    try {
      await deleteTransferencia(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir transferência:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: 'todos',
      setorOrigem: 'todos',
      setorDestino: 'todos',
      patrimonio: 'todos',
      solicitante: 'todos',
      aprovador: 'todos',
      dataInicio: undefined,
      dataFim: undefined
    });
    setBuscaLocal('');
  };

  const handleExportarExcel = () => {
    if (transferenciasFiltradas.length === 0) {
      alert('Nenhuma transferência para exportar!');
      return;
    }

    const dados: TransferenciaExportData[] = transferenciasFiltradas.map(t => {
      const patrimonio = patrimonios.find(p => p.id === t.patrimonio_id);
      const setorOrigem = setores.find(s => s.id === t.setor_origem_id);
      const setorDestino = setores.find(s => s.id === t.setor_destino_id);
      const responsavelOrigem = usuarios.find(u => u.id === t.responsavel_origem_id);
      const responsavelDestino = usuarios.find(u => u.id === t.responsavel_destino_id);
      const solicitante = usuarios.find(u => u.id === t.solicitante_id);
      const aprovador = t.aprovado_por ? usuarios.find(u => u.id === t.aprovado_por) : null;
      
      return {
        'ID': t.id,
        'Patrimônio': patrimonio?.nome || 'N/A',
        'Setor Origem': setorOrigem?.nome || 'N/A',
        'Setor Destino': setorDestino?.nome || 'N/A',
        'Responsável Origem': responsavelOrigem?.username || 'N/A',
        'Responsável Destino': responsavelDestino?.username || 'N/A',
        'Solicitante': solicitante?.username || 'N/A',
        'Data Solicitação': t.data_transferencia ? new Date(t.data_transferencia).toLocaleDateString('pt-BR') : 'N/A',
        'Status': STATUS_LABELS[t.status],
        'Aprovador': aprovador?.username || '-',
        'Data Aprovação': (t as any).data_aprovacao ? new Date((t as any).data_aprovacao).toLocaleDateString('pt-BR') : 'N/A',
        'Motivo': t.motivo || 'N/A'
      };
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transferencias');
    
    const dataHoje = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `transferencias_${dataHoje}.xlsx`);
  };

  // ========================================
  // HELPERS
  // ========================================
  
  const getPatrimonioNome = (patrimonio_id: number): string => {
    const patrimonio = patrimonios.find(p => p.id === patrimonio_id);
    return patrimonio?.nome || 'N/A';
  };

  const getSetorNome = (setor_id?: number): string => {
    if (!setor_id) return 'N/A';
    const setor = setores.find(s => s.id === setor_id);
    return setor?.nome || 'N/A';
  };

  const getUsuarioNome = (user_id?: number): string => {
    if (!user_id) return 'N/A';
    const user = usuarios.find(u => u.id === user_id);
    return user?.username || 'N/A';
  };

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ArrowRightLeft className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                Gestão de Transferências
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Controle completo das movimentações de patrimônio entre setores e responsáveis
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {canCreate && (
                <button
                  onClick={() => setModalCriar(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                    dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm 
                    rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Nova Transferência
                </button>
              )}
              
              <button
                onClick={handleExportarExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a2a2a] 
                  border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                  hover:bg-gray-50 dark:hover:bg-[#333333] font-medium text-sm rounded-lg 
                  transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
              
              <button
                onClick={() => refreshData()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 
                  hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm rounded-lg 
                  transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {kpis.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Total de transferências
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {kpis.pendentes}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Aguardando aprovação
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovadas (Mês)</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {kpis.aprovadasMes}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Aprovadas no mês
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitadas (Mês)</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {kpis.rejeitadasMes}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Rejeitadas no mês
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {/* Busca e Toggle Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={buscaLocal}
                  onChange={(e) => setBuscaLocal(e.target.value)}
                  placeholder="Buscar por patrimônio ou motivo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 
                hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 
                font-medium text-sm rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Painel de Filtros */}
          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="concluida">Concluída</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>
              </div>

              {/* Setor Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Setor Origem
                </label>
                <select
                  value={filtros.setorOrigem}
                  onChange={(e) => setFiltros({ ...filtros, setorOrigem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                >
                  <option value="todos">Todos</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              {/* Setor Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Setor Destino
                </label>
                <select
                  value={filtros.setorDestino}
                  onChange={(e) => setFiltros({ ...filtros, setorDestino: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                >
                  <option value="todos">Todos</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              {/* Patrimônio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patrimônio
                </label>
                <select
                  value={filtros.patrimonio}
                  onChange={(e) => setFiltros({ ...filtros, patrimonio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                >
                  <option value="todos">Todos</option>
                  {patrimonios.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.numero_serie ? `(${p.numero_serie})` : ''}
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
                  value={filtros.dataInicio || ''}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent transition-colors"
                />
              </div>

              {/* Botão Limpar Filtros */}
              <div className="flex items-end">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 
                    hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 
                    font-medium text-sm rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Exibindo <span className="font-medium">{transferenciasFiltradas.length}</span> transferência(s)
          </div>
        </div>

        {/* Tabela de Transferências */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-900 dark:text-gray-100 font-medium">Erro ao carregar dados</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{error}</p>
                <button
                  onClick={() => refreshData()}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 
                    dark:hover:bg-blue-600 text-white font-medium text-sm rounded-lg 
                    transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : dadosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ArrowRightLeft className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                Nenhuma transferência encontrada
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {transferenciasFiltradas.length === 0 && filtros.busca === '' && filtros.status === 'todos' 
                  ? 'Clique em "Nova Transferência" para começar'
                  : 'Tente ajustar os filtros para ver mais resultados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {ordenacao.campo === 'id' && (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('patrimonio_nome')}
                    >
                      <div className="flex items-center gap-1">
                        Patrimônio
                        {ordenacao.campo === 'patrimonio_nome' && (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      De → Para (Setor)
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      De → Para (Responsável)
                    </th>
                    
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('data_transferencia')}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        {ordenacao.campo === 'data_transferencia' && (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {ordenacao.campo === 'status' && (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aprovador
                    </th>
                    
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dadosPaginados.map((transferencia) => (
                    <tr key={transferencia.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{transferencia.id}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {getPatrimonioNome(transferencia.patrimonio_id)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{getSetorNome(transferencia.setor_origem_id)}</span>
                          <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span>{getSetorNome(transferencia.setor_destino_id)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{getUsuarioNome(transferencia.responsavel_origem_id)}</span>
                          <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span>{getUsuarioNome(transferencia.responsavel_destino_id)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transferencia.data_transferencia)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[transferencia.status]}`}>
                          {STATUS_LABELS[transferencia.status]}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transferencia.aprovado_por ? getUsuarioNome(transferencia.aprovado_por) : '-'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(transferencia)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 
                              dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {transferencia.status === 'pendente' && podeAprovar(transferencia) && (
                            <>
                              <button
                                onClick={() => handleAprovar(transferencia)}
                                className="p-1 text-green-600 hover:bg-green-50 dark:text-green-400 
                                  dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Aprovar"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleRejeitar(transferencia)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:text-red-400 
                                  dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Rejeitar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {transferencia.status === 'aprovada' && podeEfetivar(transferencia) && (
                            <button
                              onClick={() => handleEfetivar(transferencia)}
                              disabled={efetivandoId === transferencia.id}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 
                                dark:hover:bg-blue-900/20 rounded transition-colors 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Efetivar Transferência"
                            >
                              {efetivandoId === transferencia.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ArrowRightLeft className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          {canDelete && transferencia.status !== 'concluida' && (
                            <button
                              onClick={() => handleDeleteClick(transferencia)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:text-red-400 
                                dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Excluir"
                              disabled={deletingId === transferencia.id}
                            >
                              {deletingId === transferencia.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
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
          {dadosPaginados.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#2a2a2a] border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando <span className="font-medium">{inicio}</span> até{' '}
                  <span className="font-medium">{fim}</span> de{' '}
                  <span className="font-medium">{transferenciasFiltradas.length}</span> resultados
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 
                      rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                      bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300"
                  >
                    Anterior
                  </button>
                  
                  {paginasVisiveis.map(pagina => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaAtual(pagina)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        pagina === paginaAtual
                          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333333] bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 
                      rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                      bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
            <div className="flex min-h-full items-center justify-center">
              <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Confirmar Exclusão
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tem certeza que deseja excluir a transferência #{showDeleteConfirm.id}? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                      bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600
                      rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deletingId === showDeleteConfirm.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                      hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 
                      rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === showDeleteConfirm.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <TransferenciaModal
        isOpen={modalCriar}
        onClose={() => setModalCriar(false)}
        onSuccess={() => {
          setModalCriar(false);
          refreshData();
        }}
      />
      
      <TransferenciaDetalhes
        isOpen={!!modalDetalhes}
        onClose={() => setModalDetalhes(null)}
        transferencia={modalDetalhes}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
        onEfetivar={handleEfetivar}
      />
      
      {modalAprovacao && (
        <TransferenciaAprovacao
          isOpen={true}
          onClose={() => setModalAprovacao(null)}
          transferencia={modalAprovacao.transferencia}
          tipo={modalAprovacao.tipo}
          onSuccess={() => {
            setModalAprovacao(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};

// ========================================
// COMPONENTE WRAPPER COM PROVIDER
// ========================================

const Transferencias: React.FC = () => {
  return (
    <TransferenciasProvider>
      <TransferenciasContent />
    </TransferenciasProvider>
  );
};

export default Transferencias;
