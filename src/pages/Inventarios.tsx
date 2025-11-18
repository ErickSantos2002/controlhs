import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
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
  Clock,
  ClipboardCheck,
  PlayCircle,
  FileDown,
} from 'lucide-react';
import {
  InventarioProvider,
  useInventario,
} from '../context/InventarioContext';
import InventarioModal from '../components/InventarioModal';
import InventarioDetalhes from '../components/InventarioDetalhes';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getInventario,
  getEstatisticasInventario,
  listPatrimonios,
} from '../services/controlapi';

// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================

const InventariosContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    inventariosFiltrados,
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
  const canCreate = ['administrador', 'gerente'].includes(userRole);
  const canEdit = ['administrador', 'gerente'].includes(userRole);
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
    filtros.status,
    filtros.tipo,
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
      console.error('Erro ao excluir sessão de inventário:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleConferir = (inventario: any) => {
    navigate(`/inventarios/${inventario.id}/conferencia`);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: 'todos',
      tipo: 'todos',
      responsavel_id: 'todos',
      data_inicio: '',
      data_fim: '',
    });
    setBuscaLocal('');
  };

  const handleExportarPDF = async (inventario: any) => {
    try {
      // Buscar dados completos
      const [inventarioCompleto, stats, patrimonios] = await Promise.all([
        getInventario(inventario.id),
        getEstatisticasInventario(inventario.id),
        listPatrimonios(),
      ]);

      // Criar PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE INVENTÁRIO', pageWidth / 2, 20, {
        align: 'center',
      });

      // Informações da Sessão
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Informações da Sessão:', 14, 35);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 45;

      doc.text(`Título: ${inventario.titulo}`, 14, yPos);
      yPos += 7;

      if (inventario.descricao) {
        doc.text(`Descrição: ${inventario.descricao}`, 14, yPos);
        yPos += 7;
      }

      doc.text(`Tipo: ${getTipoLabel(inventario.tipo)}`, 14, yPos);
      yPos += 7;

      doc.text(`Status: ${getStatusLabel(inventario.status)}`, 14, yPos);
      yPos += 7;

      const responsavelNome = getResponsavelNome(inventario.responsavel_id);
      doc.text(`Responsável: ${responsavelNome}`, 14, yPos);
      yPos += 7;

      doc.text(
        `Data Início: ${formatDate(inventario.data_inicio)}`,
        14,
        yPos,
      );
      yPos += 7;

      if (inventario.data_fim) {
        doc.text(
          `Data Finalização: ${formatDate(inventario.data_fim)}`,
          14,
          yPos,
        );
        yPos += 7;
      }

      yPos += 5;

      // Estatísticas
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Estatísticas:', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const estatisticas = [
        ['Total de Itens', stats.total_itens.toString()],
        ['Encontrados', stats.encontrados.toString()],
        ['Não Encontrados', stats.nao_encontrados.toString()],
        ['Divergências', stats.divergencias.toString()],
        ['Conferidos', stats.conferidos.toString()],
        ['Pendentes', stats.pendentes.toString()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Quantidade']],
        body: estatisticas,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Tabela de Itens
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Itens do Inventário:', 14, yPos);
      yPos += 5;

      const itensData = inventarioCompleto.itens.map((item: any) => {
        const patrimonio = patrimonios.find(
          (p: any) => p.id === item.patrimonio_id,
        );
        return [
          patrimonio?.nome || 'N/A',
          patrimonio?.numero_serie || '-',
          getSituacaoLabel(item.situacao),
          item.observacoes || '-',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Patrimônio', 'Nº Série', 'Situação', 'Observações']],
        body: itensData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 60 },
        },
        margin: { left: 14, right: 14 },
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' },
        );
        doc.text(
          `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
          14,
          doc.internal.pageSize.getHeight() - 10,
        );
      }

      // Salvar PDF
      const fileName = `inventario_${inventario.id}_${inventario.titulo.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const getSituacaoLabel = (situacao: string) => {
    const labels: { [key: string]: string } = {
      encontrado: 'Encontrado',
      nao_encontrado: 'Não Encontrado',
      divergencia: 'Divergência',
      conferido: 'Conferido',
    };
    return labels[situacao] || situacao;
  };

  // ========================================
  // HELPERS
  // ========================================

  const getResponsavelNome = (id?: number | null) =>
    usuarios.find((u) => u.id === id)?.username || '-';

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      geral: 'Geral',
      por_setor: 'Por Setor',
      por_categoria: 'Por Categoria',
    };
    return labels[tipo] || tipo;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const configs: {
      [key: string]: { color: string; bgColor: string; icon: any };
    } = {
      em_andamento: {
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: PlayCircle,
      },
      concluido: {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle,
      },
      cancelado: {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: XCircle,
      },
    };

    const config = configs[status] || configs.em_andamento;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {getStatusLabel(status)}
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
            Gerenciamento de sessões de inventário patrimonial
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
              Nova Sessão
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
                Total de Sessões
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {kpis.total}
              </p>
            </div>
            <Package className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Em Andamento
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {kpis.em_andamento}
              </p>
            </div>
            <PlayCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Concluídos
              </p>
              <p className="text-2xl font-bold text-green-600">
                {kpis.concluidos}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancelados
              </p>
              <p className="text-2xl font-bold text-red-600">
                {kpis.cancelados}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                placeholder="Título ou descrição..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="geral">Geral</option>
              <option value="por_setor">Por Setor</option>
              <option value="por_categoria">Por Categoria</option>
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
              Nenhuma sessão de inventário encontrada
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
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data Início
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
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{inv.titulo}</div>
                      {inv.descricao && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {inv.descricao}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getTipoLabel(inv.tipo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getResponsavelNome(inv.responsavel_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(inv.data_inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {canEdit && inv.status === 'em_andamento' && (
                          <button
                            onClick={() => handleConferir(inv)}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Conferir Itens"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status === 'concluido' && (
                          <button
                            onClick={() => handleExportarPDF(inv)}
                            className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                            title="Salvar como PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        )}
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
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Tem certeza que deseja excluir a sessão de inventário "
              {showDeleteConfirm.titulo}"?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Esta ação não pode ser desfeita e todos os itens associados serão
              removidos.
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
