import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  X,
  Eye,
  Check,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { BaixasProvider, useBaixas } from '../context/BaixasContext';
import BaixaModal from '../components/BaixaModal';
import BaixaDetalhes from '../components/BaixaDetalhes';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import type { Baixa, OrdenacaoBaixa, BaixaExportData } from '../types/baixas.types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TIPO_BAIXA_LABELS,
  TIPO_BAIXA_COLORS,
} from '../types/baixas.types';

// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================

const BaixasContent: React.FC = () => {
  const { user } = useAuth();
  const {
    baixasFiltradas,
    patrimonios,
    usuarios,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    loading,
    error,
    kpis,
    podeAprovar,
    aprovarBaixa,
    rejeitarBaixa,
    refreshData,
  } = useBaixas();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================

  const [modalCriar, setModalCriar] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState<Baixa | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [buscaLocal, setBuscaLocal] = useState('');

  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'administrador';

  // Verificação de permissão para criar baixa (apenas Gerente e Administrador)
  const podeCriarBaixa = useMemo(() => {
    const role = user?.role || '';
    return role === 'Administrador' || role === 'Gerente';
  }, [user]);

  // ========================================
  // EFEITOS
  // ========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ ...filtros, busca: buscaLocal });
      setPaginaAtual(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaLocal]);

  // ========================================
  // PAGINAÇÃO
  // ========================================

  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return baixasFiltradas.slice(inicio, fim);
  }, [baixasFiltradas, paginaAtual]);

  const totalPaginas = Math.ceil(baixasFiltradas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, baixasFiltradas.length);

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

  const handleOrdenar = (campo: OrdenacaoBaixa['campo']) => {
    setOrdenacao({
      campo: campo as any,
      direcao:
        ordenacao.campo === campo && ordenacao.direcao === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const handleView = (baixa: Baixa) => {
    setModalDetalhes(baixa);
  };

  const handleAprovar = async (baixa: Baixa) => {
    try {
      await aprovarBaixa(baixa.id);
      await refreshData();
    } catch (err) {
      console.error('Erro ao aprovar baixa:', err);
    }
  };

  const handleRejeitar = async (baixa: Baixa) => {
    const motivo = window.prompt('Motivo da rejeição:');
    if (!motivo) return;

    try {
      await rejeitarBaixa(baixa.id, motivo);
      await refreshData();
    } catch (err) {
      console.error('Erro ao rejeitar baixa:', err);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: 'todos',
      tipo: 'todos',
      patrimonio: 'todos',
      solicitante: 'todos',
      aprovador: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
    });
    setBuscaLocal('');
  };

  const handleExportarExcel = () => {
    if (baixasFiltradas.length === 0) {
      alert('Nenhuma baixa para exportar!');
      return;
    }

    const dados: BaixaExportData[] = baixasFiltradas.map((b) => {
      const patrimonio = patrimonios.find((p) => p.id === b.patrimonio_id);
      const aprovador = b.aprovado_por
        ? usuarios.find((u) => u.id === b.aprovado_por)
        : null;

      return {
        ID: b.id,
        Patrimônio: patrimonio?.nome || 'N/A',
        'Tipo de Baixa': TIPO_BAIXA_LABELS[b.tipo],
        Motivo: b.motivo || 'N/A',
        Status: STATUS_LABELS[b.status],
        Responsável:
          aprovador?.username ||
          (b.rejeitado_por
            ? usuarios.find((u) => u.id === b.rejeitado_por)?.username || '-'
            : '-'),
      };
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Baixas');

    const dataHoje = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `baixas_${dataHoje}.xlsx`);
  };

  const getPatrimonioNome = (patrimonio_id: number): string => {
    const patrimonio = patrimonios.find((p) => p.id === patrimonio_id);
    return patrimonio?.nome || 'N/A';
  };

  const getUsuarioNome = (user_id?: number): string => {
    if (!user_id) return 'N/A';
    const user = usuarios.find((u) => u.id === user_id);
    return user?.username || 'N/A';
  };


  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl shadow-md border border-gray-200 dark:border-[#2d2d2d] p-6 mb-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Título e descrição */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight">
              Baixas Patrimoniais
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Controle de descartes, perdas, vendas e doações de patrimônio
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2">
            
            {/* Atualizar */}
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

            {/* Exportar */}
            <button
              onClick={handleExportarExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-gradient-to-r from-green-500 to-emerald-600
                text-white font-medium rounded-lg shadow-md
                hover:from-green-400 hover:to-emerald-500
                dark:hover:from-green-600 dark:hover:to-green-500
                transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {/* Criar nova baixa */}
            {podeCriarBaixa && (
              <button
                onClick={() => setModalCriar(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  text-white 
                  bg-red-600 hover:bg-red-700
                  dark:bg-red-500 dark:hover:bg-red-600
                  shadow-sm hover:shadow-md
                  transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Nova Baixa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Total de Baixas
              </p>
              <p className="text-3xl font-semibold text-red-600 dark:text-red-400 mt-2 tracking-tight">
                {kpis.total?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-red-100/70 dark:bg-red-900/40 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Pendentes
              </p>
              <p className="text-3xl font-semibold text-yellow-600 dark:text-yellow-400 mt-2 tracking-tight">
                {kpis.pendentes?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-yellow-100/70 dark:bg-yellow-900/40 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Aprovadas (Mês)
              </p>
              <p className="text-3xl font-semibold text-green-600 dark:text-green-400 mt-2 tracking-tight">
                {kpis.aprovadasMes?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-green-100/70 dark:bg-green-900/40 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Rejeitadas (Mês)
              </p>
              <p className="text-3xl font-semibold text-red-600 dark:text-red-400 mt-2 tracking-tight">
                {kpis.rejeitadasMes?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-red-100/70 dark:bg-red-900/40 p-3 rounded-full">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] p-5 shadow-md mb-6 transition-colors">
        <div className="flex flex-nowrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por patrimônio ou motivo..."
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200 dark:border-[#2d2d2d]">
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
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="rejeitada">Rejeitada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                  bg-white/95 dark:bg-[#2a2a2a]/95
                  text-gray-900 dark:text-gray-100
                  border border-gray-300 dark:border-[#3a3a3a]
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="descarte">Descarte</option>
              <option value="perda">Perda</option>
              <option value="venda">Venda</option>
              <option value="doacao">Doação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patrimônio
            </label>
            <select
              value={filtros.patrimonio}
              onChange={(e) => setFiltros({ ...filtros, patrimonio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg
                  bg-white/95 dark:bg-[#2a2a2a]/95
                  text-gray-900 dark:text-gray-100
                  border border-gray-300 dark:border-[#3a3a3a]
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              {patrimonios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Exibindo <span className="font-medium">{baixasFiltradas.length}</span>{' '}
          baixa(s)
        </div>
      </div>

      {/* Tabela de Baixas */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-md overflow-hidden transition-colors">
        {/* Estados: Carregando / Erro / Vazio */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-900 dark:text-gray-100 font-medium">Erro ao carregar dados</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        ) : dadosPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-900 dark:text-gray-100 font-medium">Nenhuma baixa encontrada</p>

            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {baixasFiltradas.length === 0 &&
              filtros.busca === '' &&
              filtros.status === 'todos'
                ? 'Clique em "Nova Baixa" para começar'
                : 'Tente ajustar os filtros para ver mais resultados'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-[#2d2d2d]">
                  <tr>
                    <th
                      onClick={() => handleOrdenar('id')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 
                      uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {ordenacao.campo === 'id' &&
                          (ordenacao.direcao === 'asc'
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />
                          )}
                      </div>
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Patrimônio
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Responsável
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                  {dadosPaginados.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{b.id}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {getPatrimonioNome(b.patrimonio_id)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_BAIXA_COLORS[b.tipo]}`}
                        >
                          {TIPO_BAIXA_LABELS[b.tipo]}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[b.status]}`}
                        >
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                        {b.aprovado_por
                          ? getUsuarioNome(b.aprovado_por)
                          : b.rejeitado_por
                            ? getUsuarioNome(b.rejeitado_por)
                            : '-'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(b)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>

                          {b.status === "pendente" && podeAprovar(b) && (
                            <button
                              onClick={() => handleAprovar(b)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors"
                              title="Aprovar"
                            >
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
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
              <div className="mt-6 pt-4 px-6 pb-4 border-t border-gray-200 dark:border-[#2d2d2d]">
                <div className="hidden md:flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">

                  <span>
                    Mostrando {inicio} a {fim} de {baixasFiltradas.length} registros
                  </span>

                  <div className="flex gap-2">
                    {/* Anterior */}
                    <button
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="px-3 py-1 border rounded-lg
                      bg-white/95 dark:bg-[#1e1e1e]/95
                      border-gray-300 dark:border-[#3a3a3a]
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>

                    {/* Páginas */}
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

                    {/* Próximo */}
                    <button
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="px-3 py-1 border rounded-lg
                      bg-white/95 dark:bg-[#1e1e1e]/95
                      border-gray-300 dark:border-[#3a3a3a]
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Modais */}
      <BaixaModal
        isOpen={modalCriar}
        onClose={() => setModalCriar(false)}
        onSuccess={() => {
          setModalCriar(false);
          refreshData();
        }}
      />

      <BaixaDetalhes
        isOpen={!!modalDetalhes}
        onClose={() => setModalDetalhes(null)}
        baixa={modalDetalhes}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
      />
    </div>
  );
};

// ========================================
// COMPONENTE WRAPPER COM PROVIDER
// ========================================

const Baixas: React.FC = () => {
  return (
    <BaixasProvider>
      <BaixasContent />
    </BaixasProvider>
  );
};

export default Baixas;
