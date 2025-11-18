import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLogs } from '../hooks/useLogs';
import { Navigate } from 'react-router-dom';
import type { Log } from '../types/logs.types';

const Logs: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    logsFiltrados,
    loading,
    error,
    filtros,
    setFiltros,
    paginacao,
    setPaginacao,
    refreshLogs
  } = useLogs();

  const [modalAberto, setModalAberto] = useState(false);
  const [detalheSelecionado, setDetalheSelecionado] = useState<any>(null);
  const [buscaLocal, setBuscaLocal] = useState('');

  // ========================================
  // PROTEÇÃO DE ROTA (ADMIN ONLY)
  // ========================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  // ========================================
  // DEBOUNCE DA BUSCA
  // ========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ ...filtros, busca: buscaLocal });
      setPaginacao({ paginaAtual: 1 }); // Reset para primeira página
    }, 300);

    return () => clearTimeout(timer);
  }, [buscaLocal]);

  // ========================================
  // PAGINAÇÃO SERVER-SIDE
  // ========================================

  // 🎯 Com paginação server-side, não precisamos paginar localmente
  // Os logs já vêm na página correta do backend
  const dadosPaginados = logsFiltrados;

  // ========================================
  // CÁLCULOS DE PAGINAÇÃO
  // ========================================

  const INICIO = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1;
  const FIM = Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, paginacao.totalRegistros);

  // Janela de páginas (mostra até 5 páginas)
  const WINDOW = Math.min(5, paginacao.totalPaginas);
  let start = 1;
  if (paginacao.totalPaginas > 5) {
    if (paginacao.paginaAtual <= 3) start = 1;
    else if (paginacao.paginaAtual >= paginacao.totalPaginas - 2) start = paginacao.totalPaginas - 4;
    else start = paginacao.paginaAtual - 2;
  }
  const PAGES = Array.from({ length: WINDOW }, (_, i) => start + i);

  // ========================================
  // HANDLERS
  // ========================================

  const abrirModal = (detalhes: any) => {
    setDetalheSelecionado(detalhes);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setDetalheSelecionado(null);
  };

  const handlePageChange = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= paginacao.totalPaginas) {
      setPaginacao({ paginaAtual: novaPagina });
    }
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f0f0f] dark:to-[#1a1a1a] py-6 px-4">
      {/* Modal de Detalhes */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={fecharModal}
        >
          <div
            className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl
                      max-w-2xl w-full max-h-[80vh] overflow-y-auto
                      border border-gray-200 dark:border-[#2d2d2d]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalhes do Log
              </h3>
              <button
                onClick={fecharModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400
                          dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <pre className="bg-gray-50 dark:bg-[#0f0f0f] p-4 rounded-lg
                            overflow-x-auto text-sm text-gray-800 dark:text-gray-200
                            border border-gray-200 dark:border-[#2d2d2d]">
                {JSON.stringify(detalheSelecionado, null, 2)}
              </pre>
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-[#2d2d2d]">
              <button
                onClick={fecharModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                          rounded-lg transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho da Página */}
      <div className="mb-6 bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md transition-colors">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight">
            Log de Auditoria
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Bem-vindo, <span className="font-semibold">{user?.username}</span> (
            {user?.role})
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Consulte abaixo o histórico de alterações e ações realizadas no
            sistema, permitindo acompanhar a rastreabilidade e manter a
            transparência dos dados.
          </p>
        </div>
      </div>

      {/* Logs de Auditoria */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-0">
            Logs de Auditoria
          </h3>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {/* Pesquisa */}
            <div className="relative flex-1 md:flex-initial">
              <input
                type="text"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                placeholder="Pesquisar log..."
                className="pl-3 pr-3 py-2 w-full md:w-64 rounded-lg border
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200
                          border-gray-300 dark:border-gray-600
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition-colors"
              />
            </div>

            {/* Botão Atualizar */}
            <button
              onClick={refreshLogs}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                        rounded-lg transition-colors font-medium disabled:opacity-50
                        disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Carregando...
                </>
              ) : (
                <>
                  🔄 Atualizar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm">
              ⚠️ Erro ao carregar logs: {error}
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && logsFiltrados.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando logs...</p>
            </div>
          </div>
        )}

        {/* Mensagem de Nenhum Resultado */}
        {!loading && dadosPaginados.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                📭 Nenhum log encontrado
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                {filtros.busca
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Não há logs registrados no sistema'}
              </p>
            </div>
          </div>
        )}

        {/* Tabela de Logs */}
        {!loading && dadosPaginados.length > 0 && (
          <>
            <div className="overflow-x-auto overflow-y-auto rounded-lg max-h-screen-md border border-gray-200 dark:border-[#2a2a2a]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-200 dark:bg-[#181818]">
                    {[
                      'Ação',
                      'Entidade',
                      'ID Entidade',
                      'Usuário',
                      'Data',
                      'Detalhes',
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dadosPaginados.map((log, index) => (
                    <tr
                      key={log.id || index}
                      className={`border-b border-gray-100 dark:border-gray-700
                                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                                  ${index % 2 === 0 ? 'bg-white dark:bg-[#1b1b1b]' : 'bg-gray-50 dark:bg-[#222222]'}`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                        {log.acao}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {log.entidade}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {log.entidade_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {log.usuario}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {new Date(log.criado_em).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => abrirModal(log.detalhes)}
                          className="px-3 py-1 text-sm font-medium rounded-md
                                    bg-blue-600 hover:bg-blue-700
                                    text-white transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="mt-4">
              {/* Desktop */}
              <div className="hidden md:flex justify-between items-center w-full text-sm text-gray-700 dark:text-gray-300">
                {/* Texto de registros */}
                <div>
                  Mostrando {INICIO} a {FIM} de {paginacao.totalRegistros} registros
                </div>
                {/* Paginação */}
                <div className="flex gap-2">
                  {/* Botão Anterior */}
                  <button
                    onClick={() => handlePageChange(paginacao.paginaAtual - 1)}
                    disabled={paginacao.paginaAtual === 1}
                    className="px-3 py-1 border rounded-lg
                      bg-white dark:bg-[#1f1f1f]
                      border-gray-300 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    Anterior
                  </button>

                  {/* Números */}
                  <div className="flex gap-1">
                    {PAGES.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-lg transition-colors
                          ${
                            paginacao.paginaAtual === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                          }`}
                        aria-current={paginacao.paginaAtual === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Próximo */}
                  <button
                    onClick={() => handlePageChange(paginacao.paginaAtual + 1)}
                    disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                    className="px-3 py-1 border rounded-lg
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

              {/* Mobile */}
              <div className="flex md:hidden flex-col items-center mt-2 gap-2 text-sm text-gray-700 dark:text-gray-300">

                {/* Texto */}
                <div>
                  Mostrando {INICIO} a {FIM} de {paginacao.totalRegistros} registros
                </div>

                {/* Paginação Mobile */}
                <div className="flex justify-center gap-2 items-center">

                  {/* < Anterior */}
                  <button
                    onClick={() => handlePageChange(paginacao.paginaAtual - 1)}
                    disabled={paginacao.paginaAtual === 1}
                    className="px-3 py-1 border rounded-lg
                      bg-white dark:bg-[#1f1f1f]
                      border-gray-300 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    {'<'}
                  </button>

                  {/* Página atual ou lista (caso queira manter múltiplas páginas no mobile) */}
                  {PAGES.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-lg transition-colors text-sm
                        ${
                          paginacao.paginaAtual === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* > Próximo */}
                  <button
                    onClick={() => handlePageChange(paginacao.paginaAtual + 1)}
                    disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                    className="px-3 py-1 border rounded-lg
                      bg-white dark:bg-[#1f1f1f]
                      border-gray-300 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
