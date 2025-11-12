import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, } from 'react';
import { listAnexos, uploadAnexo as apiUploadAnexo, updateAnexo as apiUpdateAnexo, deleteAnexo as apiDeleteAnexo, downloadAnexo as apiDownloadAnexo, } from '../services/controlapi';
import { validateFile, getFileInfo } from '../types/anexos.types';
// ========================================
// CONTEXT & PROVIDER
// ========================================
const AnexosContext = createContext(undefined);
export const AnexosProvider = ({ children, }) => {
    // ========================================
    // ESTADOS PRINCIPAIS
    // ========================================
    const [anexos, setAnexos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    // ========================================
    // FUNÇÃO PARA LIMPAR ERRO
    // ========================================
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    // ========================================
    // LISTAR ANEXOS
    // ========================================
    const listAnexosHandler = useCallback(async (patrimonioId) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            const anexosData = await listAnexos(patrimonioId);
            setAnexos(anexosData || []);
        }
        catch (err) {
            console.error('Erro ao carregar anexos:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) ||
                'Não foi possível carregar os anexos. Verifique sua conexão.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // UPLOAD DE ANEXO
    // ========================================
    const uploadAnexo = useCallback(async (data) => {
        var _a, _b;
        try {
            setUploading(true);
            setUploadProgress(0);
            setError(null);
            // 🛡️ Validação do arquivo
            const validation = validateFile(data.file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            // 📊 Log das informações do arquivo
            const fileInfo = getFileInfo(data.file);
            console.log('Fazendo upload do arquivo:', fileInfo);
            // 🔨 Construir FormData
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('tipo', data.tipo);
            if (data.patrimonio_id) {
                formData.append('patrimonio_id', data.patrimonio_id.toString());
            }
            if (data.descricao) {
                formData.append('descricao', data.descricao);
            }
            // 📤 Simular progresso (axios não suporta nativamente em todas as configs)
            setUploadProgress(30);
            // 🚀 Fazer upload
            const novoAnexo = await apiUploadAnexo(formData);
            setUploadProgress(100);
            // ✅ Adicionar à lista local
            setAnexos((prev) => [novoAnexo, ...prev]);
            console.log('Anexo enviado com sucesso!');
            return novoAnexo;
        }
        catch (err) {
            console.error('Erro ao fazer upload do anexo:', err);
            const errorMessage = err.message || ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao enviar anexo';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, []);
    // ========================================
    // ATUALIZAR ANEXO
    // ========================================
    const updateAnexo = useCallback(async (id, data) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            const anexoAtualizado = await apiUpdateAnexo(id, data);
            setAnexos((prev) => prev.map((a) => (a.id === id ? anexoAtualizado : a)));
            console.log('Anexo atualizado com sucesso!');
        }
        catch (err) {
            console.error('Erro ao atualizar anexo:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao atualizar anexo');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // EXCLUIR ANEXO
    // ========================================
    const deleteAnexo = useCallback(async (id) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            await apiDeleteAnexo(id);
            setAnexos((prev) => prev.filter((a) => a.id !== id));
            console.log('Anexo excluído com sucesso!');
        }
        catch (err) {
            console.error('Erro ao excluir anexo:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao excluir anexo');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // DOWNLOAD DE ANEXO
    // ========================================
    const downloadAnexo = useCallback(async (id, nomeOriginal) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            await apiDownloadAnexo(id, nomeOriginal);
            console.log('Download iniciado!');
        }
        catch (err) {
            console.error('Erro ao fazer download do anexo:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao fazer download');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // REFRESH ANEXOS
    // ========================================
    const refreshAnexos = useCallback(async (patrimonioId) => {
        await listAnexosHandler(patrimonioId);
    }, [listAnexosHandler]);
    // ========================================
    // CONTEXT VALUE
    // ========================================
    const contextValue = {
        // Dados
        anexos,
        // Estados
        loading,
        uploading,
        error,
        uploadProgress,
        // Funções CRUD
        listAnexos: listAnexosHandler,
        uploadAnexo,
        updateAnexo,
        deleteAnexo,
        downloadAnexo,
        // Funções auxiliares
        refreshAnexos,
        clearError,
    };
    return (_jsx(AnexosContext.Provider, { value: contextValue, children: children }));
};
// ========================================
// HOOK CUSTOMIZADO
// ========================================
export const useAnexos = () => {
    const context = useContext(AnexosContext);
    if (!context) {
        throw new Error('useAnexos deve ser usado dentro de AnexosProvider');
    }
    return context;
};
