import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2, } from 'lucide-react';
import { useAnexos } from '../context/AnexosContext';
import { validateFile, formatFileSize, MAX_FILE_SIZE_MB, ALLOWED_FILE_EXTENSIONS, TIPO_ANEXO_LABELS, } from '../types/anexos.types';
const AnexoUpload = ({ patrimonioId, onUploadSuccess, onCancel, }) => {
    const { uploadAnexo, uploading, uploadProgress, error, clearError } = useAnexos();
    // ========================================
    // ESTADOS LOCAIS
    // ========================================
    const [selectedFile, setSelectedFile] = useState(null);
    const [tipo, setTipo] = useState('outros');
    const [descricao, setDescricao] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);
    // ========================================
    // VALIDAÇÃO DE ARQUIVO
    // ========================================
    const validateAndSetFile = useCallback((file) => {
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
    }, [clearError]);
    // ========================================
    // HANDLERS DE ARQUIVO
    // ========================================
    const handleFileSelect = useCallback((e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            validateAndSetFile(file);
        }
    }, [validateAndSetFile]);
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
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    }, [validateAndSetFile]);
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
            const uploadData = {
                file: selectedFile,
                tipo,
                descricao: descricao.trim() || undefined,
                patrimonio_id: patrimonioId,
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
                onUploadSuccess === null || onUploadSuccess === void 0 ? void 0 : onUploadSuccess();
            }, 1500);
        }
        catch (err) {
            console.error('Erro no upload:', err);
            // Erro já tratado no context
        }
    }, [selectedFile, tipo, descricao, patrimonioId, uploadAnexo, onUploadSuccess]);
    // ========================================
    // RENDER
    // ========================================
    // Se upload foi bem-sucedido, mostra mensagem
    if (uploadSuccess) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800", children: [_jsx(CheckCircle, { className: "w-16 h-16 text-green-600 dark:text-green-400 mb-4" }), _jsx("p", { className: "text-lg font-semibold text-green-800 dark:text-green-200", children: "Upload conclu\u00EDdo com sucesso!" })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, className: `
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
          ${selectedFile ? 'bg-gray-50 dark:bg-[#2a2a2a]' : ''}
        `, children: [!selectedFile ? (_jsxs("div", { className: "space-y-4", children: [_jsx(Upload, { className: `w-12 h-12 mx-auto ${isDragging
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 dark:text-gray-500'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Arraste e solte o arquivo aqui" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "ou" })] }), _jsx("button", { type: "button", onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors", children: "Selecionar Arquivo" }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["M\u00E1ximo ", MAX_FILE_SIZE_MB, "MB \u2022 Formatos:", ' ', ALLOWED_FILE_EXTENSIONS.join(', ').toUpperCase()] })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-base font-medium text-gray-900 dark:text-gray-100", children: selectedFile.name }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: formatFileSize(selectedFile.size) })] }), _jsxs("button", { type: "button", onClick: handleRemoveFile, disabled: uploading, className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50", children: [_jsx(X, { className: "w-4 h-4" }), "Remover arquivo"] })] })), _jsx("input", { ref: fileInputRef, type: "file", onChange: handleFileSelect, accept: ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(','), className: "hidden", disabled: uploading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Tipo de Anexo *" }), _jsx("select", { value: tipo, onChange: (e) => setTipo(e.target.value), disabled: uploading, className: "w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 disabled:opacity-50", children: Object.entries(TIPO_ANEXO_LABELS).map(([value, label]) => (_jsx("option", { value: value, children: label }, value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Descri\u00E7\u00E3o (opcional)" }), _jsx("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value), disabled: uploading, rows: 3, placeholder: "Adicione uma descri\u00E7\u00E3o para o anexo...", className: "w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 resize-none" })] }), (validationError || error) && (_jsxs("div", { className: "flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: validationError || error })] })), uploading && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-700 dark:text-gray-300", children: "Enviando..." }), _jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [uploadProgress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300 ease-out", style: { width: `${uploadProgress}%` } }) })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [onCancel && (_jsx("button", { type: "button", onClick: onCancel, disabled: uploading, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors disabled:opacity-50", children: "Cancelar" })), _jsx("button", { type: "button", onClick: handleUpload, disabled: !selectedFile || uploading, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: uploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Enviando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4" }), "Fazer Upload"] })) })] })] }));
};
export default AnexoUpload;
