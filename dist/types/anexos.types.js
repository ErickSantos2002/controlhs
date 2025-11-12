/**
 * Tipos TypeScript para o módulo de Anexos
 * Sistema ControlHS
 */
// ========================================
// ENUMS E CONSTANTES
// ========================================
/**
 * Tipos de anexo permitidos
 */
export var TipoAnexo;
(function (TipoAnexo) {
    TipoAnexo["NOTA_FISCAL"] = "nota_fiscal";
    TipoAnexo["MANUAL"] = "manual";
    TipoAnexo["FOTO"] = "foto";
    TipoAnexo["LAUDO"] = "laudo";
    TipoAnexo["CONTRATO"] = "contrato";
    TipoAnexo["GARANTIA"] = "garantia";
    TipoAnexo["OUTROS"] = "outros";
})(TipoAnexo || (TipoAnexo = {}));
/**
 * Labels para exibição dos tipos de anexo
 */
export const TIPO_ANEXO_LABELS = {
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
export const TIPO_ANEXO_ICONS = {
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
export const TIPO_ANEXO_COLORS = {
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
];
/**
 * MIME types correspondentes
 */
export const ALLOWED_MIME_TYPES = {
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
// FUNÇÕES AUXILIARES (HELPERS)
// ========================================
/**
 * Valida se a extensão do arquivo é permitida
 */
export const validateFileExtension = (filename) => {
    var _a;
    const extension = (_a = filename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (!extension) {
        return {
            valid: false,
            error: 'Arquivo sem extensão',
        };
    }
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
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
export const validateFileSize = (size) => {
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
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
/**
 * Extrai informações do arquivo
 */
export const getFileInfo = (file) => {
    var _a;
    const extension = ((_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
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
export const validateFile = (file) => {
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
export const getFilenameFromPath = (path) => {
    return path.split('/').pop() || path;
};
/**
 * Obtém a extensão do arquivo a partir do caminho
 */
export const getExtensionFromPath = (path) => {
    var _a;
    const filename = getFilenameFromPath(path);
    return ((_a = filename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
};
