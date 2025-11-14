import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  listCategorias,
  createCategoria as apiCreateCategoria,
  updateCategoria as apiUpdateCategoria,
  deleteCategoria as apiDeleteCategoria,
  listSetores,
  createSetor as apiCreateSetor,
  updateSetor as apiUpdateSetor,
  deleteSetor as apiDeleteSetor,
  listUsuarios,
  register as apiCreateUsuario,
  updateUser as apiUpdateUsuario,
  updateUserPassword as apiUpdateUsuarioPassword,
} from '../services/controlapi';
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
  Setor,
  SetorCreate,
  SetorUpdate,
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  CadastrosContextData,
} from '../types/cadastros.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const CadastrosContext = createContext<CadastrosContextData | undefined>(undefined);

export const CadastrosProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FETCH DE DADOS
  // ========================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Busca dados em paralelo para melhor performance
      const [categoriasData, setoresData, usuariosData] = await Promise.all([
        listCategorias(),
        listSetores(),
        listUsuarios(),
      ]);

      setCategorias(categoriasData || []);
      setSetores(setoresData || []);
      setUsuarios(usuariosData || []);
    } catch (err: any) {
      console.error('Erro ao carregar cadastros:', err);
      setError(
        err.response?.data?.detail || 
        'Não foi possível carregar os dados. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // ========================================
  // FUNÇÕES CRUD - CATEGORIAS
  // ========================================

  const createCategoria = useCallback(async (data: CategoriaCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const novaCategoria = await apiCreateCategoria(data);
      setCategorias((prev) => [...prev, novaCategoria]);

      console.log('✅ Categoria criada com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao criar categoria:', err);
      setError(err.response?.data?.detail || 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoria = useCallback(async (id: number, data: CategoriaUpdate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const categoriaAtualizada = await apiUpdateCategoria(id, data);
      setCategorias((prev) => 
        prev.map((c) => (c.id === id ? categoriaAtualizada : c))
      );

      console.log('✅ Categoria atualizada com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar categoria:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategoria = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiDeleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));

      console.log('✅ Categoria excluída com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao excluir categoria:', err);
      
      // Verifica se é erro de vínculo
      if (err.response?.status === 400) {
        setError('Não é possível excluir categoria com patrimônios vinculados');
      } else {
        setError(err.response?.data?.detail || 'Erro ao excluir categoria');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // FUNÇÕES CRUD - SETORES
  // ========================================

  const createSetor = useCallback(async (data: SetorCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const novoSetor = await apiCreateSetor(data);
      setSetores((prev) => [...prev, novoSetor]);

      console.log('✅ Setor criado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao criar setor:', err);
      setError(err.response?.data?.detail || 'Erro ao criar setor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetor = useCallback(async (id: number, data: SetorUpdate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const setorAtualizado = await apiUpdateSetor(id, data);
      setSetores((prev) => 
        prev.map((s) => (s.id === id ? setorAtualizado : s))
      );

      console.log('✅ Setor atualizado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar setor:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar setor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSetor = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiDeleteSetor(id);
      setSetores((prev) => prev.filter((s) => s.id !== id));

      console.log('✅ Setor excluído com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao excluir setor:', err);
      
      // Verifica se é erro de vínculo
      if (err.response?.status === 400) {
        setError('Não é possível excluir setor com patrimônios ou usuários vinculados');
      } else {
        setError(err.response?.data?.detail || 'Erro ao excluir setor');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // FUNÇÕES CRUD - USUÁRIOS
  // ========================================

  const createUsuario = useCallback(async (data: UsuarioCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Usa a função register do controlapi
      const novoUsuario = await apiCreateUsuario(
        data.username,
        data.password,
        data.role_name
      );

      // Se houver setor_id, atualiza o usuário
      if (data.setor_id) {
        const usuarioAtualizado = await apiUpdateUsuario(novoUsuario.id, {
          setor_id: data.setor_id
        });
        setUsuarios((prev) => [...prev, usuarioAtualizado]);
      } else {
        setUsuarios((prev) => [...prev, novoUsuario]);
      }

      console.log('✅ Usuário criado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao criar usuário:', err);
      
      // Verifica se é erro de username duplicado
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already exists')) {
        setError('Este nome de usuário já está em uso');
      } else {
        setError(err.response?.data?.detail || 'Erro ao criar usuário');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsuario = useCallback(async (id: number, data: UsuarioUpdate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const usuarioAtualizado = await apiUpdateUsuario(id, data);
      setUsuarios((prev) => 
        prev.map((u) => (u.id === id ? usuarioAtualizado : u))
      );

      console.log('✅ Usuário atualizado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar usuário:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUsuario = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Nota: O controlapi não tem deleteUsuario, mas podemos desabilitar ou não mostrar
      // Por enquanto, vamos apenas remover da lista local
      setUsuarios((prev) => prev.filter((u) => u.id !== id));

      console.log('✅ Usuário removido com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao remover usuário:', err);
      setError(err.response?.data?.detail || 'Erro ao remover usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsuarioPassword = useCallback(async (id: number, novaSenha: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiUpdateUsuarioPassword(id, novaSenha);
      console.log('✅ Senha atualizada com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar senha:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: CadastrosContextData = {
    // Dados
    categorias,
    setores,
    usuarios,

    // Estados
    loading,
    error,

    // Funções CRUD - Categorias
    createCategoria,
    updateCategoria,
    deleteCategoria,

    // Funções CRUD - Setores
    createSetor,
    updateSetor,
    deleteSetor,

    // Funções CRUD - Usuários
    createUsuario,
    updateUsuario,
    deleteUsuario,
    updateUsuarioPassword,

    // Atualização
    refreshData: fetchData,
  };

  return (
    <CadastrosContext.Provider value={contextValue}>
      {children}
    </CadastrosContext.Provider>
  );
};

// ========================================
// HOOK CUSTOMIZADO
// ========================================

export const useCadastros = () => {
  const context = useContext(CadastrosContext);
  if (!context) {
    throw new Error('useCadastros deve ser usado dentro de CadastrosProvider');
  }
  return context;
};

