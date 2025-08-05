import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { fileUploadController } from '../controllers/fileUpload.controller'
import {
  fileUploadParamsSchemaSwagger,
  fileUploadListSchemaSwagger,
  createFileUploadSchemaSwagger,
  createFileUploadWithStudyMaterialSchemaSwagger,
  createFileUploadWithFileSchemaSwagger,
} from '../schemas/fileUpload.schema'

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

export async function fileUploadRoutes(fastify: FastifyInstance) {
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

  fastify.get('/health', {
    schema: {
      tags: ['FileUpload'],
      description: 'Verifica saúde do módulo FileUpload',
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
      fileUploadController.healthCheck(request, reply),
  })

  // Rota privada - criar upload (requer autenticação)
  fastify.post('/', {
    preHandler: authMiddleware,
    schema: createFileUploadSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.createFileUpload(request as any, reply),
  })

  // Rota privada - criar upload com geração de material de estudo
  fastify.post('/with-study-material', {
    preHandler: authMiddleware,
    schema: createFileUploadWithStudyMaterialSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.createFileUploadWithStudyMaterial(
        request as any,
        reply,
      ),
  })

  // Rota pública - buscar arquivo por ID (sem autenticação para permitir compartilhamento)
  fastify.get('/:id', {
    schema: fileUploadParamsSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.getFileUploadById(request as any, reply),
  })

  // Rota privada - listar uploads do usuário (requer autenticação)
  fastify.get('/', {
    preHandler: authMiddleware,
    schema: fileUploadListSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.listUserUploads(request as any, reply),
  })

  // Rota privada - criar upload com file multipart
  fastify.post('/file', {
    preHandler: authMiddleware,
    schema: createFileUploadWithFileSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.createFileUploadWithFile(request as any, reply),
  })
}
