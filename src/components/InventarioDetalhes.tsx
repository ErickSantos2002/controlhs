import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Loader2,
  AlertCircle as AlertCircleIcon,
  ClipboardCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import {
  getInventario,
  getEstatisticasInventario,
  listPatrimonios,
} from '../services/controlapi';
import type {
  Inventario,
  InventarioComItens,
  InventarioStats,
} from '../types/inventarios.types';
import type { Patrimonio } from '../types/patrimonios.types';
import { useAuth } from '../hooks/useAuth';

interface InventarioDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  inventario: Inventario;
}

const InventarioDetalhes: React.FC<InventarioDetalhesProps> = ({
  isOpen,
  onClose,
  inventario,
}) => {
  const { usuarios, setores, categorias } = useInventario();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inventarioCompleto, setInventarioCompleto] =
    useState<InventarioComItens | null>(null);
  const [stats, setStats] = useState<InventarioStats | null>(null);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permissões
  const userRole = user?.role?.toLowerCase() || '';
  const canEdit = ['administrador', 'gerente'].includes(userRole);

  // Fetch dados completos
  useEffect(() => {
    if (!isOpen || !inventario) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [invData, statsData, patData] = await Promise.all([
          getInventario(inventario.id),
          getEstatisticasInventario(inventario.id),
          listPatrimonios(),
        ]);

        setInventarioCompleto(invData);
        setStats(statsData);
        setPatrimonios(patData || []);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes:', err);
        setError(
          err.response?.data?.detail ||
            'Erro ao carregar detalhes do inventário',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, inventario]);

  if (!isOpen) return null;

  // Helpers
  const getResponsavelNome = (id?: number | null) =>
    usuarios.find((u) => u.id === id)?.username || '-';

  const getSetorNome = (id?: number | null) =>
    setores.find((s) => s.id === id)?.nome || '-';

  const getCategoriaNome = (id?: number | null) =>
    categorias.find((c) => c.id === id)?.nome || '-';

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

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: { icon: any; color: string } } = {
      em_andamento: { icon: PlayCircle, color: 'text-blue-600' },
      concluido: { icon: CheckCircle, color: 'text-green-600' },
      cancelado: { icon: XCircle, color: 'text-red-600' },
    };
    return icons[status] || icons.em_andamento;
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

  const getSituacaoColor = (situacao: string) => {
    const colors: { [key: string]: string } = {
      encontrado: 'text-green-600',
      nao_encontrado: 'text-red-600',
      divergencia: 'text-orange-600',
      conferido: 'text-blue-600',
    };
    return colors[situacao] || 'text-gray-600';
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPatrimonioInfo = (patrimonioId: number) => {
    return patrimonios.find((p) => p.id === patrimonioId);
  };

  const StatusInfo = getStatusIcon(inventario.status);
  const StatusIconComponent = StatusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {inventario.titulo}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ID: #{inventario.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && inventario.status === 'em_andamento' && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/inventarios/${inventario.id}/conferencia`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                Conferir Itens
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
                  inventario.status === 'concluido'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : inventario.status === 'cancelado'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <StatusIconComponent
                  className={`w-6 h-6 ${StatusInfo.color}`}
                />
                <span className={`text-lg font-semibold ${StatusInfo.color}`}>
                  {getStatusLabel(inventario.status)}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {inventario.descricao && (
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {inventario.descricao}
                </p>
              </div>
            )}

            {/* Informações da Sessão */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações da Sessão
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tipo
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {getTipoLabel(inventario.tipo)}
                  </p>
                </div>
                {inventario.filtro_setor_id && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Setor
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {getSetorNome(inventario.filtro_setor_id)}
                    </p>
                  </div>
                )}
                {inventario.filtro_categoria_id && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Categoria
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {getCategoriaNome(inventario.filtro_categoria_id)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Responsável
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {getResponsavelNome(inventario.responsavel_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Início
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(inventario.data_inicio)}
                  </p>
                </div>
                {inventario.data_fim && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data de Finalização
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(inventario.data_fim)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            {stats && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Estatísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 text-center">
                    <Package className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total_itens}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Total de Itens
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {stats.encontrados}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Encontrados
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {stats.nao_encontrados}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Não Encontrados
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.divergencias}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Divergências
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.conferidos}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Conferidos
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Itens */}
            {inventarioCompleto && inventarioCompleto.itens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Itens ({inventarioCompleto.itens.length})
                </h3>
                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-[#2d2d2d] sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Patrimônio
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Número de Série
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Situação
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Observações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                        {inventarioCompleto.itens.map((item) => {
                          const patrimonio = getPatrimonioInfo(
                            item.patrimonio_id,
                          );
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
                            >
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {patrimonio?.nome || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {patrimonio?.numero_serie || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`font-medium ${getSituacaoColor(item.situacao)}`}
                                >
                                  {getSituacaoLabel(item.situacao)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {item.observacoes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-[#2d2d2d]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventarioDetalhes;
