import axios from 'axios'

// Função para obter o token do localStorage
function getToken(): string | null {
  return localStorage.getItem('token')
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adiciona um interceptor para incluir o token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Adiciona um interceptor para tratar erros de resposta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (não autorizado), limpa o token e redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redireciona para login se estiver em uma página protegida
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
