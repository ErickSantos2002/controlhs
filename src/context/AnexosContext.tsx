import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import {
  listAnexos,
  uploadAnexo as apiUploadAnexo,
  updateAnexo as apiUpdateAnexo,
  deleteAnexo as apiDeleteAnexo,
  downloadAnexo as apiDownloadAnexo,
} from '../services/controlapi';
import type {
  Anexo,
  AnexoUploadData,
  AnexoUpdate,
  AnexosContextData,
} from '../types/anexos.types';
import { validateFile, getFileInfo } from '../types/anexos.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const AnexosContext = createContext<AnexosContextData | undefined>(undefined);

export const AnexosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FUNÇÃO PARA LIMPAR ERRO
  // ========================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // LISTAR ANEXOS
  // ========================================

  const listAnexosHandler = useCallback(
    async (patrimonioId?: number): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const anexosData = await listAnexos(patrimonioId);
        setAnexos(anexosData || []);
      } catch (err: any) {
        console.error('Erro ao carregar anexos:', err);
        setError(
          err.response?.data?.detail ||
            'Não foi possível carregar os anexos. Verifique sua conexão.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========================================
  // UPLOAD DE ANEXO
  // ========================================

  const uploadAnexo = useCallback(
    async (data: AnexoUploadData): Promise<Anexo> => {
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

        if (data.baixa_id) {
          formData.append('baixa_id', data.baixa_id.toString());
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
      } catch (err: any) {
        console.error('Erro ao fazer upload do anexo:', err);
        const errorMessage =
          err.message || err.response?.data?.detail || 'Erro ao enviar anexo';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [],
  );

  // ========================================
  // ATUALIZAR ANEXO
  // ========================================

  const updateAnexo = useCallback(
    async (id: number, data: AnexoUpdate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const anexoAtualizado = await apiUpdateAnexo(id, data);

        setAnexos((prev) =>
          prev.map((a) => (a.id === id ? anexoAtualizado : a)),
        );

        console.log('Anexo atualizado com sucesso!');
      } catch (err: any) {
        console.error('Erro ao atualizar anexo:', err);
        setError(err.response?.data?.detail || 'Erro ao atualizar anexo');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========================================
  // EXCLUIR ANEXO
  // ========================================

  const deleteAnexo = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiDeleteAnexo(id);

      setAnexos((prev) => prev.filter((a) => a.id !== id));

      console.log('Anexo excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir anexo:', err);
      setError(err.response?.data?.detail || 'Erro ao excluir anexo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // DOWNLOAD DE ANEXO
  // ========================================

  const downloadAnexo = useCallback(
    async (id: number, nomeOriginal?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await apiDownloadAnexo(id, nomeOriginal);

        console.log('Download iniciado!');
      } catch (err: any) {
        console.error('Erro ao fazer download do anexo:', err);
        setError(err.response?.data?.detail || 'Erro ao fazer download');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========================================
  // REFRESH ANEXOS
  // ========================================

  const refreshAnexos = useCallback(
    async (patrimonioId?: number): Promise<void> => {
      await listAnexosHandler(patrimonioId);
    },
    [listAnexosHandler],
  );

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AnexosContextData = {
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

  return (
    <AnexosContext.Provider value={contextValue}>
      {children}
    </AnexosContext.Provider>
  );
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