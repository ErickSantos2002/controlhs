/**
 * Tipos TypeScript para o módulo de Anexos
 * Sistema ControlHS
 */

// ========================================
// INTERFACES PRINCIPAIS
// ========================================

/**
 * Interface principal do Anexo
 * Representa um arquivo anexo completo retornado pela API
 */
export interface Anexo {
  id: number;
  patrimonio_id?: number;
  baixa_id?: number;
  tipo: string; // Ex: "nota_fiscal", "manual", "foto", "laudo"
  caminho_arquivo: string; // Caminho no servidor
  descricao?: string;
  enviado_por?: number; // ID do usuário que fez upload
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface para criação de novo anexo
 * Payload enviado para POST /anexos/
 *
 * ⚠️ NOTA: O upload real usa FormData, não JSON
 */
export interface AnexoCreate {
  patrimonio_id?: number;
  baixa_id?: number;
  tipo: string; // obrigatório
  descricao?: string;
  file: File; // Arquivo a ser enviado
}

/**
 * Interface para atualização de anexo
 * Payload enviado para PUT /anexos/{id}
 * 
 * ⚠️ NOTA: Não permite alterar o arquivo, apenas metadados
 */
export interface AnexoUpdate {
  tipo?: string;
  descricao?: string;
  // caminho_arquivo não pode ser alterado via update
}

// ========================================
// INTERFACES DE APOIO
// ========================================

/**
 * Interface para FormData de upload
 * Usado para facilitar a construção do FormData
 */
export interface AnexoUploadData {
  patrimonio_id?: number;
  baixa_id?: number;
  tipo: string;
  descricao?: string;
  file: File;
}

/**
 * Interface para estatísticas de anexos
 * Retornado por GET /anexos/stats/summary
 */
export interface AnexosStats {
  total_anexos: number;
  por_tipo: Record<string, number>;
  upload_dir: string;
  max_file_size_mb: number;
}

/**
 * Interface para progresso de upload
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ========================================
// INTERFACES DO CONTEXT
// ========================================

/**
 * Interface do AnexosContext
 */
export interface AnexosContextData {
  // Dados principais
  anexos: Anexo[];
  
  // Estados
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadProgress: number;

  // Funções CRUD
  listAnexos: (patrimonioId?: number) => Promise<void>;
  uploadAnexo: (data: AnexoUploadData) => Promise<Anexo>;
  updateAnexo: (id: number, data: AnexoUpdate) => Promise<void>;
  deleteAnexo: (id: number) => Promise<void>;
  downloadAnexo: (id: number, nomeOriginal?: string) => Promise<void>;
  
  // Funções auxiliares
  refreshAnexos: (patrimonioId?: number) => Promise<void>;
  clearError: () => void;
}

// ========================================
// ENUMS E CONSTANTES
// ========================================

/**
 * Tipos de anexo permitidos
 */
export enum TipoAnexo {
  NOTA_FISCAL = 'nota_fiscal',
  MANUAL = 'manual',
  FOTO = 'foto',
  LAUDO = 'laudo',
  CONTRATO = 'contrato',
  GARANTIA = 'garantia',
  OUTROS = 'outros',
}

/**
 * Labels para exibição dos tipos de anexo
 */
export const TIPO_ANEXO_LABELS: Record<string, string> = {
  nota_fiscal: 'Nota Fiscal',
  manual: 'Manual',
  foto: 'Foto',
  laudo: 'Laudo Técnico',
  contrato: 'Contrato',
  garantia: 'Garantia',
  outros: 'Outros',
};

/**
 * Ícones para cada tipo de anexo (Lucide React icons)
 */
export const TIPO_ANEXO_ICONS: Record<string, string> = {
  nota_fiscal: 'FileText',
  manual: 'BookOpen',
  foto: 'Image',
  laudo: 'ClipboardCheck',
  contrato: 'FileSignature',
  garantia: 'Shield',
  outros: 'File',
};

/**
 * Cores dos badges de tipo
 */
export const TIPO_ANEXO_COLORS: Record<string, string> = {
  nota_fiscal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  foto: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-400',
  laudo: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  contrato: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400',
  garantia: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400',
  outros: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400',
};

/**
 * Extensões de arquivo permitidas
 * Deve estar sincronizado com o backend
 */
export const ALLOWED_FILE_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'doc',
  'docx',
  'xls',
  'xlsx',
] as const;

/**
 * MIME types correspondentes
 */
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/**
 * Tamanho máximo de arquivo (10MB)
 * Deve estar sincronizado com o backend
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes

/**
 * Tamanho máximo formatado para exibição
 */
export const MAX_FILE_SIZE_MB = 10;

// ========================================
// TYPES AUXILIARES
// ========================================

/**
 * Type para erros de validação
 */
export type AnexoValidationErrors = Partial<Record<keyof AnexoCreate, string>>;

/**
 * Type para status de upload
 */
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Type para extensões permitidas
 */
export type AllowedExtension = typeof ALLOWED_FILE_EXTENSIONS[number];

/**
 * Interface para resultado de validação de arquivo
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Interface para informações do arquivo
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  sizeFormatted: string;
}

// ========================================
// FUNÇÕES AUXILIARES (HELPERS)
// ========================================

/**
 * Valida se a extensão do arquivo é permitida
 */
export const validateFileExtension = (filename: string): FileValidationResult => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return {
      valid: false,
      error: 'Arquivo sem extensão',
    };
  }
  
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as AllowedExtension)) {
    return {
      valid: false,
      error: `Extensão .${extension} não permitida. Use: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
    };
  }
  
  return { valid: true };
};

/**
 * Valida o tamanho do arquivo
 */
export const validateFileSize = (size: number): FileValidationResult => {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`,
    };
  }
  
  return { valid: true };
};

/**
 * Formata tamanho de arquivo em bytes para formato legível
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Extrai informações do arquivo
 */
export const getFileInfo = (file: File): FileInfo => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    sizeFormatted: formatFileSize(file.size),
  };
};

/**
 * Valida arquivo completo (extensão + tamanho)
 */
export const validateFile = (file: File): FileValidationResult => {
  // Valida extensão
  const extensionValidation = validateFileExtension(file.name);
  if (!extensionValidation.valid) {
    return extensionValidation;
  }
  
  // Valida tamanho
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  return { valid: true };
};

/**
 * Obtém o nome do arquivo a partir do caminho
 */
export const getFilenameFromPath = (path: string): string => {
  return path.split('/').pop() || path;
};

/**
 * Obtém a extensão do arquivo a partir do caminho
 */
export const getExtensionFromPath = (path: string): string => {
  const filename = getFilenameFromPath(path);
  return filename.split('.').pop()?.toLowerCase() || '';
};