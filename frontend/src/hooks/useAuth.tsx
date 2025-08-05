import { useState, useEffect, createContext, useContext } from 'react'
import {
  User,
  loginAndSaveUser,
  registerAndSaveUser,
  logoutAndClearUser,
  getCurrentUser,
  validateToken,
  getProfile,
} from '@/services/authService'
import type { LoginRequest, RegisterRequest } from '@/services/authService'

// ===== CONTEXTO DE AUTENTICAÇÃO =====

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ===== PROVIDER DE AUTENTICAÇÃO =====

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se o usuário está autenticado na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verifica se existe um token válido
        const isValid = await validateToken()

        if (isValid) {
          // Obtém o usuário atual do localStorage ou da API
          const currentUser = getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          } else {
            // Se não tem no localStorage, busca da API
            const profile = await getProfile()
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        // Em caso de erro, limpa o estado
        logoutAndClearUser()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginAndSaveUser(data)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerAndSaveUser(data)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    logoutAndClearUser()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ===== HOOK DE AUTENTICAÇÃO =====

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default useAuth
