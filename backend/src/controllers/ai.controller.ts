import { FastifyRequest, FastifyReply } from 'fastify'
import { aiService } from '../services/ai.service'
import {
  sendMessageBodySchema,
  sendMultimodalBodySchema,
} from '../schemas/ai.schema'

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
}

export const aiController = new AIController()
