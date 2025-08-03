import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { aiController } from '../controllers/ai.controller'
import {
  sendMessageSchemaSwagger,
  sendMultimodalSchemaSwagger,
  aiStatusSchemaSwagger,
  generateQuizSchemaSwagger,
  generateFlashcardsSchemaSwagger,
  generateSumarioSchemaSwagger,
} from '../schemas/ai.schema'

// Extensão de tipos para JWT
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    userRole?: 'USER' | 'ADMIN'
  }
}

// Interface para JWT payload
interface JWTUser {
  sub?: string
  email?: string
  role?: 'USER' | 'ADMIN'
  [key: string]: unknown
}

export async function aiRoutes(fastify: FastifyInstance) {
  // ===== MIDDLEWARE DE AUTENTICAÇÃO =====

  /**
   * Hook que aplica autenticação JWT em rotas que precisam
   */
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Rotas que não precisam de autenticação
    const publicRoutes = ['/api/ai/health', '/api/ai/status']

    if (publicRoutes.includes(request.url)) {
      return
    }

    // Verificar JWT e extrair userId e role
    try {
      await request.jwtVerify()
      const user = request.user as JWTUser
      request.userId = user?.sub
      request.userRole = user?.role
    } catch (error) {
      throw new Error('Token de autenticação inválido')
    }
  })

  // ===== ROTAS PÚBLICAS =====

  // Health check da IA
  fastify.get('/health', {
    schema: {
      tags: ['AI'],
      description: 'Health check do serviço de IA',
      response: {
        200: {
          description: 'Serviço de IA funcionando',
          type: 'object',
          properties: {
            message: { type: 'string' },
            service: { type: 'string' },
            model: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return aiController.healthCheck(request, reply)
    },
  })

  // Verificar status da conexão com a IA
  fastify.get('/status', {
    schema: aiStatusSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return aiController.checkStatus(request, reply)
    },
  })

  // ===== ROTAS AUTENTICADAS =====

  // Enviar mensagem para a IA
  fastify.post('/message', {
    schema: sendMessageSchemaSwagger,
    handler: async (
      request: FastifyRequest<{
        Body: { message: string; temperature?: number }
      }>,
      reply: FastifyReply,
    ) => {
      const messageRequest = request as FastifyRequest & {
        Body: { message: string; temperature?: number }
        body: { message: string; temperature?: number }
        userId?: string
      }
      return aiController.sendMessage(messageRequest, reply)
    },
  })

  // Enviar conteúdo multimodal para a IA (texto + imagem + PDF chunks)
  fastify.post('/multimodal', {
    schema: sendMultimodalSchemaSwagger,
    handler: async (
      request: FastifyRequest<{
        Body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          temperature?: number
        }
      }>,
      reply: FastifyReply,
    ) => {
      const multimodalRequest = request as FastifyRequest & {
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
        userId?: string
      }
      return aiController.sendMultimodal(multimodalRequest, reply)
    },
  })

  // Rota para conversation/chat (alias para message)
  fastify.post('/chat', {
    schema: {
      ...sendMessageSchemaSwagger,
      description:
        'Iniciar conversa com a IA Google Gemma (alias para /message)',
    },
    handler: async (
      request: FastifyRequest<{
        Body: { message: string; temperature?: number }
      }>,
      reply: FastifyReply,
    ) => {
      const chatRequest = request as FastifyRequest & {
        Body: { message: string; temperature?: number }
        body: { message: string; temperature?: number }
        userId?: string
      }
      return aiController.sendMessage(chatRequest, reply)
    },
  })

  // Rota de teste simples
  fastify.get('/test', {
    schema: {
      tags: ['AI'],
      description: 'Teste simples da IA com mensagem padrão',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Resposta de teste da IA',
          type: 'object',
          properties: {
            response: { type: 'string' },
            model: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            inputMessage: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Cria um request simulado para teste
      const testRequest = {
        ...request,
        body: {
          message:
            'Olá! Este é um teste de conexão. Responda com uma saudação simples.',
          temperature: 0.3,
        },
      } as FastifyRequest & {
        Body: { message: string; temperature?: number }
        body: { message: string; temperature?: number }
        userId?: string
      }

      return aiController.sendMessage(testRequest, reply)
    },
  })

  // ===== ROTAS PARA GERAÇÃO ESTRUTURADA =====

  // Gerar quiz estruturado
  fastify.post('/generate/quiz', {
    schema: generateQuizSchemaSwagger,
    handler: async (
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
    ) => {
      const quizRequest = request as FastifyRequest & {
        Body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          quantidadeQuestoes?: number
          temperatura?: number
        }
        body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          quantidadeQuestoes?: number
          temperatura?: number
        }
        userId?: string
      }
      return aiController.generateQuiz(quizRequest, reply)
    },
  })

  // Gerar flashcards estruturados
  fastify.post('/generate/flashcards', {
    schema: generateFlashcardsSchemaSwagger,
    handler: async (
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
    ) => {
      const flashcardsRequest = request as FastifyRequest & {
        Body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          quantidadeFlashcards?: number
          temperatura?: number
        }
        body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          quantidadeFlashcards?: number
          temperatura?: number
        }
        userId?: string
      }
      return aiController.generateFlashcards(flashcardsRequest, reply)
    },
  })

  // Gerar sumário estruturado
  fastify.post('/generate/sumario', {
    schema: generateSumarioSchemaSwagger,
    handler: async (
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
    ) => {
      const sumarioRequest = request as FastifyRequest & {
        Body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          detalhamento?: 'basico' | 'intermediario' | 'detalhado'
          temperatura?: number
        }
        body: {
          text: string
          image?: string
          pdfTextChunks?: string[]
          detalhamento?: 'basico' | 'intermediario' | 'detalhado'
          temperatura?: number
        }
        userId?: string
      }
      return aiController.generateSumario(sumarioRequest, reply)
    },
  })
}
