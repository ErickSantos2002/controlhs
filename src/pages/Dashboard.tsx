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
      </div>
    </div>
  );
};

export default DashboardPatrimonio;