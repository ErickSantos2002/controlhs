import axios from 'axios';
import type { TransferenciaAprovar, TransferenciaRejeitar } from '../types/transferencias.types';

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

// ========================================
// 📦 INVENTÁRIOS
// ========================================

export async function listInventarios() {
  const { data } = await api.get('/inventarios/');
  return data;
}

export async function createInventario(payload: any) {
  const { data } = await api.post('/inventarios/', payload);
  return data;
}

// ========================================
// 📎 ANEXOS
// ========================================

export async function listAnexos() {
  const { data } = await api.get('/anexos/');
  return data;
}

export async function uploadAnexo(formData: FormData) {
  const { data } = await api.post('/anexos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ========================================
// 📜 LOGS
// ========================================

export async function listLogs() {
  const { data } = await api.get('/logs/');
  return data;
}

export async function createLog(payload: any) {
  const { data } = await api.post('/logs/', payload);
  return data;
}

export default api;