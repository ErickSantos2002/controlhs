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
  X
} from 'lucide-react';
import { PatrimoniosProvider, usePatrimonios } from '../context/PatrimoniosContext';
import PatrimonioModal from '../components/PatrimonioModal';
import PatrimonioDetalhes from '../components/PatrimonioDetalhes';
import * as XLSX from 'xlsx';
import type {
  Patrimonio,
  FiltrosPatrimonio,
  OrdenacaoPatrimonio,
  PatrimonioExportData,
  ITEMS_PER_PAGE_OPTIONS,
  STATUS_LABELS
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
  const [itensPorPagina, setItensPorPagina] = useState(10);
  
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
      setPaginaAtual(1); // Reset página ao buscar
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaLocal]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtros.categoria, filtros.setor, filtros.status, filtros.responsavel, filtros.dataInicio, filtros.dataFim]);

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
      // Toast de sucesso seria disparado aqui
    } catch (err) {
      console.error('Erro ao excluir patrimônio:', err);
      // Toast de erro seria disparado aqui
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

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Gestão de Patrimônios
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cadastre, consulte e gerencie todos os bens patrimoniais da empresa
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  bg-white dark:bg-[#2a2a2a]
                  border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                  transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
              
              <button
                onClick={handleExportarExcel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  bg-white dark:bg-[#2a2a2a]
                  border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                  transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
              
              {canCreate && (
                <button
                  onClick={() => {
                    setPatrimonioSelecionado(null);
                    setModalMode('create');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                    rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Novo Patrimônio
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                placeholder="Buscar por nome, descrição ou número de série..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-400 dark:placeholder-gray-500
                  transition-colors"
              />
            </div>
          </div>

          {/* Filtros em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              >
                <option value="todas">Todas</option>
                {categorias.map(cat => (
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
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              >
                <option value="todos">Todos</option>
                {setores.map(setor => (
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
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
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
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              >
                <option value="todos">Todos</option>
                {usuarios.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Aquisição (Início)
              </label>
              <input
                type="date"
                value={filtros.dataInicio || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Aquisição (Fim)
              </label>
              <input
                type="date"
                value={filtros.dataFim || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-[#2a2a2a]
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              />
            </div>
          </div>

          {/* Ações dos filtros */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exibindo {patrimoniosFiltrados.length} de {patrimoniosFiltrados.length} patrimônios
            </p>
            <button
              onClick={limparFiltros}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading && !patrimoniosFiltrados.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <button
                onClick={refreshData}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          ) : dadosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-3">
                Nenhum patrimônio encontrado
              </p>
              <button
                onClick={limparFiltros}
                className="px-4 py-2 text-sm font-medium text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                  rounded-lg shadow-sm hover:shadow-md
                  transition-all duration-200"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th
                        onClick={() => handleOrdenar('id')}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center gap-1">
                          ID
                          {ordenacao.campo === 'id' && (
                            ordenacao.direcao === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleOrdenar('nome')}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center gap-1">
                          Nome
                          {ordenacao.campo === 'nome' && (
                            ordenacao.direcao === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleOrdenar('numero_serie')}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center gap-1">
                          N° Série
                          {ordenacao.campo === 'numero_serie' && (
                            ordenacao.direcao === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Setor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Responsável
                      </th>
                      <th
                        onClick={() => handleOrdenar('data_aquisicao')}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center gap-1">
                          Aquisição
                          {ordenacao.campo === 'data_aquisicao' && (
                            ordenacao.direcao === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleOrdenar('valor_atual')}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center gap-1">
                          Valor Atual
                          {ordenacao.campo === 'valor_atual' && (
                            ordenacao.direcao === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {dadosPaginados.map((patrimonio) => (
                      <tr key={patrimonio.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          #{patrimonio.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {patrimonio.nome.length > 40 
                              ? `${patrimonio.nome.substring(0, 40)}...` 
                              : patrimonio.nome
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {patrimonio.numero_serie || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {getCategoriaNome(patrimonio.categoria_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {getSetorNome(patrimonio.setor_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {getResponsavelNome(patrimonio.responsavel_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(patrimonio.data_aquisicao)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(patrimonio.valor_atual)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                            ${patrimonio.status === 'ativo'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : patrimonio.status === 'manutencao'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {patrimonio.status === 'ativo' ? 'Ativo' 
                              : patrimonio.status === 'manutencao' ? 'Manutenção' 
                              : 'Baixado'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(patrimonio)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(patrimonio)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(patrimonio)}
                                disabled={deletingId === patrimonio.id}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Seletor de itens por página */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Itens por página:
                      </label>
                      <select
                        value={itensPorPagina}
                        onChange={(e) => {
                          setItensPorPagina(Number(e.target.value));
                          setPaginaAtual(1);
                        }}
                        className="px-2 py-1 border rounded
                          bg-white dark:bg-[#2a2a2a]
                          text-gray-900 dark:text-gray-100
                          border-gray-300 dark:border-gray-600
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>

                    {/* Info de registros */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {inicio} a {fim} de {patrimoniosFiltrados.length} registros
                    </div>

                    {/* Botões de paginação */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                        disabled={paginaAtual === 1}
                        className="px-3 py-1 border rounded
                          bg-white dark:bg-[#1f1f1f]
                          border-gray-300 dark:border-gray-600
                          text-gray-700 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors"
                      >
                        Anterior
                      </button>

                      <div className="flex gap-1">
                        {paginasVisiveis.map(page => (
                          <button
                            key={page}
                            onClick={() => setPaginaAtual(page)}
                            className={`px-3 py-1 border rounded transition-colors
                              ${paginaAtual === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                        disabled={paginaAtual === totalPaginas}
                        className="px-3 py-1 border rounded
                          bg-white dark:bg-[#1f1f1f]
                          border-gray-300 dark:border-gray-600
                          text-gray-700 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
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
          )}
        </div>
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
