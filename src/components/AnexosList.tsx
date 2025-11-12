import React, { useState, useCallback } from 'react';
import {
  Download,
  Trash2,
  FileText,
  Image,
  BookOpen,
  ClipboardCheck,
  Shield,
  File,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import { useAnexos } from '../context/AnexosContext';
import { usePatrimonios } from '../context/PatrimoniosContext'; // ← ADICIONAR ESTA LINHA
import { useAuth } from '../hooks/useAuth';
import {
  TIPO_ANEXO_LABELS,
  TIPO_ANEXO_COLORS,
  formatFileSize,
  getFilenameFromPath,
  getExtensionFromPath,
} from '../types/anexos.types';
import type { Anexo } from '../types/anexos.types';

interface AnexosListProps {
  patrimonioId?: number;
  showEmpty?: boolean;
}

const AnexosList: React.FC<AnexosListProps> = ({
  patrimonioId,
  showEmpty = true,
}) => {
  const { anexos, loading, downloadAnexo, deleteAnexo } = useAnexos();
  const { usuarios } = usePatrimonios(); // ← ADICIONAR ESTA LINHA
  const { user } = useAuth();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

  // ========================================
  // FILTRAR ANEXOS (se patrimonioId fornecido)
  // ========================================

  const anexosFiltrados = patrimonioId
    ? anexos.filter((a) => a.patrimonio_id === patrimonioId)
    : anexos;

  // ========================================
  // OBTER NOME DO USUÁRIO
  // ========================================

  const getUsuarioNome = (userId?: number): string => {
    if (!userId) return 'Desconhecido';
    const usuario = usuarios.find((u) => u.id === userId);
    return usuario?.username || `ID: ${userId}`;
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleDownload = useCallback(
    async (anexo: Anexo) => {
      try {
        setDownloadingId(anexo.id);
        const filename = getFilenameFromPath(anexo.caminho_arquivo);
        await downloadAnexo(anexo.id, filename);
      } catch (error) {
        console.error('Erro ao fazer download:', error);
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadAnexo],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setDeletingId(id);
        await deleteAnexo(id);
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Erro ao excluir anexo:', error);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteAnexo],
  );

  // ========================================
  // ÍCONE POR TIPO
  // ========================================

  const getIconByType = (tipo: string) => {
    const iconClass = 'w-5 h-5';
    switch (tipo) {
      case 'nota_fiscal':
        return <FileText className={iconClass} />;
      case 'foto':
        return <Image className={iconClass} />;
      case 'manual':
        return <BookOpen className={iconClass} />;
      case 'laudo':
        return <ClipboardCheck className={iconClass} />;
      case 'garantia':
        return <Shield className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  // ========================================
  // FORMATAR DATA
  // ========================================

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ========================================
  // RENDER
  // ========================================

  // Loading state
  if (loading && anexos.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  // Empty state
  if (anexosFiltrados.length === 0) {
    if (!showEmpty) return null;

    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nenhum anexo encontrado
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Faça upload de documentos, fotos ou outros arquivos relacionados
        </p>
      </div>
    );
  }

  // Lista de anexos
  return (
    <div className="space-y-3">
      {anexosFiltrados.map((anexo) => (
        <div
          key={anexo.id}
          className="bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Info do Anexo */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Ícone */}
              <div className="flex-shrink-0 mt-1">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                  {getIconByType(anexo.tipo)}
                </div>
              </div>

              {/* Detalhes */}
              <div className="flex-1 min-w-0">
                {/* Nome do arquivo */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {getFilenameFromPath(anexo.caminho_arquivo)}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase flex-shrink-0">
                    .{getExtensionFromPath(anexo.caminho_arquivo)}
                  </span>
                </div>

                {/* Badge do tipo */}
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${TIPO_ANEXO_COLORS[anexo.tipo] || TIPO_ANEXO_COLORS.outros}`}
                  >
                    {TIPO_ANEXO_LABELS[anexo.tipo] || 'Outros'}
                  </span>
                </div>

                {/* Descrição */}
                {anexo.descricao && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {anexo.descricao}
                  </p>
                )}

                {/* Metadados */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(anexo.criado_em)}
                  </div>
                  {anexo.enviado_por && (
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {getUsuarioNome(anexo.enviado_por)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Botão Download */}
              <button
                onClick={() => handleDownload(anexo)}
                disabled={downloadingId === anexo.id || deletingId === anexo.id}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Fazer download"
              >
                {downloadingId === anexo.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>

              {/* Botão Delete */}
              {showDeleteConfirm === anexo.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={deletingId === anexo.id}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(anexo.id)}
                    disabled={deletingId === anexo.id}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                  >
                    {deletingId === anexo.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    Confirmar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(anexo.id)}
                  disabled={
                    downloadingId === anexo.id || deletingId === anexo.id
                  }
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Excluir anexo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnexosList;
