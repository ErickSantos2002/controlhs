import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface LogItem {
  acao: string;
  entidade: string;
  entidade_id: number;
  usuario: string;
  criado_em: string;
  detalhes: any;
}


const Logs: React.FC = () => {
  const { user, loading } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [detalheSelecionado, setDetalheSelecionado] = useState<any>(null);

  // --- Paginação ESTÁTICA (somente visual) ---
  const PAGINA_ATUAL = 1;         // mude aqui pra simular outra página
  const ITENS_POR_PAGINA = 10;    // tamanho da página (visual)
  const TOTAL_REGISTROS = 48;     // total mockado

  const TOTAL_PAGINAS = Math.ceil(TOTAL_REGISTROS / ITENS_POR_PAGINA);
  const INICIO = (PAGINA_ATUAL - 1) * ITENS_POR_PAGINA + 1;
  const FIM = Math.min(PAGINA_ATUAL * ITENS_POR_PAGINA, TOTAL_REGISTROS);

  // janelinha de até 5 páginas
  const WINDOW = Math.min(5, TOTAL_PAGINAS);
    let start = 1;
    if (TOTAL_PAGINAS > 5) {
      if (PAGINA_ATUAL <= 3) start = 1;
      else if (PAGINA_ATUAL >= TOTAL_PAGINAS - 2) start = TOTAL_PAGINAS - 4;
      else start = PAGINA_ATUAL - 2;
    }
  const PAGES = Array.from({ length: WINDOW }, (_, i) => start + i);


  // 🔹 Logs fictícios — depois pode substituir por fetch real da API
  const logs: LogItem[] = [
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 12,
      usuario: "Welton",
      criado_em: "2025-10-09 14:21:32",
      detalhes: {
        antes: { status: "ativo" },
        depois: { status: "baixado" },
      },
    },
    {
      acao: "Exclusão de patrimônio",
      entidade: "patrimonios",
      entidade_id: 9,
      usuario: "Erick",
      criado_em: "2025-10-09 10:11:52",
      detalhes: {
        registro_removido: { id: 9, nome: "Notebook Dell", valor: 6500 },
      },
    },
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 5,
      usuario: "Djalma",
      criado_em: "2025-10-08 16:05:14",
      detalhes: {
        antes: { status: "manutenção" },
        depois: { status: "ativo" },
      },
    },
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 3,
      usuario: "Gabriel",
      criado_em: "2025-10-08 12:32:47",
      detalhes: {
        antes: { valor: 2500 },
        depois: { valor: 2700 },
      },
    },
    {
      acao: "Atualização de usuário",
      entidade: "users",
      entidade_id: 4,
      usuario: "Admin",
      criado_em: "2025-10-07 18:41:20",
      detalhes: {
        antes: { role: "comum" },
        depois: { role: "admin" },
      },
    },
    {
      acao: "Criação de patrimônio",
      entidade: "patrimonios",
      entidade_id: 25,
      usuario: "Welton",
      criado_em: "2025-10-06 11:07:15",
      detalhes: {
        novo_registro: {
          nome: "Impressora HP LaserJet 4200",
          categoria: "Equipamento",
          valor: 3500,
        },
      },
    },
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 12,
      usuario: "Welton",
      criado_em: "2025-10-09 14:21:32",
      detalhes: {
        antes: { status: "ativo" },
        depois: { status: "baixado" },
      },
    },
    {
      acao: "Exclusão de patrimônio",
      entidade: "patrimonios",
      entidade_id: 9,
      usuario: "Erick",
      criado_em: "2025-10-09 10:11:52",
      detalhes: {
        registro_removido: { id: 9, nome: "Notebook Dell", valor: 6500 },
      },
    },
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 5,
      usuario: "Djalma",
      criado_em: "2025-10-08 16:05:14",
      detalhes: {
        antes: { status: "manutenção" },
        depois: { status: "ativo" },
      },
    },
    {
      acao: "Atualização de patrimônio",
      entidade: "patrimonios",
      entidade_id: 3,
      usuario: "Gabriel",
      criado_em: "2025-10-08 12:32:47",
      detalhes: {
        antes: { valor: 2500 },
        depois: { valor: 2700 },
      },
    },
    {
      acao: "Atualização de usuário",
      entidade: "users",
      entidade_id: 4,
      usuario: "Admin",
      criado_em: "2025-10-07 18:41:20",
      detalhes: {
        antes: { role: "comum" },
        depois: { role: "admin" },
      },
    },
    {
      acao: "Criação de patrimônio",
      entidade: "patrimonios",
      entidade_id: 25,
      usuario: "Welton",
      criado_em: "2025-10-06 11:07:15",
      detalhes: {
        novo_registro: {
          nome: "Impressora HP LaserJet 4200",
          categoria: "Equipamento",
          valor: 3500,
        },
      },
    },
  ];

  const abrirModal = (detalhes: any) => {
    setDetalheSelecionado(detalhes);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setDetalheSelecionado(null);
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-300">
        Verificando permissões...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-red-600 dark:text-red-400 text-center font-semibold">
        Acesso negado. Esta página é restrita a administradores.
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Card título */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md transition-colors mb-6">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight">
            Log de Auditoria
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Bem-vindo, <span className="font-semibold">{user?.username}</span> ({user?.role})
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Consulte abaixo o histórico de alterações e ações realizadas no sistema, permitindo acompanhar a rastreabilidade e manter a transparência dos dados.
          </p>
        </div>
      </div>

      {/* Logs de Auditoria */}
      <div className="bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-0">
            Logs de Auditoria
          </h3>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {/* Pesquisa */}
            <div className="relative flex-1 md:flex-initial">
              <input
                type="text"
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
          </div>
        </div>

        {/* Tabela sem scroll */}
        <div className="overflow-x-auto overflow-y-auto rounded-lg max-h-screen-md border border-gray-200 dark:border-[#2a2a2a]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-200 dark:bg-[#181818]">
                {[
                  "Ação",
                  "Entidade",
                  "ID Entidade",
                  "Usuário",
                  "Data",
                  "Detalhes",
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
              {logs.slice(0, 10).map((log, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 dark:border-gray-700 
                              hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                              ${index % 2 === 0 ? "bg-white dark:bg-[#1b1b1b]" : "bg-gray-50 dark:bg-[#222222]"}`}
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
                    {new Date(log.criado_em).toLocaleString("pt-BR")}
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

        {/* Paginação (estática/visual) */}
          <div className="mt-4">
            {/* Texto de registros */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 md:mb-0">
              Mostrando {INICIO} a {FIM} de {TOTAL_REGISTROS} registros
            </div>

            {/* Desktop */}
            <div className="hidden md:flex justify-between items-center">
              <div></div>{/* placeholder só pra alinhar */}
              <div className="flex gap-2">
                {/* Botão Anterior (só visual) */}
                <button
                  disabled={PAGINA_ATUAL === 1}
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

                {/* Números de página (só visual) */}
                <div className="flex gap-1">
                  {PAGES.map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 border rounded-lg transition-colors ${
                        PAGINA_ATUAL === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                      }`}
                      aria-current={PAGINA_ATUAL === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Botão Próximo (só visual) */}
                <button
                  disabled={PAGINA_ATUAL === TOTAL_PAGINAS}
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
            <div className="flex md:hidden justify-center gap-2 items-center mt-2">
              <button
                disabled={PAGINA_ATUAL === 1}
                className="px-3 py-1 border rounded-lg
                  bg-white dark:bg-[#1f1f1f]
                  border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors"
              >
                {"<"}
              </button>

              <span
                className="px-3 py-1 border rounded-lg
                  bg-white dark:bg-[#1f1f1f]
                  text-gray-700 dark:text-gray-300
                  border-gray-300 dark:border-gray-600"
              >
                {PAGINA_ATUAL}
              </span>

              <button
                disabled={PAGINA_ATUAL === TOTAL_PAGINAS}
                className="px-3 py-1 border rounded-lg
                  bg-white dark:bg-[#1f1f1f]
                  border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors"
              >
                {">"}
              </button>
            </div>
          </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">
          Exibindo os 6 registros mais recentes
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-200 dark:border-[#2d2d2d] max-w-lg w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Detalhes da Alteração
            </h2>

            <pre className="text-sm bg-gray-100 dark:bg-[#181818] text-gray-800 dark:text-gray-300 p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] max-h-[300px] overflow-auto">
              {JSON.stringify(detalheSelecionado, null, 2)}
            </pre>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 rounded-lg font-medium 
                           bg-gray-300 hover:bg-gray-400 
                           dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
                           transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
