import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Package,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { PatrimoniosProvider, usePatrimonios } from '../context/PatrimoniosContext';
import PatrimonioModal from '../components/PatrimonioModal';
import PatrimonioDetalhes from '../components/PatrimonioDetalhes';
import * as XLSX from 'xlsx';
import type {
  Patrimonio,
  FiltrosPatrimonio,
  OrdenacaoPatrimonio,
  PatrimonioExportData
} from '../types/patrimonios.types';

// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================

const PatrimoniosContent: React.FC = () => {
  const {
    patrimoniosFiltrados,
    categorias,
    setores,
    usuarios,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    loading,
    error,
    deletePatrimonio,
    refreshData
  } = usePatrimonios();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================
  
  // Modais
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [patrimonioSelecionado, setPatrimonioSelecionado] = useState<Patrimonio | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Patrimonio | null>(null);
  
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
  
  const userRole = localStorage.getItem('role')?.toLowerCase() || '';
  const canCreate = ['administrador', 'gestor'].includes(userRole);
  const canEdit = ['administrador', 'gestor'].includes(userRole);
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
  }, [filtros.categoria, filtros.setor, filtros.status, filtros.responsavel, filtros.dataInicio, filtros.dataFim]);

  // ========================================
  // KPIs CALCULADOS
  // ========================================
  
  const kpis = useMemo(() => {
    const total = patrimoniosFiltrados.length;
    const valorTotal = patrimoniosFiltrados.reduce((sum, p) => sum + (p.valor_atual || 0), 0);
    const depreciacaoTotal = patrimoniosFiltrados.reduce(
      (sum, p) => sum + ((p.valor_aquisicao || 0) - (p.valor_atual || 0)), 
      0
    );
    
    return {
      total,
      valorTotal,
      depreciacaoTotal
    };
  }, [patrimoniosFiltrados]);

  // ========================================
  // PAGINAÇÃO
  // ========================================
  
  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return patrimoniosFiltrados.slice(inicio, fim);
  }, [patrimoniosFiltrados, paginaAtual, itensPorPagina]);

  const totalPaginas = Math.ceil(patrimoniosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, patrimoniosFiltrados.length);

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
  
  const handleOrdenar = (campo: OrdenacaoPatrimonio['campo']) => {
    setOrdenacao({
      campo: campo as any,
      direcao: ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleView = (patrimonio: Patrimonio) => {
    setPatrimonioSelecionado(patrimonio);
    setModalMode('view');
  };

  const handleEdit = (patrimonio: Patrimonio) => {
    setPatrimonioSelecionado(patrimonio);
    setModalMode('edit');
  };

  const handleDeleteClick = (patrimonio: Patrimonio) => {
    setShowDeleteConfirm(patrimonio);
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    setDeletingId(showDeleteConfirm.id);
    try {
      await deletePatrimonio(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir patrimônio:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      categoria: 'todas',
      setor: 'todos',
      status: 'todos',
      responsavel: 'todos',
      dataInicio: undefined,
      dataFim: undefined
    });
    setBuscaLocal('');
  };

  const handleExportarExcel = () => {
    if (patrimoniosFiltrados.length === 0) {
      alert('Nenhum patrimônio para exportar!');
      return;
    }

    const dados: PatrimonioExportData[] = patrimoniosFiltrados.map(p => ({
      'ID': p.id,
      'Nome': p.nome,
      'Número de Série': p.numero_serie || '-',
      'Categoria': categorias.find(c => c.id === p.categoria_id)?.nome || '-',
      'Setor': setores.find(s => s.id === p.setor_id)?.nome || '-',
      'Responsável': usuarios.find(u => u.id === p.responsavel_id)?.username || '-',
      'Data Aquisição': p.data_aquisicao ? new Date(p.data_aquisicao).toLocaleDateString('pt-BR') : '-',
      'Valor Aquisição': p.valor_aquisicao?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
      'Valor Atual': p.valor_atual?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
      'Depreciação': ((p.valor_aquisicao || 0) - (p.valor_atual || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Status': p.status === 'ativo' ? 'Ativo' : p.status === 'manutencao' ? 'Em Manutenção' : 'Baixado'
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patrimônios');
    
    const fileName = `patrimonios_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ========================================
  // HELPERS
  // ========================================
  
  const getCategoriaNome = (id?: number) => categorias.find(c => c.id === id)?.nome || 'N/A';
  const getSetorNome = (id?: number) => setores.find(s => s.id === id)?.nome || 'N/A';
  const getResponsavelNome = (id?: number) => usuarios.find(u => u.id === id)?.username || 'N/A';

  const formatCurrency = (value?: number) => {
    if (value == null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusDisplay = (status?: string) => {
    if (status === 'ativo') return 'Ativo';
    if (status === 'manutencao') return 'Em Manutenção';
    if (status === 'baixado') return 'Baixado';
    return 'N/A';
  };

  const OrdenacaoIcon = ({ campo }: { campo: string }) => {
    if (ordenacao.campo !== campo) return null;
    return ordenacao.direcao === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // ========================================
  // RENDER
  // ========================================

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho - Padronizado com Dashboard */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Título e Descrição */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight">
              Gestão de Patrimônios
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gerencie todos os bens patrimoniais da organização
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                text-gray-700 dark:text-gray-300
                bg-white dark:bg-[#1f1f1f]
                border border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md
                transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={handleExportarExcel}
              disabled={loading || patrimoniosFiltrados.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-gradient-to-r from-green-500 to-emerald-600 
                text-white font-medium rounded-lg shadow-md
                hover:from-green-400 hover:to-emerald-500 
                dark:hover:from-green-600 dark:hover:to-green-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {canCreate && (
              <button
                onClick={() => setModalMode('create')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  text-white 
                  bg-blue-600 hover:bg-blue-700 
                  dark:bg-blue-500 dark:hover:bg-blue-600
                  shadow-sm hover:shadow-md
                  transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Novo Patrimônio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total de Patrimônios */}
        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Total de Patrimônios
              </p>
              <p className="text-3xl font-semibold text-blue-500 dark:text-blue-300 mt-2 tracking-tight">
                {kpis.total.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-blue-100/70 dark:bg-blue-900/50 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Valor Total
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {kpis.valorTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Depreciação Total */}
        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Depreciação Total
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {kpis.depreciacaoTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca (fixos) */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] p-5 shadow-md transition-colors">
        {/* Linha de Busca + Botão Limpar Filtros */}
        <div className="flex flex-nowrap items-center gap-3 mb-4">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou número de série..."
              value={buscaLocal}
              onChange={(e) => setBuscaLocal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg
                bg-white/95 dark:bg-[#2a2a2a]/95
                text-gray-900 dark:text-gray-100
                border border-gray-300 dark:border-[#3a3a3a]
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all"
            />
          </div>

          {/* Botão Limpar Filtros ao lado do campo */}
          <button
            onClick={limparFiltros}
            title="Limpar filtros"
            className="flex-shrink-0 flex items-center justify-center w-[48px] h-[42px]
              rounded-lg border border-gray-300 dark:border-[#3a3a3a]
              bg-white/95 dark:bg-[#2a2a2a]/95
              text-gray-600 dark:text-gray-300
              hover:bg-red-500 hover:text-white dark:hover:bg-red-600
              transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Painel de Filtros fixo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-[#2d2d2d]">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                bg-white/95 dark:bg-[#2a2a2a]/95
                text-gray-900 dark:text-gray-100
                border border-gray-300 dark:border-[#3a3a3a]
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Setor
            </label>
            <select
              value={filtros.setor}
              onChange={(e) => setFiltros({ ...filtros, setor: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                bg-white/95 dark:bg-[#2a2a2a]/95
                text-gray-900 dark:text-gray-100
                border border-gray-300 dark:border-[#3a3a3a]
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                bg-white/95 dark:bg-[#2a2a2a]/95
                text-gray-900 dark:text-gray-100
                border border-gray-300 dark:border-[#3a3a3a]
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Em Manutenção</option>
              <option value="baixado">Baixado</option>
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Responsável
            </label>
            <select
              value={filtros.responsavel}
              onChange={(e) => setFiltros({ ...filtros, responsavel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                bg-white/95 dark:bg-[#2a2a2a]/95
                text-gray-900 dark:text-gray-100
                border border-gray-300 dark:border-[#3a3a3a]
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* Tabela */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-md overflow-hidden transition-colors">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : patrimoniosFiltrados.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-[#2d2d2d]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('nome')}
                    >
                      <div className="flex items-center gap-1">
                        Nome
                        <OrdenacaoIcon campo="nome" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Setor
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('data_aquisicao')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Data Aquisição
                        <OrdenacaoIcon campo="data_aquisicao" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                      onClick={() => handleOrdenar('valor_atual')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Valor Atual
                        <OrdenacaoIcon campo="valor_atual" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Depreciação
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                  {dadosPaginados.map((patrimonio) => (
                    <tr
                      key={patrimonio.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {patrimonio.nome}
                        {patrimonio.numero_serie && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            SN: {patrimonio.numero_serie}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                        {getCategoriaNome(patrimonio.categoria_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                        {getResponsavelNome(patrimonio.responsavel_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                        {getSetorNome(patrimonio.setor_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                        {patrimonio.data_aquisicao
                          ? new Date(patrimonio.data_aquisicao).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(patrimonio.valor_atual)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(
                          (patrimonio.valor_aquisicao || 0) -
                            (patrimonio.valor_atual || 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            patrimonio.status === 'ativo'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                              : patrimonio.status === 'manutencao'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                          }`}
                        >
                          {getStatusDisplay(patrimonio.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(patrimonio)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => handleEdit(patrimonio)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(patrimonio)}
                              disabled={deletingId === patrimonio.id}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
                              title="Excluir"
                            >
                              {deletingId === patrimonio.id ? (
                                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
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

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="mt-4 px-4 pb-4">
                <div className="hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    Mostrando {inicio} a {fim} de {patrimoniosFiltrados.length} registros
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                      disabled={paginaAtual === 1}
                      className="px-3 py-1 border rounded-lg
                        bg-white/95 dark:bg-[#1e1e1e]/95
                        border-gray-300 dark:border-[#3a3a3a]
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-1">
                      {paginasVisiveis.map((page) => (
                        <button
                          key={page}
                          onClick={() => setPaginaAtual(page)}
                          className={`px-3 py-1 border rounded-lg transition-colors ${
                            paginaAtual === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white/95 dark:bg-[#1e1e1e]/95 border-gray-300 dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="px-3 py-1 border rounded-lg
                        bg-white/95 dark:bg-[#1e1e1e]/95
                        border-gray-300 dark:border-[#3a3a3a]
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum patrimônio encontrado com os filtros selecionados
            </p>
            <button
              onClick={limparFiltros}
              className="mt-2 px-3 py-1.5 text-sm font-medium rounded-lg
                text-white bg-blue-600 hover:bg-blue-700
                dark:bg-blue-500 dark:hover:bg-blue-600
                shadow-sm hover:shadow-md transition-all duration-200"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <PatrimonioModal
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setPatrimonioSelecionado(null);
          }}
          patrimonio={modalMode === 'edit' ? patrimonioSelecionado : null}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}

      {modalMode === 'view' && (
        <PatrimonioDetalhes
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setPatrimonioSelecionado(null);
          }}
          patrimonio={patrimonioSelecionado}
          onEdit={(p) => {
            setPatrimonioSelecionado(p);
            setModalMode('edit');
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirmar Exclusão
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja excluir o patrimônio <strong>{showDeleteConfirm.nome}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                    bg-white dark:bg-[#2a2a2a]
                    border border-gray-300 dark:border-gray-600
                    rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                    transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600
                    rounded-lg shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  {deletingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Sim, Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL (COM PROVIDER)
// ========================================

const Patrimonios: React.FC = () => {
  return (
    <PatrimoniosProvider>
      <PatrimoniosContent />
    </PatrimoniosProvider>
  );
};

export default Patrimonios;