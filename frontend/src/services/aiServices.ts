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

// ===== INTERFACES PARA STUDY MATERIALS =====

export interface StudyMaterial {
  id: string
  uploadId: string | null
  filename: string
  fileType: string | null
  summary: SumarioResponse
  quiz: QuizResponse
  flashcards: FlashcardsResponse
  language: string
  mode: string
  createdAt: string
  uploadCreatedAt: string | null
}

export interface StudyMaterialDetailed extends StudyMaterial {
  contentText: string | null
}

export interface StudyMaterialsListResponse {
  success: boolean
  data: StudyMaterial[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateUploadWithStudyMaterialRequest {
  filename: string
  contentText: string
  type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
}

export interface CreateUploadWithStudyMaterialResponse {
  success: boolean
  message: string
  data: {
    upload: any
    studyMaterial: any
    content: {
      summary: SumarioResponse
      quiz: QuizResponse
      flashcards: FlashcardsResponse
    }
  }
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

// ===== FUNÇÕES PARA STUDY MATERIALS =====

/**
 * Lista todos os materiais de estudo do usuário autenticado
 */
export async function getStudyMaterials(
  page: number = 1,
  limit: number = 20,
): Promise<StudyMaterialsListResponse> {
  try {
    const response = await axiosInstance.get('/api/study-materials', {
      params: { page, limit },
    })
    return response.data as StudyMaterialsListResponse
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

    console.error('Erro ao buscar materiais de estudo:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Busca um material de estudo específico por ID
 */
export async function getStudyMaterialById(
  id: string,
): Promise<StudyMaterialDetailed> {
  try {
    const response = await axiosInstance.get(`/api/study-materials/${id}`)
    return response.data.data as StudyMaterialDetailed
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

    console.error('Erro ao buscar material de estudo:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Cria um upload e gera automaticamente todos os materiais de estudo
 */
export async function createUploadWithStudyMaterial(
  data: CreateUploadWithStudyMaterialRequest,
): Promise<CreateUploadWithStudyMaterialResponse> {
  try {
    const response = await axiosInstance.post(
      '/api/uploads/with-study-material',
      data,
    )
    return response.data as CreateUploadWithStudyMaterialResponse
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

    console.error('Erro ao criar upload com material de estudo:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Deleta um material de estudo
 */
export async function deleteStudyMaterial(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/api/study-materials/${id}`)
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

    console.error('Erro ao deletar material de estudo:', error)
    throw new ApiException(500, {
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

/**
 * Faz upload de arquivo e gera automaticamente todos os materiais de estudo
 */
export async function createFileUploadWithStudyMaterial(
  file: File,
  language: string = 'pt-br',
  mode: string = 'all',
): Promise<CreateUploadWithStudyMaterialResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    formData.append('mode', mode)

    const response = await axiosInstance.post('/api/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data as CreateUploadWithStudyMaterialResponse
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: { message: string; code?: string } }
      }

      // Tratamento específico para arquivo muito grande
      if (axiosError.response?.status === 413) {
        throw new Error(
          'Arquivo muito grande. O tamanho máximo permitido é 10MB.',
        )
      }

      // Tratamento específico para formato de arquivo inválido
      if (
        axiosError.response?.status === 400 &&
        axiosError.response?.data?.code === 'INVALID_FILE_FORMAT'
      ) {
        throw new Error(
          'Formato de arquivo não suportado. Tente um arquivo de texto, PDF ou imagem válida.',
        )
      }

      // Tratamento específico para erro de extração de PDF
      if (
        axiosError.response?.status === 400 &&
        axiosError.response?.data?.code === 'PDF_EXTRACTION_ERROR'
      ) {
        throw new Error(
          'Erro ao processar o arquivo PDF. Verifique se o arquivo não está corrompido.',
        )
      }

      // Tratamento específico para erro de validação da IA
      if (
        axiosError.response?.status === 422 &&
        axiosError.response?.data?.code === 'AI_VALIDATION_ERROR'
      ) {
        throw new Error(
          'Erro na geração de materiais de estudo. Tente novamente.',
        )
      }

      throw new Error(
        axiosError.response?.data?.message ||
          'Erro ao fazer upload e gerar materiais',
      )
    }
    throw new Error('Erro ao fazer upload e gerar materiais')
  }
}
