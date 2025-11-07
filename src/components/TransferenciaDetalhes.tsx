import React from 'react';
import {
  X,
  Package,
  ArrowRight,
  Building,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Check,
  ArrowRightLeft,
  Hash,
} from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
import {
  Transferencia,
  TransferenciaStatus,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../types/transferencias.types';

interface TransferenciaDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  transferencia: Transferencia | null;
  onAprovar?: (transferencia: Transferencia) => void;
  onRejeitar?: (transferencia: Transferencia) => void;
  onEfetivar?: (transferencia: Transferencia) => void;
}

const TransferenciaDetalhes: React.FC<TransferenciaDetalhesProps> = ({
  isOpen,
  onClose,
  transferencia,
  onAprovar,
  onRejeitar,
  onEfetivar,
}) => {
  const {
    patrimonios,
    setores,
    usuarios,
    getTransferenciaStatus,
    podeAprovar,
    podeEfetivar,
  } = useTransferencias();

  if (!isOpen || !transferencia) return null;

  // ========================================
  // HELPERS
  // ========================================

  const status = getTransferenciaStatus(transferencia);
  const canApprove = status === 'pendente' && podeAprovar(transferencia);
  const canReject = status === 'pendente' && podeAprovar(transferencia);
  const canTransfer = podeEfetivar(transferencia);

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR');
  };

  const getPatrimonioNome = (): string => {
    const patrimonio = patrimonios.find(
      (p) => p.id === transferencia.patrimonio_id,
    );
    return patrimonio?.nome || 'N/A';
  };

  const getPatrimonioNumeroSerie = (): string => {
    const patrimonio = patrimonios.find(
      (p) => p.id === transferencia.patrimonio_id,
    );
    return patrimonio?.numero_serie || '';
  };

  const getPatrimonioValor = (): string => {
    const patrimonio = patrimonios.find(
      (p) => p.id === transferencia.patrimonio_id,
    );
    const valor = patrimonio?.valor_atual || 0;
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getCategoriaNome = (): string => {
    const patrimonio = patrimonios.find(
      (p) => p.id === transferencia.patrimonio_id,
    );
    if (!patrimonio?.categoria_id) return 'N/A';
    // Assumindo que temos categorias no contexto, senão retorna 'N/A'
    return 'N/A'; // Poderia buscar de categorias se estivesse disponível
  };

  const getSetorOrigemNome = (): string => {
    const setor = setores.find((s) => s.id === transferencia.setor_origem_id);
    return setor?.nome || 'N/A';
  };

  const getSetorDestinoNome = (): string => {
    const setor = setores.find((s) => s.id === transferencia.setor_destino_id);
    return setor?.nome || 'N/A';
  };

  const getResponsavelOrigemNome = (): string => {
    const user = usuarios.find(
      (u) => u.id === transferencia.responsavel_origem_id,
    );
    return user?.username || 'N/A';
  };

  const getResponsavelDestinoNome = (): string => {
    const user = usuarios.find(
      (u) => u.id === transferencia.responsavel_destino_id,
    );
    return user?.username || 'N/A';
  };

  const getSolicitanteNome = (): string => {
    const user = usuarios.find((u) => u.id === transferencia.solicitante_id);
    return user?.username || 'N/A';
  };

  const getAprovadorNome = (): string => {
    if (!transferencia.aprovado_por) return 'N/A';
    const user = usuarios.find((u) => u.id === transferencia.aprovado_por);
    return user?.username || 'N/A';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'aprovada':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'concluida':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejeitada':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Detalhes da Transferência #{transferencia.id}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                  status === 'pendente'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                    : status === 'aprovada'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                      : status === 'concluida'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                }`}
              >
                {getStatusIcon()}
                {STATUS_LABELS[status]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Seção: Patrimônio */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Patrimônio
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nome
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {getPatrimonioNome()}
                    </p>
                  </div>

                  {getPatrimonioNumeroSerie() && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Número de Série
                      </p>
                      <p className="text-base font-mono text-gray-700 dark:text-gray-300">
                        {getPatrimonioNumeroSerie()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Valor Atual
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {getPatrimonioValor()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID do Patrimônio
                    </p>
                    <p className="text-base font-mono text-gray-700 dark:text-gray-300">
                      #{transferencia.patrimonio_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Movimentação */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRightLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Movimentação
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-4">
                {/* Setor */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Setor
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center bg-white dark:bg-[#1e1e1e] rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        De
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        {getSetorOrigemNome()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 text-center bg-white dark:bg-[#1e1e1e] rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Para
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        {getSetorDestinoNome()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responsável */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Responsável
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center bg-white dark:bg-[#1e1e1e] rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        De
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {getResponsavelOrigemNome()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 text-center bg-white dark:bg-[#1e1e1e] rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Para
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {getResponsavelDestinoNome()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Informações da Solicitação */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Informações da Solicitação
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                {transferencia.motivo && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Motivo da Transferência
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                      {transferencia.motivo}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Solicitante
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {getSolicitanteNome()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Data da Solicitação
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      {formatDate(transferencia.data_transferencia)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Aprovação (se houver) */}
            {transferencia.aprovado_por && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {status === 'rejeitada' ? (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {status === 'rejeitada' ? 'Rejeição' : 'Aprovação'}
                  </h3>
                </div>

                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {status === 'rejeitada'
                          ? 'Rejeitado por'
                          : 'Aprovado por'}
                      </p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {getAprovadorNome()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Data da{' '}
                        {status === 'rejeitada' ? 'Rejeição' : 'Aprovação'}
                      </p>
                      <p className="text-base text-gray-700 dark:text-gray-300">
                        {formatDate((transferencia as any).data_aprovacao)}
                      </p>
                    </div>
                  </div>

                  {transferencia.observacoes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Observações
                      </p>
                      <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                        {transferencia.observacoes}
                      </p>
                    </div>
                  )}

                  {status === 'rejeitada' &&
                    (transferencia as any).motivo_rejeicao && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Motivo da Rejeição
                        </p>
                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                          {(transferencia as any).motivo_rejeicao}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Seção: Datas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Datas
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Data da Transferência
                    </p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(transferencia.data_transferencia)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Data de Criação
                    </p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(transferencia.criado_em)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Última Atualização
                    </p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(transferencia.atualizado_em)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de Status */}
            {status === 'aprovada' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Transferência Aprovada
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Esta transferência foi aprovada e está aguardando
                      efetivação. Após efetivada, o patrimônio será atualizado
                      com o novo setor e responsável.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'concluida' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Transferência Concluída
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Esta transferência foi efetivada com sucesso. O patrimônio
                      já está atualizado com o novo setor e responsável.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer com botões */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                bg-white dark:bg-[#2a2a2a]
                border border-gray-300 dark:border-gray-600
                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                transition-colors"
            >
              Fechar
            </button>

            <div className="flex gap-2">
              {canApprove && onAprovar && (
                <button
                  onClick={() => {
                    onAprovar(transferencia);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                    rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  Aprovar
                </button>
              )}

              {canReject && onRejeitar && (
                <button
                  onClick={() => {
                    onRejeitar(transferencia);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600
                    rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Rejeitar
                </button>
              )}

              {canTransfer && onEfetivar && (
                <button
                  onClick={() => {
                    onEfetivar(transferencia);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                    rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-200"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Efetivar Transferência
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferenciaDetalhes;
