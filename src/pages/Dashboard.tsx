import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Filter, Home, Activity, DollarSign, PieChart, MapPin } from "lucide-react";
import { ResponsiveContainer, PieChart as RChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const DashboardPatrimonio: React.FC = () => {
  const { user } = useAuth();

  // ========================= MOCKS =========================
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
  const [localSelecionado, setLocalSelecionado] = useState("todas");
  const [situacaoSelecionada, setSituacaoSelecionada] = useState("todas");

  const CORES_GRAFICO = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

  const kpis = {
    totalItens: 1240,
    valorTotal: 2150000,
    depreciacaoAcumulada: 450000,
    ativos: 1100,
    manutencao: 100,
    baixados: 40,
  };

  const distribuicaoCategoria = [
    { name: "Equipamentos", value: 40 },
    { name: "Veículos", value: 30 },
    { name: "Móveis e Utensílios", value: 20 },
    { name: "Outros", value: 10 },
  ];

  const distribuicaoLocalizacao = [
    { name: "Matriz", value: 60 },
    { name: "Filial Recife", value: 25 },
    { name: "Filial SP", value: 15 },
  ];

  const depreciacaoPorCategoria = [
    { categoria: "Equipamentos", valor: 150000 },
    { categoria: "Veículos", valor: 120000 },
    { categoria: "Móveis", valor: 80000 },
    { categoria: "Outros", valor: 50000 },
  ];

  const valorPorResponsavel = [
    { responsavel: "Welton", valor: 520000 },
    { responsavel: "Erick", valor: 480000 },
    { responsavel: "Djalma", valor: 390000 },
    { responsavel: "Gabriel", valor: 260000 },
  ];

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


  // ========================= COMPONENTE =========================
  return (
    <div className="min-h-full bg-gray-50 dark:bg-darkGray transition-colors">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-mediumGray shadow-sm border border-gray-200 dark:border-accentGray rounded-xl transition-colors">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">
              Patrimônio - Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Bem-vindo, <span className="font-semibold">{user?.username}</span> ({user?.role})
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Visualize os indicadores e a situação atual dos bens patrimoniais da empresa.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 mt-6 mb-6 transition-colors border border-gray-200 dark:border-accentGray max-w-[1100px] mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center mb-6">
            <Filter className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Filtros
            </h2>
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
            {/* Categoria */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="todas">Todas</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="veiculos">Veículos</option>
                <option value="moveis">Móveis e Utensílios</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Setor */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Setor
              </label>
              <select
                value={localSelecionado}
                onChange={(e) => setLocalSelecionado(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="todas">Todas</option>
                <option value="matriz">Matriz</option>
                <option value="recife">Filial Recife</option>
                <option value="sp">Filial SP</option>
              </select>
            </div>

            {/* Situação */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Situação
              </label>
              <select
                value={situacaoSelecionada}
                onChange={(e) => setSituacaoSelecionada(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="todas">Todas</option>
                <option value="ativos">Ativos</option>
                <option value="manutencao">Em Manutenção</option>
                <option value="baixados">Baixados</option>
              </select>
            </div>

            {/* Responsável */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsável
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="todos">Todos</option>
                <option value="Welton">Welton</option>
                <option value="Erick">Erick</option>
                <option value="Djalma">Djalma</option>
                <option value="Gabriel">Gabriel</option>
              </select>
            </div>
          </div>

          {/* Linha com 3 filtros centralizados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 place-items-center">
            {/* Aquisição - Início */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aquisição - Início
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Aquisição - Fim */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aquisição - Fim
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Filtros Personalizados */}
            <div className="w-full max-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtros Personalizados
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-darkGray
                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="nenhum">Nenhum</option>
                <option value="antigos">Bens acima de 5 anos</option>
                <option value="depreciados">Totalmente depreciados</option>
                <option value="em_alta">Com alto valor residual</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total de Itens</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {kpis.totalItens}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valor Total</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  R$ {kpis.valorTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Depreciação Acumulada</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  R$ {kpis.depreciacaoAcumulada.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full">
                <Activity className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Bens Ativos</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {kpis.ativos}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Valor por Categoria */}
          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Distribuição de Valor por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RChart>
                <Pie data={distribuicaoCategoria} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {distribuicaoCategoria.map((entry, i) => (
                    <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por setor */}
          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Distribuição por Setor
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RChart>
                <Pie data={distribuicaoLocalizacao} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {distribuicaoLocalizacao.map((entry, i) => (
                    <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RChart>
            </ResponsiveContainer>
          </div>

          {/* Depreciação por Categoria */}
          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Depreciação por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={depreciacaoPorCategoria} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" width={120} />
                <Bar dataKey="valor" fill="#f59e0b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb", // fundo claro em ambos os temas
                    color: "#000",              // texto preto visível
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                  itemStyle={{ color: "#000" }} // mantém os labels legíveis
                  labelStyle={{ color: "#f59e0b", fontWeight: 600 }}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de Valor por Responsável */}
          <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Distribuição de Valor por Responsável
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valorPorResponsavel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" />
                <YAxis dataKey="responsavel" type="category" width={100} />
                <Bar dataKey="valor" fill="#2563eb" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb", // fundo claro em ambos os temas
                    color: "#000",              // texto preto visível
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                  itemStyle={{ color: "#000" }} // mantém os labels legíveis
                  labelStyle={{ color: "#2563eb", fontWeight: 600 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA DE BENS PATRIMONIAIS */}
        <div className="bg-white dark:bg-mediumGray rounded-xl shadow-sm p-6 transition-colors border border-gray-200 dark:border-accentGray mt-6">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-0">
              Bens Patrimoniais
            </h3>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {/* Pesquisa */}
              <div className="relative flex-1 md:flex-initial">
                <input
                  type="text"
                  placeholder="Pesquisar bem..."
                  className="pl-3 pr-3 py-2 w-full md:w-64 rounded-lg border 
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            bg-white dark:bg-darkGray
                            text-gray-800 dark:text-gray-200
                            border-gray-300 dark:border-gray-600
                            placeholder-gray-400 dark:placeholder-gray-500
                            transition-colors"
                />
              </div>

              {/* Botão Exportar */}
              <button
                className="flex items-center justify-center px-4 py-2 
                          bg-green-600 text-white rounded-lg 
                          hover:bg-green-700 dark:hover:bg-green-500 
                          transition-colors"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          {/* Corpo da Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1e1e1e]">
                  {[
                    "Nome",
                    "Categoria",
                    "Responsável",
                    "Localização",
                    "Data de Aquisição",
                    "Valor Atual (R$)",
                    "Depreciação (R$)",
                    "Situação",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    nome: "Impressora HP LaserJet",
                    categoria: "Equipamento",
                    responsavel: "Erick",
                    local: "Matriz",
                    dataAquisicao: "2021-03-15",
                    valorAtual: 4200.0,
                    valorDepreciado: 1800.0,
                    situacao: "Ativo",
                  },
                  {
                    nome: "Veículo Strada",
                    categoria: "Veículo",
                    responsavel: "Gabriel",
                    local: "Filial Recife",
                    dataAquisicao: "2019-11-10",
                    valorAtual: 58000.0,
                    valorDepreciado: 22000.0,
                    situacao: "Em Manutenção",
                  },
                  {
                    nome: "Notebook Dell",
                    categoria: "Equipamento",
                    responsavel: "Welton",
                    local: "Matriz",
                    dataAquisicao: "2023-01-05",
                    valorAtual: 6500.0,
                    valorDepreciado: 500.0,
                    situacao: "Ativo",
                  },
                  {
                    nome: "Mesa Reunião 3m",
                    categoria: "Móveis e Utensílios",
                    responsavel: "Djalma",
                    local: "Filial SP",
                    dataAquisicao: "2020-08-22",
                    valorAtual: 1800.0,
                    valorDepreciado: 900.0,
                    situacao: "Baixado",
                  },
                ].map((bem, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-700 
                                hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                                ${index % 2 === 0 ? "bg-white dark:bg-[#1e1e1e]" : "bg-gray-50 dark:bg-[#252525]"}`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {bem.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {bem.categoria}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {bem.responsavel}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {bem.local}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(bem.dataAquisicao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-500 dark:text-blue-400">
                      {bem.valorAtual.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-500 dark:text-orange-400">
                      {bem.valorDepreciado.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex justify-center items-center text-center whitespace-nowrap px-2 py-1 text-xs font-semibold rounded-full ${
                          bem.situacao === "Ativo"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                            : bem.situacao === "Em Manutenção"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
                        }`}
                      >
                        {bem.situacao}
                      </span>
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
        </div>

      </div>
    </div>
  );
};

export default DashboardPatrimonio;