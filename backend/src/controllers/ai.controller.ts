import { FastifyRequest, FastifyReply } from 'fastify'
import { aiService } from '../services/ai.service'
import {
  sendMessageBodySchema,
  sendMultimodalBodySchema,
  generateQuizBodySchema,
  generateFlashcardsBodySchema,
  generateSumarioBodySchema,
  QuizResponse,
  FlashcardsResponse,
  SumarioResponse,
} from '../schemas/ai.schema'
import { aiRepository } from '../repositories/ai.repository'

// ===== INTERFACES DE REQUEST =====

interface SendMessageRequest extends FastifyRequest {
  Body: { message: string; temperature?: number }
  body: { message: string; temperature?: number }
}

interface SendMultimodalRequest extends FastifyRequest {
  Body: {
    text: string
    image?: string
    pdfTextChunks?: string[]
    temperature?: number
  }
  body: {
    text: string
    image?: string
    pdfTextChunks?: string[]
    temperature?: number
  }
}

class AIController {
  /**
   * Envia mensagem para a IA
   */
  async sendMessage(request: SendMessageRequest, reply: FastifyReply) {
    try {
      // Valida os dados de entrada
      const validatedData = sendMessageBodySchema.parse(request.body)

      // Chama o serviço da IA
      const aiResponse = await aiService.sendMessage(validatedData)

      return reply.status(200).send(aiResponse)
    } catch (error) {
      console.error('Erro no controller de IA:', error)

      if (error instanceof Error) {
        return reply.status(500).send({
          message: 'Erro ao processar mensagem',
          error: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor',
        error: 'Erro desconhecido',
      })
    }
  }

  /**
   * Envia conteúdo multimodal (texto + imagem + PDF chunks) para a IA
   */
  async sendMultimodal(request: SendMultimodalRequest, reply: FastifyReply) {
    try {
      // Valida os dados de entrada
      const validatedData = sendMultimodalBodySchema.parse(request.body)

      // Chama o serviço da IA para processamento multimodal
      const aiResponse = await aiService.sendMultimodal(validatedData)

      return reply.status(200).send(aiResponse)
    } catch (error) {
      console.error('Erro no controller de IA (multimodal):', error)

      if (error instanceof Error) {
        return reply.status(500).send({
          message: 'Erro ao processar conteúdo multimodal',
          error: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor',
        error: 'Erro desconhecido',
      })
    }
  }

  /**
   * Verifica status da IA
   */
  async checkStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const status = await aiService.checkStatus()
      return reply.status(200).send(status)
    } catch (error) {
      console.error('Erro ao verificar status da IA:', error)

      return reply.status(500).send({
        message: 'Erro ao verificar status da IA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  /**
   * Health check específico para IA
   */
  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({
        message: 'AI service is running',
        service: 'ai',
        model: 'Multiple models supported (Vertex AI / Google GenAI)',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erro no health check da IA:', error)

      return reply.status(500).send({
        message: 'AI service health check failed',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  // ===== MÉTODOS PARA GERAÇÃO ESTRUTURADA =====

  /**
   * Gera quiz estruturado baseado em conteúdo multimodal
   */
  async generateQuiz(
    request: FastifyRequest<{
      Body: {
        text: string
        image?: string
        pdfTextChunks?: string[]
        quantidadeQuestoes?: number
        temperatura?: number
      }
    }>,
    reply: FastifyReply,
  ): Promise<QuizResponse> {
    try {
      // Valida os dados de entrada
      const validatedData = generateQuizBodySchema.parse(request.body)

      // Chama o serviço para gerar quiz
      const quizResponse = await aiService.generateQuiz(validatedData)

      return reply.status(200).send(quizResponse)
    } catch (error) {
      console.error('Erro no controller de geração de quiz:', error)

      if (error instanceof Error) {
        return reply.status(500).send({
          message: 'Erro ao gerar quiz',
          error: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor',
        error: 'Erro desconhecido',
      })
    }
  }

  /**
   * Gera flashcards estruturados baseado em conteúdo multimodal
   */
  async generateFlashcards(
    request: FastifyRequest<{
      Body: {
        text: string
        image?: string
        pdfTextChunks?: string[]
        quantidadeFlashcards?: number
        temperatura?: number
      }
    }>,
    reply: FastifyReply,
  ): Promise<FlashcardsResponse> {
    try {
      // Valida os dados de entrada
      const validatedData = generateFlashcardsBodySchema.parse(request.body)

      // Chama o serviço para gerar flashcards
      const flashcardsResponse =
        await aiService.generateFlashcards(validatedData)

      return reply.status(200).send(flashcardsResponse)
    } catch (error) {
      console.error('Erro no controller de geração de flashcards:', error)

      if (error instanceof Error) {
        return reply.status(500).send({
          message: 'Erro ao gerar flashcards',
          error: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor',
        error: 'Erro desconhecido',
      })
    }
  }

  /**
   * Gera sumário estruturado baseado em conteúdo multimodal
   */
  async generateSumario(
    request: FastifyRequest<{
      Body: {
        text: string
        image?: string
        pdfTextChunks?: string[]
        detalhamento?: 'basico' | 'intermediario' | 'detalhado'
        temperatura?: number
      }
    }>,
    reply: FastifyReply,
  ): Promise<SumarioResponse> {
    try {
      // Valida os dados de entrada
      const validatedData = generateSumarioBodySchema.parse(request.body)

      // Chama o serviço para gerar sumário
      const sumarioResponse = await aiService.generateSumario(validatedData)

      return reply.status(200).send(sumarioResponse)
    } catch (error) {
      console.error('Erro no controller de geração de sumário:', error)

      if (error instanceof Error) {
        return reply.status(500).send({
          message: 'Erro ao gerar sumário',
          error: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor',
        error: 'Erro desconhecido',
      })
    }
  }

  async generateAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).userId
      console.log('[generateAll] userId:', userId)
      if (!userId) {
        console.warn('[generateAll] Usuário não autenticado')
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      console.log('[generateAll] request.body:', request.body)

      // Reutiliza os métodos existentes chamando o aiService diretamente
      const {
        text,
        image,
        pdfTextChunks,
        quantidadeQuestoes,
        quantidadeFlashcards,
        detalhamento,
        temperatura,
      } = request.body as any

      const [quiz, flashcards, sumario] = await Promise.all([
        aiService.generateQuiz({
          text,
          image,
          pdfTextChunks,
          quantidadeQuestoes,
          temperatura,
        }),
        aiService.generateFlashcards({
          text,
          image,
          pdfTextChunks,
          quantidadeFlashcards,
          temperatura,
        }),
        aiService.generateSumario({
          text,
          image,
          pdfTextChunks,
          detalhamento,
          temperatura,
        }),
      ])

      console.log('[generateAll] Materiais gerados:', {
        quiz,
        flashcards,
        sumario,
      })

      // Salva no banco usando o repositório
      try {
        const material = await aiRepository.create({
          userId,
          summary: sumario.resumoExecutivo || '',
          quizJson: quiz,
          flashcardsJson: flashcards,
          language: 'pt',
          mode: 'review',
        })
        console.log('[generateAll] Material salvo:', material)
        return reply.status(200).send({ quiz, flashcards, sumario, material })
      } catch (repoError) {
        console.error('[generateAll] Erro ao salvar no banco:', repoError)
        return reply.status(500).send({
          message: 'Erro ao salvar materiais no banco',
          error: repoError instanceof Error ? repoError.message : repoError,
        })
      }
    } catch (error) {
      console.error('Erro ao gerar e salvar materiais:', error)
      return reply.status(500).send({
        message: 'Erro ao gerar e salvar materiais',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }
}

export const aiController = new AIController()
