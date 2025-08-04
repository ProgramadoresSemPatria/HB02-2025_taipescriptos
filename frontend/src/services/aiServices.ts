import axiosInstance from '../lib/axios'

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
  issues?: Record<string, unknown>
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
    const response = await axiosInstance.post('/api/ai/multimodal', data)
    return response.data as AIResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: ApiError }
      }
      throw new ApiException(
        axiosError.response.status,
        axiosError.response.data,
      )
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
    const response = await axiosInstance.post('/api/ai/message', {
      message,
      temperature,
    })
    return response.data as AIResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: ApiError }
      }
      throw new ApiException(
        axiosError.response.status,
        axiosError.response.data,
      )
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
    const response = await axiosInstance.post('/api/ai/generate/quiz', data)
    return response.data as QuizResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: ApiError }
      }
      throw new ApiException(
        axiosError.response.status,
        axiosError.response.data,
      )
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
    const response = await axiosInstance.post(
      '/api/ai/generate/flashcards',
      data,
    )
    return response.data as FlashcardsResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: ApiError }
      }
      throw new ApiException(
        axiosError.response.status,
        axiosError.response.data,
      )
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
    const response = await axiosInstance.post('/api/ai/generate/sumario', data)
    return response.data as SumarioResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: ApiError }
      }
      throw new ApiException(
        axiosError.response.status,
        axiosError.response.data,
      )
    }

    console.error('Erro na geração de sumário:', error)
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
    const response = await axiosInstance.get('/api/ai/health')
    return response.status === 200
  } catch {
    return false
  }
}
