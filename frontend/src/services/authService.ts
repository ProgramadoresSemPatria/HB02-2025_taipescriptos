import axiosInstance from '@/lib/axios'

// ===== TIPOS =====

export interface User {
  id: string
  name: string
  email: string
  credits: number
  isPremium: boolean
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
  message: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiError {
  message: string
  code?: string
}

// ===== FUNÇÕES DE UTILIDADE =====

/**
 * Salva o token no localStorage
 */
const saveToken = (token: string): void => {
  localStorage.setItem('token', token)
}

/**
 * Remove o token do localStorage
 */
const removeToken = (): void => {
  localStorage.removeItem('token')
}

/**
 * Obtém o token do localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token')
}

/**
 * Verifica se existe um token válido
 */
const hasToken = (): boolean => {
  const token = getToken()
  return token !== null && token !== ''
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

/**
 * Registra um novo usuário
 */
export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      '/api/users/register',
      data,
    )

    // Salva o token automaticamente após o registro
    if (response.data.token) {
      saveToken(response.data.token)
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Erro no registro')
    }
    throw new Error('Erro de conexão')
  }
}

/**
 * Faz login do usuário
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      '/api/users/login',
      data,
    )

    // Salva o token automaticamente após o login
    if (response.data.token) {
      saveToken(response.data.token)
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Credenciais inválidas')
    }
    throw new Error('Erro de conexão')
  }
}

/**
 * Faz logout do usuário (remove o token)
 */
export const logout = (): void => {
  removeToken()
}

/**
 * Obtém o perfil do usuário logado
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<{ user: User }>(
      '/api/users/profile',
    )
    return response.data.user
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token inválido, remove do localStorage
      removeToken()
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Erro ao obter perfil')
    }
    throw new Error('Erro de conexão')
  }
}

/**
 * Valida se o token atual é válido
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    if (!hasToken()) {
      return false
    }

    // Tenta obter o perfil do usuário
    await getProfile()
    return true
  } catch (error) {
    return false
  }
}

/**
 * Obtém o usuário atual do localStorage (se existir)
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Salva o usuário no localStorage
 */
export const saveCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Remove o usuário do localStorage
 */
export const removeCurrentUser = (): void => {
  localStorage.removeItem('user')
}

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return hasToken() && getCurrentUser() !== null
}

/**
 * Função completa de login que salva tanto o token quanto o usuário
 */
export const loginAndSaveUser = async (
  data: LoginRequest,
): Promise<AuthResponse> => {
  const response = await login(data)
  saveCurrentUser(response.user)
  return response
}

/**
 * Função completa de registro que salva tanto o token quanto o usuário
 */
export const registerAndSaveUser = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await register(data)
  saveCurrentUser(response.user)
  return response
}

/**
 * Função completa de logout que remove token e usuário
 */
export const logoutAndClearUser = (): void => {
  logout()
  removeCurrentUser()
}

// ===== EXPORTAÇÕES =====

export default {
  register,
  login,
  logout,
  getProfile,
  validateToken,
  getCurrentUser,
  saveCurrentUser,
  removeCurrentUser,
  isAuthenticated,
  loginAndSaveUser,
  registerAndSaveUser,
  logoutAndClearUser,
}
