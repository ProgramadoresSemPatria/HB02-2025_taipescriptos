/**
 * Configuração da API
 */
const API_BASE_URL = import.meta.env.VITE_API_URL

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

// ===== INTERFACES PARA RESPOSTAS ESTRUTURADAS =====

export interface QuizQuestion {
  pergunta: string
  opcoes: string[]
  respostaCorreta: number
  explicacao?: string
}

export interface QuizResponse {
  titulo: string
  descricao?: string
  questoes: QuizQuestion[]
  modelo: string
  timestamp: string
  fonte: string
}

export interface Flashcard {
  frente: string
  verso: string
  categoria?: string
  dificuldade?: 'facil' | 'medio' | 'dificil'
}

export interface FlashcardsResponse {
  titulo: string
  descricao?: string
  flashcards: Flashcard[]
  modelo: string
  timestamp: string
  fonte: string
}

export interface PontoPrincipal {
  topico: string
  descricao: string
}

export interface SumarioResponse {
  titulo: string
  resumoExecutivo: string
  topicosChave: string[]
  pontosPrincipais: PontoPrincipal[]
  conclusao?: string
  modelo: string
  timestamp: string
  fonte: string
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
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWFjMTE4ZS04N2QxLTQ0NTktYjhkYS1hOGNkN2E0MmY4ZjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDI1MjEwMiwiZXhwIjoxNzU0ODU2OTAyfQ.mA7s9zNGJxzj_gTX92xr_IgBV7NnhBoPazoWtJe6BnE',
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

// ===== FUNÇÕES PARA GERAÇÃO ESTRUTURADA =====

/**
 * Gera quiz estruturado baseado em conteúdo multimodal
 */
export async function generateQuiz(data: {
  text: string
  image?: string
  pdfTextChunks?: string[]
  quantidadeQuestoes?: number
  temperatura?: number
}): Promise<QuizResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate/quiz`, {
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

    return responseData as QuizResponse
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na geração de quiz:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Gera flashcards estruturados baseado em conteúdo multimodal
 */
export async function generateFlashcards(data: {
  text: string
  image?: string
  pdfTextChunks?: string[]
  quantidadeFlashcards?: number
  temperatura?: number
}): Promise<FlashcardsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate/flashcards`, {
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

    return responseData as FlashcardsResponse
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na geração de flashcards:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Gera sumário estruturado baseado em conteúdo multimodal
 */
export async function generateSumario(data: {
  text: string
  image?: string
  pdfTextChunks?: string[]
  detalhamento?: 'basico' | 'intermediario' | 'detalhado'
  temperatura?: number
}): Promise<SumarioResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate/sumario`, {
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

    return responseData as SumarioResponse
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na geração de sumário:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Gera quiz, flashcards e sumário juntos e salva no banco
 */
export async function generateAll(data: {
  text: string
  image?: string
  pdfTextChunks?: string[]
  quantidadeQuestoes?: number
  quantidadeFlashcards?: number
  detalhamento?: 'basico' | 'intermediario' | 'detalhado'
  temperatura?: number
}): Promise<{
  quiz: QuizResponse
  flashcards: FlashcardsResponse
  sumario: SumarioResponse
  material: any
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWFjMTE4ZS04N2QxLTQ0NTktYjhkYS1hOGNkN2E0MmY4ZjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDI1MjEwMiwiZXhwIjoxNzU0ODU2OTAyfQ.mA7s9zNGJxzj_gTX92xr_IgBV7NnhBoPazoWtJe6BnE',
      },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiException(response.status, responseData)
    }

    return responseData
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }

    console.error('Erro na geração completa:', error)
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
