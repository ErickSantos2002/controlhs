import axios from 'axios';
import type { TransferenciaAprovar, TransferenciaRejeitar } from '../types/transferencias.types';
import type { LogCreate, FiltrosLog } from '../types/logs.types';

const baseURL =
  import.meta.env.VITE_API_URL ||
  'https://authapicontrolhs.healthsafetytech.com';

const api = axios.create({ baseURL });

// ========================================
// 🔧 CONFIGURAÇÃO DO INTERCEPTOR
// ========================================

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // ✅ Só redireciona se NÃO estiver na página de login
      // E se NÃO for uma requisição de login
      const isLoginPage = window.location.pathname === '/login';
      const isLoginRequest = error.config?.url?.includes('/login');

      if (!isLoginPage && !isLoginRequest) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ========================================
// 🔐 AUTH
// ========================================

export async function login(username: string, password: string) {
  const { data } = await api.post('/login', { username, password });
  // Salva o token no localStorage
  setAuthToken(data.access_token);
  return data;
}

export async function register(
  username: string,
  password: string,
  role_name?: string,
) {
  const { data } = await api.post('/register', {
    username,
    password,
    role_name,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/me');
  return data;
}

// Função para setar o token após login
export function setAuthToken(token: string) {
  localStorage.setItem('access_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Função para remover o token no logout
export function removeAuthToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('id');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  delete api.defaults.headers.common['Authorization'];
}

// ========================================
// 👤 USERS
// ========================================

export async function listUsuarios() {
  const { data } = await api.get('/users/');
  return data;
}

export async function getUserById(user_id: number) {
  const { data } = await api.get(`/users/${user_id}`);
  return data;
}

export async function updateUser(user_id: number, payload: any) {
  const { data } = await api.put(`/users/${user_id}`, payload);
  return data;
}

// Função específica para atualizar senha
export async function updateUserPassword(userId: number, novaSenha: string) {
  try {
    const response = await api.put(`/users/${userId}`, {
      password: novaSenha,
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar senha:', error);
    throw error;
  }
}

// ========================================
// 🏷️ CATEGORIAS
// ========================================

export async function listCategorias() {
  const { data } = await api.get('/categorias/');
  return data;
}

export async function createCategoria(payload: any) {
  const { data } = await api.post('/categorias/', payload);
  return data;
}

export async function updateCategoria(id: number, payload: any) {
  const { data } = await api.put(`/categorias/${id}`, payload);
  return data;
}

export async function deleteCategoria(id: number) {
  await api.delete(`/categorias/${id}`);
}

// ========================================
// 🏢 SETORES
// ========================================

export async function listSetores() {
  const { data } = await api.get('/setores/');
  return data;
}

export async function createSetor(payload: any) {
  const { data } = await api.post('/setores/', payload);
  return data;
}

export async function updateSetor(id: number, payload: any) {
  const { data } = await api.put(`/setores/${id}`, payload);
  return data;
}

export async function deleteSetor(id: number) {
  await api.delete(`/setores/${id}`);
}

// ========================================
// 🗃️ PATRIMÔNIOS
// ========================================

export async function listPatrimonios() {
  const { data } = await api.get('/patrimonios/');
  return data;
}

export async function createPatrimonio(payload: any) {
  const { data } = await api.post('/patrimonios/', payload);
  return data;
}

export async function updatePatrimonio(id: number, payload: any) {
  const { data } = await api.put(`/patrimonios/${id}`, payload);
  return data;
}

export async function deletePatrimonio(id: number) {
  await api.delete(`/patrimonios/${id}`);
}

// ========================================
// 📄 TRANSFERÊNCIAS
// ========================================

// Listar todas as transferências
export async function listTransferencias() {
  const { data } = await api.get('/transferencias/');
  return data;
}

// Criar nova transferência
export async function createTransferencia(payload: any) {
  const { data } = await api.post('/transferencias/', payload);
  return data;
}

// Obter uma transferência específica
export async function getTransferencia(id: number | string) {
  const { data } = await api.get(`/transferencias/${id}`);
  return data;
}

// Atualizar transferência (uso geral - prefira usar os endpoints específicos)
export async function updateTransferencia(id: number | string, payload: any) {
  const { data } = await api.put(`/transferencias/${id}`, payload);
  return data;
}

// Excluir transferência
export async function deleteTransferencia(id: number | string) {
  const { data } = await api.delete(`/transferencias/${id}`);
  return data;
}

// ========================================
// 🆕 NOVOS ENDPOINTS DE TRANSFERÊNCIAS
// ========================================

/**
 * Aprovar uma transferência pendente
 * 
 * @param id - ID da transferência
 * @param payload - Dados da aprovação (observações e se deve efetivar automaticamente)
 * @returns Transferência atualizada
 * 
 * @example
 * await aprovarTransferencia(1, {
 *   observacoes: "Aprovado conforme solicitado",
 *   efetivar_automaticamente: true
 * });
 */
export async function aprovarTransferencia(
  id: number | string,
  payload: TransferenciaAprovar
) {
  const { data } = await api.post(`/transferencias/${id}/aprovar`, payload);
  return data;
}

/**
 * Rejeitar uma transferência pendente
 * 
 * @param id - ID da transferência
 * @param payload - Dados da rejeição (motivo obrigatório)
 * @returns Transferência atualizada
 * 
 * @example
 * await rejeitarTransferencia(1, {
 *   motivo_rejeicao: "Equipamento necessário no setor atual"
 * });
 */
export async function rejeitarTransferencia(
  id: number | string,
  payload: TransferenciaRejeitar
) {
  const { data } = await api.post(`/transferencias/${id}/rejeitar`, payload);
  return data;
}

/**
 * Efetivar uma transferência aprovada
 * Atualiza o setor e/ou responsável do patrimônio
 * 
 * @param id - ID da transferência
 * @returns Transferência atualizada com efetivada = true
 * 
 * @example
 * await efetivarTransferencia(1);
 */
export async function efetivarTransferencia(id: number | string) {
  const { data } = await api.post(`/transferencias/${id}/efetivar`);
  return data;
}

// ========================================
// 📉 BAIXAS
// ========================================

export async function listBaixas() {
  const { data } = await api.get('/baixas/');
  return data;
}

export async function createBaixa(payload: any) {
  const { data } = await api.post('/baixas/', payload);
  return data;
}

export async function updateBaixa(id: number, payload: any) {
  const { data } = await api.put(`/baixas/${id}`, payload);
  return data;
}

export async function aprovarBaixa(id: number, payload: any) {
  const { data } = await api.post(`/baixas/${id}/aprovar`, payload);
  return data;
}

export async function rejeitarBaixa(id: number, payload: any) {
  const { data } = await api.post(`/baixas/${id}/rejeitar`, payload);
  return data;
}

// ========================================
// 📦 INVENTÁRIOS (Nova Estrutura - Sessões + Itens)
// ========================================

/**
 * Lista todas as sessões de inventário com filtros opcionais
 * @param statusFilter - Filtrar por status (em_andamento | concluido | cancelado)
 * @param tipoFilter - Filtrar por tipo (geral | por_setor | por_categoria)
 * @returns Lista de inventários
 */
export async function listInventarios(statusFilter?: string, tipoFilter?: string) {
  const params: any = {};
  if (statusFilter) params.status_filter = statusFilter;
  if (tipoFilter) params.tipo_filter = tipoFilter;

  const { data } = await api.get('/inventarios/', { params });
  return data;
}

/**
 * Cria uma nova sessão de inventário
 * @param payload - Dados do inventário
 * @returns Inventário criado
 */
export async function createInventario(payload: any) {
  const { data } = await api.post('/inventarios/', payload);
  return data;
}

/**
 * Obtém detalhes de uma sessão de inventário incluindo todos os itens
 * @param id - ID do inventário
 * @returns Inventário com itens
 */
export async function getInventario(id: number) {
  const { data } = await api.get(`/inventarios/${id}`);
  return data;
}

/**
 * Atualiza informações de uma sessão de inventário
 * @param id - ID do inventário
 * @param payload - Dados a atualizar
 * @returns Inventário atualizado
 */
export async function updateInventario(id: number, payload: any) {
  const { data } = await api.put(`/inventarios/${id}`, payload);
  return data;
}

/**
 * Remove uma sessão de inventário e todos os seus itens
 * @param id - ID do inventário
 */
export async function deleteInventario(id: number) {
  await api.delete(`/inventarios/${id}`);
}

/**
 * Lista todos os itens de uma sessão de inventário
 * @param inventarioId - ID do inventário
 * @param situacaoFilter - Filtrar por situação (encontrado | nao_encontrado | divergencia | conferido)
 * @returns Lista de itens
 */
export async function listItensInventario(inventarioId: number, situacaoFilter?: string) {
  const params: any = {};
  if (situacaoFilter) params.situacao_filter = situacaoFilter;

  const { data } = await api.get(`/inventarios/${inventarioId}/itens`, { params });
  return data;
}

/**
 * Adiciona um único patrimônio à sessão de inventário
 * @param inventarioId - ID do inventário
 * @param payload - Dados do item
 * @returns Item criado
 */
export async function adicionarItemInventario(inventarioId: number, payload: any) {
  const { data } = await api.post(`/inventarios/${inventarioId}/itens`, payload);
  return data;
}

/**
 * Adiciona múltiplos patrimônios de uma vez ao inventário
 * Útil para iniciar um inventário com base em filtros
 * @param inventarioId - ID do inventário
 * @param payload - Lista de IDs de patrimônios
 * @returns Lista de itens criados
 */
export async function adicionarItensBulkInventario(inventarioId: number, payload: any) {
  const { data } = await api.post(`/inventarios/${inventarioId}/itens/bulk`, payload);
  return data;
}

/**
 * Atualiza um item do inventário (usado para marcar como conferido)
 * Registra automaticamente quem conferiu e quando
 * @param inventarioId - ID do inventário
 * @param itemId - ID do item
 * @param payload - Dados a atualizar (situação, observações)
 * @returns Item atualizado
 */
export async function atualizarItemInventario(
  inventarioId: number,
  itemId: number,
  payload: any
) {
  const { data } = await api.put(`/inventarios/${inventarioId}/itens/${itemId}`, payload);
  return data;
}

/**
 * Remove um item do inventário
 * @param inventarioId - ID do inventário
 * @param itemId - ID do item
 */
export async function removerItemInventario(inventarioId: number, itemId: number) {
  await api.delete(`/inventarios/${inventarioId}/itens/${itemId}`);
}

/**
 * Finaliza uma sessão de inventário
 * Marca o inventário como concluído e registra a data de conclusão
 * @param inventarioId - ID do inventário
 * @param payload - Observações finais (opcional)
 * @returns Inventário atualizado
 */
export async function finalizarInventario(inventarioId: number, payload?: any) {
  const { data } = await api.post(`/inventarios/${inventarioId}/finalizar`, payload || {});
  return data;
}

/**
 * Cancela uma sessão de inventário
 * @param inventarioId - ID do inventário
 * @returns Inventário atualizado
 */
export async function cancelarInventario(inventarioId: number) {
  const { data } = await api.post(`/inventarios/${inventarioId}/cancelar`);
  return data;
}

/**
 * Obtém estatísticas sobre o progresso do inventário
 * @param inventarioId - ID do inventário
 * @returns Estatísticas (total, conferidos, pendentes, etc)
 */
export async function getEstatisticasInventario(inventarioId: number) {
  const { data } = await api.get(`/inventarios/${inventarioId}/estatisticas`);
  return data;
}

// ========================================
// 📎 ANEXOS
// ========================================

/**
 * Lista todos os anexos ou anexos de um patrimônio específico
 * 
 * @param patrimonioId - (Opcional) ID do patrimônio para filtrar anexos
 * @returns Lista de anexos
 * 
 * @example
 * // Listar todos os anexos
 * await listAnexos();
 * 
 * // Listar anexos de um patrimônio específico
 * await listAnexos(1);
 */
export async function listAnexos(patrimonioId?: number) {
  const params = patrimonioId ? { patrimonio_id: Number(patrimonioId) } : {};
  const { data } = await api.get('/anexos/', { params });
  return data;
}

/**
 * Faz upload de um novo anexo
 * 
 * @param formData - FormData contendo o arquivo e metadados
 * @returns Anexo criado
 * 
 * @example
 * const formData = new FormData();
 * formData.append('file', file);
 * formData.append('tipo', 'nota_fiscal');
 * formData.append('patrimonio_id', '1');
 * formData.append('descricao', 'Nota fiscal de aquisição');
 * 
 * await uploadAnexo(formData);
 */
export async function uploadAnexo(formData: FormData) {
  const { data } = await api.post('/anexos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Obtém informações de um anexo específico
 * 
 * @param id - ID do anexo
 * @returns Dados do anexo
 */
export async function getAnexo(id: number) {
  const { data } = await api.get(`/anexos/${id}`);
  return data;
}

/**
 * Atualiza metadados de um anexo
 * ⚠️ NOTA: Não permite alterar o arquivo, apenas tipo e descrição
 * 
 * @param id - ID do anexo
 * @param payload - Dados a atualizar (tipo, descricao)
 * @returns Anexo atualizado
 */
export async function updateAnexo(id: number, payload: any) {
  const { data } = await api.put(`/anexos/${id}`, payload);
  return data;
}

/**
 * Exclui um anexo (registro e arquivo físico)
 * ⚠️ CUIDADO: Esta ação é irreversível!
 * 
 * @param id - ID do anexo
 */
export async function deleteAnexo(id: number) {
  await api.delete(`/anexos/${id}`);
}

/**
 * Faz download de um arquivo anexo
 * 
 * @param id - ID do anexo
 * @param nomeOriginal - (Opcional) Nome do arquivo para salvar
 * 
 * @example
 * await downloadAnexo(1, 'nota_fiscal.pdf');
 */
export async function downloadAnexo(id: number, nomeOriginal?: string) {
  try {
    const response = await api.get(`/anexos/${id}/download`, {
      responseType: 'blob', // Importante para arquivos binários
    });

    // Cria um blob com os dados do arquivo
    const blob = new Blob([response.data]);
    
    // Cria uma URL temporária para o blob
    const url = window.URL.createObjectURL(blob);
    
    // Cria um link temporário e simula o clique
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeOriginal || `anexo_${id}`;
    document.body.appendChild(link);
    link.click();
    
    // Limpa a URL temporária e remove o link
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error: any) {
    console.error('Erro ao fazer download do anexo:', error);
    throw error;
  }
}

// ========================================
// 📜 LOGS
// ========================================

/**
 * Lista logs com suporte a filtros e paginação
 * @param params - Parâmetros de filtros e paginação
 * @returns Lista de logs
 */
export async function listLogs(params?: {
  skip?: number;
  limit?: number;
  entidade?: string;
  acao?: string;
  usuario?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}) {
  const { data } = await api.get('/logs/', { params });
  return data;
}

/**
 * Busca um log específico por ID
 * @param id - ID do log
 * @returns Detalhes do log
 */
export async function getLog(id: number) {
  const { data } = await api.get(`/logs/${id}`);
  return data;
}

/**
 * Cria um novo registro de log
 * @param payload - Dados do log
 * @returns Log criado
 */
export async function createLog(payload: LogCreate) {
  const { data } = await api.post('/logs/', payload);
  return data;
}

/**
 * Exporta logs em formato específico
 * @param format - Formato de exportação (csv, json, pdf)
 * @param filtros - Filtros a aplicar na exportação
 * @returns Dados exportados
 */
export async function exportLogs(format: 'csv' | 'json' | 'pdf', filtros?: FiltrosLog) {
  const { data } = await api.get('/logs/export', {
    params: { format, ...filtros },
    responseType: format === 'csv' || format === 'pdf' ? 'blob' : 'json',
  });
  return data;
}

export default api;