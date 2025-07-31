import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { usersController } from '../controllers/users.controller'
import {
  registerUserSchemaSwagger,
  loginUserSchemaSwagger,
  healthCheckSchema,
  getUserByIdSchema,
  updateUserSchemaSwagger,
} from '../schemas/user.schema'

export async function usersRoutes(fastify: FastifyInstance) {
  // ===== MIDDLEWARE DE AUTENTICAÇÃO =====

  /**
   * Hook que aplica autenticação JWT em rotas que precisam
   */
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Rotas que não precisam de autenticação
    const publicRoutes = [
      '/api/users/health',
      '/api/users/register',
      '/api/users/login',
    ]

    if (publicRoutes.includes(request.url)) {
      return
    }

    // Verificar JWT e extrair userId
    try {
      await request.jwtVerify()
      // Assumindo que o payload do JWT tem um campo 'sub' com o userId
      ;(request as any).userId = (request as any).user?.sub
    } catch (error) {
      throw new Error('Token de autenticação inválido')
    }
  })

  // ===== ROTAS PÚBLICAS =====

  // Health check
  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.healthCheck(request, reply)
    },
  })

  // Registro de usuário
  fastify.post('/register', {
    schema: registerUserSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.register(request as any, reply)
    },
  })

  // Login
  fastify.post('/login', {
    schema: loginUserSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.login(request as any, reply)
    },
  })

  // ===== ROTAS AUTENTICADAS =====

  // Perfil do usuário logado
  fastify.get('/profile', {
    schema: {
      tags: ['User'],
      description: 'Obter perfil do usuário logado',
      response: {
        200: {
          description: 'Perfil do usuário',
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                credits: { type: 'integer' },
                isPremium: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.getProfile(request as any, reply)
    },
  })

  // Buscar usuário por ID
  fastify.get('/:id', {
    schema: getUserByIdSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.getUserById(request as any, reply)
    },
  })

  // Atualizar usuário
  fastify.put('/:id', {
    schema: updateUserSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.updateUser(request as any, reply)
    },
  })

  // Deletar usuário
  fastify.delete('/:id', {
    schema: {
      tags: ['User'],
      description: 'Deletar usuário',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Usuário deletado com sucesso',
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usersController.deleteUser(request as any, reply)
    },
  })
}
