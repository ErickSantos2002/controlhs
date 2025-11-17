import React, { useState, useEffect } from 'react';
import { FileText, Upload as UploadIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAnexos } from '../context/AnexosContext';
import AnexoUpload from './AnexoUpload';
import AnexosList from './AnexosList';

interface AnexosSectionProps {
  patrimonioId?: number;
  baixaId?: number;
  showUploadByDefault?: boolean;
}

const AnexosSection: React.FC<AnexosSectionProps> = ({
  patrimonioId,
  baixaId,
  showUploadByDefault = false,
}) => {
  const { listAnexos, anexos } = useAnexos();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================

  const [showUpload, setShowUpload] = useState(showUploadByDefault);
  const [isExpanded, setIsExpanded] = useState(true);

  // ========================================
  // CARREGAR ANEXOS AO MONTAR
  // ========================================

  useEffect(() => {
    listAnexos(patrimonioId);
  }, [patrimonioId, listAnexos]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleUploadSuccess = () => {
    // Recarrega a lista após upload bem-sucedido
    listAnexos(patrimonioId);
    // Fecha o formulário de upload
    setShowUpload(false);
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
  };

  // ========================================
  // CONTAGEM DE ANEXOS
  // ========================================

  const anexosCount = anexos.filter((a) => {
    if (patrimonioId && baixaId) {
      return a.patrimonio_id === patrimonioId && a.baixa_id === baixaId;
    }
    if (patrimonioId) {
      return a.patrimonio_id === patrimonioId;
    }
    if (baixaId) {
      return a.baixa_id === baixaId;
    }
    return false;
  }).length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-4">
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Anexos</span>
          {anexosCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-full">
              {anexosCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Botão de Upload */}
        {isExpanded && !showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <UploadIcon className="w-4 h-4" />
            Adicionar Anexo
          </button>
        )}
      </div>

      {/* Conteúdo Expandível */}
      {isExpanded && (
        <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-4">
          {/* Formulário de Upload */}
          {showUpload && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Novo Anexo
                </h3>
              </div>
              <AnexoUpload
                patrimonioId={patrimonioId}
                baixaId={baixaId}
                onUploadSuccess={handleUploadSuccess}
                onCancel={handleCancelUpload}
              />
            </div>
          )}

          {/* Lista de Anexos */}
          <div>
            {!showUpload && anexosCount === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nenhum anexo cadastrado
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Adicione documentos, fotos ou arquivos relacionados
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  <UploadIcon className="w-4 h-4" />
                  Adicionar Primeiro Anexo
                </button>
              </div>
            ) : (
              <>
                {anexosCount > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {anexosCount} {anexosCount === 1 ? 'anexo' : 'anexos'}{' '}
                      cadastrado{anexosCount === 1 ? '' : 's'}
                    </h3>
                  </div>
                )}
                <AnexosList
                  patrimonioId={patrimonioId}
                  baixaId={baixaId}
                  showEmpty={false}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnexosSection;