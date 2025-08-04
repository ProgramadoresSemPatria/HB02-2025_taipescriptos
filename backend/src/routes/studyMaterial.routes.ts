import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { studyMaterialController } from '../controllers/studyMaterial.controller'

// Estendendo as tipagens do Fastify para incluir userId e userRole
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    userRole?: 'USER' | 'ADMIN'
  }
}

interface JWTUser {
  sub?: string
  email?: string
  role?: 'USER' | 'ADMIN'
  [key: string]: unknown
}

export async function studyMaterialRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação JWT apenas para rotas privadas
  const authMiddleware = async (request: FastifyRequest) => {
    try {
      await request.jwtVerify()
      const user = request.user as JWTUser
      request.userId = user?.sub
      request.userRole = user?.role
    } catch {
      throw new Error('Token de autenticação inválido')
    }
  }

  // Rota de health check
  fastify.get('/health', {
    schema: {
      tags: ['StudyMaterial'],
      description: 'Verifica saúde do módulo StudyMaterial',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      studyMaterialController.healthCheck(request, reply),
  })

  // Rota privada - listar materiais de estudo do usuário
  fastify.get('/', {
    preHandler: authMiddleware,
    schema: {
      tags: ['StudyMaterial'],
      description: 'Listar materiais de estudo do usuário autenticado',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  uploadId: { type: 'string' },
                  filename: { type: 'string' },
                  fileType: { type: 'string', nullable: true },
                  summary: { type: 'object', additionalProperties: true },
                  quiz: { type: 'object', additionalProperties: true },
                  flashcards: { type: 'object', additionalProperties: true },
                  language: { type: 'string' },
                  mode: { type: 'string' },
                  createdAt: { type: 'string' },
                  uploadCreatedAt: { type: 'string', nullable: true },
                },
                additionalProperties: false,
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      },
    },
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      studyMaterialController.listUserStudyMaterials(request as any, reply),
  })

  // Rota privada - buscar material de estudo por ID
  fastify.get('/:id', {
    preHandler: authMiddleware,
    schema: {
      tags: ['StudyMaterial'],
      description: 'Buscar material de estudo por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                uploadId: { type: 'string' },
                filename: { type: 'string' },
                fileType: { type: 'string', nullable: true },
                contentText: { type: 'string', nullable: true },
                summary: { type: 'object', additionalProperties: true },
                quiz: { type: 'object', additionalProperties: true },
                flashcards: { type: 'object', additionalProperties: true },
                language: { type: 'string' },
                mode: { type: 'string' },
                createdAt: { type: 'string' },
                uploadCreatedAt: { type: 'string', nullable: true },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      },
    },
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      studyMaterialController.getStudyMaterialById(request as any, reply),
  })

  // Rota privada - deletar material de estudo
  fastify.delete('/:id', {
    preHandler: authMiddleware,
    schema: {
      tags: ['StudyMaterial'],
      description: 'Deletar material de estudo por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      studyMaterialController.deleteStudyMaterial(request as any, reply),
  })
}
