import React from 'react';
import {
  X,
  Package,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import type { Inventario } from '../types/inventarios.types';

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
  const { patrimonios, categorias, setores, usuarios } = useInventario();

  if (!isOpen) return null;

  // Busca os dados relacionados
  const patrimonio = patrimonios.find((p) => p.id === inventario.patrimonio_id);
  const responsavel = usuarios.find((u) => u.id === inventario.responsavel_id);
  const categoria = categorias.find((c) => c.id === patrimonio?.categoria_id);
  const setor = setores.find((s) => s.id === patrimonio?.setor_id);

  // Helpers
  const getSituacaoLabel = (situacao: string) => {
    const labels: { [key: string]: string } = {
      encontrado: 'Encontrado',
      nao_encontrado: 'Não Encontrado',
      divergencia: 'Divergência',
      conferido: 'Conferido',
      pendente: 'Pendente',
    };
    return labels[situacao] || situacao;
  };

  const getSituacaoIcon = (situacao: string) => {
    const icons: { [key: string]: { icon: any; color: string } } = {
      encontrado: { icon: CheckCircle, color: 'text-green-600' },
      nao_encontrado: { icon: XCircle, color: 'text-red-600' },
      divergencia: { icon: AlertTriangle, color: 'text-orange-600' },
      conferido: { icon: CheckCircle, color: 'text-blue-600' },
      pendente: { icon: Clock, color: 'text-gray-600' },
    };
    return icons[situacao] || icons.pendente;
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

  const formatCurrency = (value?: number) => {
    if (value == null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const SituacaoInfo = getSituacaoIcon(inventario.situacao);
  const SituacaoIconComponent = SituacaoInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detalhes da Verificação
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ID: #{inventario.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Situação Badge */}
          <div className="flex items-center justify-center">
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
                inventario.situacao === 'conferido' || inventario.situacao === 'encontrado'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : inventario.situacao === 'nao_encontrado'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : inventario.situacao === 'divergencia'
                      ? 'bg-orange-100 dark:bg-orange-900/30'
                      : 'bg-gray-100 dark:bg-gray-900/30'
              }`}
            >
              <SituacaoIconComponent
                className={`w-6 h-6 ${SituacaoInfo.color}`}
              />
              <span
                className={`text-lg font-semibold ${SituacaoInfo.color}`}
              >
                {getSituacaoLabel(inventario.situacao)}
              </span>
            </div>
          </div>

          {/* Informações do Patrimônio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Patrimônio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nome
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {patrimonio?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Número de Série
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {patrimonio?.numero_serie || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Categoria
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {categoria?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Setor
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {setor?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Valor Atual
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(patrimonio?.valor_atual)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {patrimonio?.status === 'ativo'
                    ? 'Ativo'
                    : patrimonio?.status === 'manutencao'
                      ? 'Em Manutenção'
                      : 'Baixado'}
                </p>
              </div>
            </div>
          </div>

          {/* Informações da Verificação */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Verificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsável pela Verificação
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {responsavel?.username || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Verificação
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(inventario.data_verificacao)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Criado em
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(inventario.criado_em)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Atualizado em
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(inventario.atualizado_em)}
                </p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {inventario.observacoes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {inventario.observacoes}
                </p>
              </div>
            </div>
          )}
        </div>

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
