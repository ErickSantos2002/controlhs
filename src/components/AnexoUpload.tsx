import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAnexos } from '../context/AnexosContext';
import {
  validateFile,
  getFileInfo,
  formatFileSize,
  MAX_FILE_SIZE_MB,
  ALLOWED_FILE_EXTENSIONS,
  TIPO_ANEXO_LABELS,
} from '../types/anexos.types';
import type { AnexoUploadData } from '../types/anexos.types';

interface AnexoUploadProps {
  patrimonioId?: number;
  baixaId?: number;
  onUploadSuccess?: () => void;
  onCancel?: () => void;
}

const AnexoUpload: React.FC<AnexoUploadProps> = ({
  patrimonioId,
  baixaId,
  onUploadSuccess,
  onCancel,
}) => {
  const { uploadAnexo, uploading, uploadProgress, error, clearError } =
    useAnexos();

  // ========================================
  // ESTADOS LOCAIS
  // ========================================

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState('outros');
  const [descricao, setDescricao] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // VALIDAÇÃO DE ARQUIVO
  // ========================================

  const validateAndSetFile = useCallback(
    (file: File) => {
      setValidationError(null);
      clearError();

      const validation = validateFile(file);

      if (!validation.valid) {
        setValidationError(validation.error || 'Arquivo inválido');
        setSelectedFile(null);
        return false;
      }

      setSelectedFile(file);
      return true;
    },
    [clearError],
  );

  // ========================================
  // HANDLERS DE ARQUIVO
  // ========================================

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearError]);

  // ========================================
  // DRAG & DROP
  // ========================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile],
  );

  // ========================================
  // UPLOAD
  // ========================================

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setValidationError('Selecione um arquivo');
      return;
    }

    if (!tipo) {
      setValidationError('Selecione o tipo do anexo');
      return;
    }

    try {
      const uploadData: AnexoUploadData = {
        file: selectedFile,
        tipo,
        descricao: descricao.trim() || undefined,
        patrimonio_id: patrimonioId,
        baixa_id: baixaId,
      };

      await uploadAnexo(uploadData);

      // ✅ Upload bem-sucedido
      setUploadSuccess(true);

      // Limpar formulário após 1.5s
      setTimeout(() => {
        setSelectedFile(null);
        setTipo('outros');
        setDescricao('');
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadSuccess?.();
      }, 1500);
    } catch (err: any) {
      console.error('Erro no upload:', err);
      // Erro já tratado no context
    }
  }, [
    selectedFile,
    tipo,
    descricao,
    patrimonioId,
    uploadAnexo,
    onUploadSuccess,
  ]);

  // ========================================
  // RENDER
  // ========================================

  // Se upload foi bem-sucedido, mostra mensagem
  if (uploadSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
        <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mb-4" />
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
          Upload concluído com sucesso!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 📤 Área de Upload / Drag & Drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${selectedFile ? 'bg-gray-50 dark:bg-[#2a2a2a]' : ''}
        `}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <Upload
              className={`w-12 h-12 mx-auto ${
                isDragging
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            />
            <div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arraste e solte o arquivo aqui
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ou</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Selecionar Arquivo
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Máximo {MAX_FILE_SIZE_MB}MB • Formatos:{' '}
              {ALLOWED_FILE_EXTENSIONS.join(', ').toUpperCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <FileText className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Remover arquivo
            </button>
          </div>
        )}

        {/* Input escondido */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* 🏷️ Tipo do Anexo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Anexo *
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          disabled={uploading}
          className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        >
          {Object.entries(TIPO_ANEXO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 📝 Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={uploading}
          rows={3}
          placeholder="Adicione uma descrição para o anexo..."
          className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 resize-none"
        />
      </div>

      {/* ⚠️ Mensagens de Erro */}
      {(validationError || error) && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">
            {validationError || error}
          </p>
        </div>
      )}

      {/* 📊 Barra de Progresso */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Enviando...
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 🎬 Botões de Ação */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Fazer Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnexoUpload;
