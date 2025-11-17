import React from 'react';
import { X, Check, XCircle, User, FileText } from 'lucide-react';
import { useBaixas } from '../context/BaixasContext';
import { AnexosProvider } from '../context/AnexosContext';
import AnexosSection from './AnexosSection';
import type { Baixa } from '../types/baixas.types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TIPO_BAIXA_LABELS,
  TIPO_BAIXA_COLORS,
} from '../types/baixas.types';

interface BaixaDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  baixa: Baixa | null;
  onAprovar?: (baixa: Baixa) => void;
  onRejeitar?: (baixa: Baixa) => void;
}

const BaixaDetalhes: React.FC<BaixaDetalhesProps> = ({
  isOpen,
  onClose,
  baixa,
  onAprovar,
  onRejeitar,
}) => {
  const { patrimonios, usuarios, getBaixaStatus, podeAprovar } = useBaixas();

  if (!isOpen || !baixa) return null;

  const status = getBaixaStatus(baixa);
  const patrimonio = patrimonios.find((p) => p.id === baixa.patrimonio_id);
  const aprovador = baixa.aprovado_por
    ? usuarios.find((u) => u.id === baixa.aprovado_por)
    : null;

  const podeAprovarBaixa = podeAprovar(baixa) && status === 'pendente';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#1e1e1e] rounded-xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-200 dark:border-[#2d2d2d]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#facc15]">
                Detalhes da Baixa #{baixa.id}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_BAIXA_COLORS[baixa.tipo]}`}
                >
                  {TIPO_BAIXA_LABELS[baixa.tipo]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Patrimônio */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Patrimônio
              </h3>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {patrimonio?.nome || 'N/A'}
              </p>
              {patrimonio?.numero_serie && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nº Série: {patrimonio.numero_serie}
                </p>
              )}
            </div>

            {/* Informações da Baixa */}
            <div className="grid grid-cols-2 gap-4">
              {aprovador && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <User className="w-4 h-4" />
                    Aprovador
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {aprovador.username}
                  </p>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                <FileText className="w-4 h-4" />
                Motivo
              </div>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg">
                {baixa.motivo}
              </p>
            </div>

            {/* Seção de Anexos */}
            <div>
              <AnexosProvider>
                <AnexosSection
                  patrimonioId={baixa.patrimonio_id}
                  baixaId={baixa.id}
                />
              </AnexosProvider>
            </div>
          </div>

          {/* Footer com botões de ação */}
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-[#2d2d2d]">
            {podeAprovarBaixa && onAprovar && onRejeitar && (
              <>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Tem certeza que deseja rejeitar esta baixa?',
                      )
                    ) {
                      onRejeitar(baixa);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Rejeitar
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Tem certeza que deseja aprovar esta baixa?',
                      )
                    ) {
                      onAprovar(baixa);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Aprovar
                  </div>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaixaDetalhes;
