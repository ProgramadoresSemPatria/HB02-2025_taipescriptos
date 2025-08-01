import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { aiController } from '../controllers/ai.controller'
import {
  sendMessageSchemaSwagger,
  aiStatusSchemaSwagger,
} from '../schemas/ai.schema'

export async function aiRoutes(fastify: FastifyInstance) {
  // ===== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) =====

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
      }
      return aiController.sendMessage(messageRequest, reply)
    },
  })

  // Rota para conversation/chat (alias para message)
  fastify.post('/chat', {
    schema: {
      ...sendMessageSchemaSwagger,
      description: 'Iniciar conversa com a IA Google Gemma (alias para /message)',
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
      }
      return aiController.sendMessage(chatRequest, reply)
    },
  })

  // Rota de teste simples
  fastify.get('/test', {
    schema: {
      tags: ['AI'],
      description: 'Teste simples da IA com mensagem padrão',
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
          message: 'Olá! Este é um teste de conexão. Responda com uma saudação simples.',
          temperature: 0.3,
        },
      } as FastifyRequest & {
        Body: { message: string; temperature?: number }
        body: { message: string; temperature?: number }
      }

      return aiController.sendMessage(testRequest, reply)
    },
  })
}