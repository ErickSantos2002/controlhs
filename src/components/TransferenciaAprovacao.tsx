import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  ArrowRightLeft,
} from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
import type {
  Transferencia,
  TipoAprovacao,
} from '../types/transferencias.types';

interface TransferenciaAprovacaoProps {
  isOpen: boolean;
  onClose: () => void;
  transferencia: Transferencia | null;
  tipo: TipoAprovacao;
  onSuccess?: () => void;
}

const TransferenciaAprovacao: React.FC<TransferenciaAprovacaoProps> = ({
  isOpen,
  onClose,
  transferencia,
  tipo,
  onSuccess,
}) => {
  const {
    patrimonios,
    setores,
    usuarios,
    aprovarTransferencia,
    rejeitarTransferencia,
  } = useTransferencias();

  // ========================================
  // ESTADOS
  // ========================================

  const [observacoes, setObservacoes] = useState('');
  const [motivo, setMotivo] = useState('');
  const [efetivarAutomaticamente, setEfetivarAutomaticamente] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // HELPERS
  // ========================================

  const getPatrimonioNome = (): string => {
    if (!transferencia) return 'N/A';
    const patrimonio = patrimonios.find(
      (p) => p.id === transferencia.patrimonio_id,
    );
    return patrimonio?.nome || 'N/A';
  };

  const getSetorOrigemNome = (): string => {
    if (!transferencia) return 'N/A';
    const setor = setores.find((s) => s.id === transferencia.setor_origem_id);
    return setor?.nome || 'N/A';
  };

  const getSetorDestinoNome = (): string => {
    if (!transferencia) return 'N/A';
    const setor = setores.find((s) => s.id === transferencia.setor_destino_id);
    return setor?.nome || 'N/A';
  };

  const getResponsavelOrigemNome = (): string => {
    if (!transferencia) return 'N/A';
    const user = usuarios.find(
      (u) => u.id === transferencia.responsavel_origem_id,
    );
    return user?.username || 'N/A';
  };

  const getResponsavelDestinoNome = (): string => {
    if (!transferencia) return 'N/A';
    const user = usuarios.find(
      (u) => u.id === transferencia.responsavel_destino_id,
    );
    return user?.username || 'N/A';
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleSubmit = async () => {
    if (!transferencia) return;

    if (tipo === 'rejeitar' && !motivo.trim()) {
      setError('O motivo da rejeição é obrigatório');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (tipo === 'aprovar') {
        await aprovarTransferencia(
          transferencia.id,
          observacoes || undefined,
          efetivarAutomaticamente,
        );
      } else {
        await rejeitarTransferencia(transferencia.id, motivo);
      }

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setObservacoes('');
      setMotivo('');
      setEfetivarAutomaticamente(false);

      onClose();
    } catch (err: any) {
      console.error(`Erro ao ${tipo} transferência:`, err);
      setError(err.response?.data?.detail || `Erro ao ${tipo} transferência`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !transferencia) return null;

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
        <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {tipo === 'aprovar' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Aprovar Transferência #{transferencia.id}
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Rejeitar Transferência #{transferencia.id}
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Mensagem de erro */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Erro ao processar
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumo da Transferência */}
            <div className="mb-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                Resumo da Transferência
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Patrimônio:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getPatrimonioNome()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Setor:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getSetorOrigemNome()} → {getSetorDestinoNome()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Responsável:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getResponsavelOrigemNome()} → {getResponsavelDestinoNome()}
                  </span>
                </div>

                {transferencia.motivo && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-500 dark:text-gray-400">
                      Motivo:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {transferencia.motivo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Formulário de Aprovação */}
            {tipo === 'aprovar' ? (
              <div className="space-y-4">
                {/* Observações (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Observações da Aprovação (Opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    placeholder="Adicione observações sobre a aprovação..."
                    className="w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      border-gray-300 dark:border-gray-600
                      focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                      focus:border-transparent transition-colors"
                  />
                </div>

                {/* Checkbox Efetivar Automaticamente */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="efetivar"
                    checked={efetivarAutomaticamente}
                    onChange={(e) =>
                      setEfetivarAutomaticamente(e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 
                      bg-white dark:bg-[#2a2a2a]
                      border-gray-300 dark:border-gray-600
                      rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <label htmlFor="efetivar" className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                      Efetivar automaticamente após aprovação
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Ao marcar esta opção, o patrimônio será imediatamente
                      transferido para o novo setor e responsável.
                    </p>
                  </label>
                </div>

                {/* Alerta */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ao aprovar, você autoriza a transferência deste patrimônio.
                    {efetivarAutomaticamente
                      ? ' A transferência será efetivada imediatamente.'
                      : ' A transferência ficará aguardando efetivação.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Formulário de Rejeição */
              <div className="space-y-4">
                {/* Motivo da Rejeição (Obrigatório) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Motivo da Rejeição *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    placeholder="Explique o motivo da rejeição (obrigatório)..."
                    className={`w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${
                        error && !motivo.trim()
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
                      focus:border-transparent transition-colors`}
                  />
                  {error && !motivo.trim() && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      O motivo da rejeição é obrigatório
                    </p>
                  )}
                </div>

                {/* Alerta */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Esta ação não pode ser desfeita. A transferência será
                    rejeitada e o solicitante será notificado.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer com botões */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium
                text-gray-700 dark:text-gray-300
                bg-white dark:bg-[#2a2a2a]
                border border-gray-300 dark:border-gray-600
                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving || (tipo === 'rejeitar' && !motivo.trim())}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                ${
                  tipo === 'aprovar'
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                }
                rounded-lg shadow-sm hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : tipo === 'aprovar' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Aprovação
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Confirmar Rejeição
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferenciaAprovacao;
