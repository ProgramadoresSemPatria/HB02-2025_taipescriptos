import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { fileUploadController } from '../controllers/fileUpload.controller'
import {
  fileUploadParamsSchemaSwagger,
  fileUploadListSchemaSwagger,
  createFileUploadSchemaSwagger,
} from '../schemas/fileUpload.schema'

export async function fileUploadRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação JWT para todas rotas exceto health
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    if (request.url === '/health') return
    try {
      await request.jwtVerify()
      ;(request as any).userId = (request as any).user?.sub
    } catch {
      throw new Error('Token de autenticação inválido')
    }
  })

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

  fastify.post('/', {
    schema: createFileUploadSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.createFileUpload(request as any, reply),
  })

  fastify.get('/:id', {
    schema: fileUploadParamsSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.getFileUploadById(request as any, reply),
  })

  fastify.get('/', {
    schema: fileUploadListSchemaSwagger,
    handler: (request: FastifyRequest, reply: FastifyReply) =>
      fileUploadController.listUserUploads(request as any, reply),
  })
}
