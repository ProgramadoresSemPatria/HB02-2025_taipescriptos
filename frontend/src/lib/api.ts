/**
 * Configuração da API
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

/**
 * Tipos para a API
 */
export interface MultimodalRequest {
  text: string
  image?: string
  pdfTextChunks?: string[]
  temperature?: number
}

export interface AIResponse {
  response: string
  model: string
  timestamp: string
  inputMessage: string
}

export interface ApiError {
  message: string
  error?: string
  issues?: Record<string, any>
}

/**
 * Classe para erros da API
 */
export class ApiException extends Error {
  public status: number
  public apiError: ApiError

  constructor(status: number, apiError: ApiError) {
    super(apiError.message)
    this.status = status
    this.apiError = apiError
    this.name = 'ApiException'
  }
}

/**
 * Envia conteúdo multimodal para a IA
 */
export async function sendMultimodalToAI(
  data: MultimodalRequest,
): Promise<AIResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/multimodal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiException(response.status, responseData)
    }

    return responseData as AIResponse
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na comunicação com a API:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Envia mensagem simples para a IA (método antigo mantido para compatibilidade)
 */
export async function sendMessageToAI(
  message: string,
  temperature = 0.7,
): Promise<AIResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, temperature }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiException(response.status, responseData)
    }

    return responseData as AIResponse
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na comunicação com a API:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Verifica o status da API
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/health`)
    return response.ok
  } catch {
    return false
  }
}
