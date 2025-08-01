import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { usersController } from '../controllers/users.controller'
import {
  registerUserSchemaSwagger,
  loginUserSchemaSwagger,
  healthCheckSchema,
  getUserByIdSchema,
  updateUserSchemaSwagger,
} from '../schemas/user.schema'

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
    handler: async (
      request: FastifyRequest<{
        Body: { name: string; email: string; password: string }
      }>,
      reply: FastifyReply,
    ) => {
      const registerRequest = request as FastifyRequest & {
        Body: { name: string; email: string; password: string }
        body: { name: string; email: string; password: string }
      }
      return usersController.register(registerRequest, reply)
    },
  })

  // Login
  fastify.post('/login', {
    schema: loginUserSchemaSwagger,
    handler: async (
      request: FastifyRequest<{
        Body: { email: string; password: string }
      }>,
      reply: FastifyReply,
    ) => {
      const loginRequest = request as FastifyRequest & {
        Body: { email: string; password: string }
        body: { email: string; password: string }
      }
      return usersController.login(loginRequest, reply)
    },
  })

  // ===== ROTAS AUTENTICADAS =====

  // Perfil do usuário logado
  fastify.get('/profile', {
    schema: {
      tags: ['User'],
      description: 'Obter perfil do usuário logado',
      security: [{ bearerAuth: [] }],
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
      const authenticatedRequest = request as FastifyRequest & {
        userId?: string
      }
      return usersController.getProfile(authenticatedRequest, reply)
    },
  })

  // Buscar usuário por ID
  fastify.get('/:id', {
    schema: getUserByIdSchema,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string }
      }>,
      reply: FastifyReply,
    ) => {
      const getUserRequest = request as FastifyRequest & {
        Params: { id: string }
        params: { id: string }
        userId?: string
      }
      return usersController.getUserById(getUserRequest, reply)
    },
  })

  // Atualizar usuário
  fastify.put('/:id', {
    schema: updateUserSchemaSwagger,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string }
        Body: {
          name?: string
          email?: string
          credits?: number
          isPremium?: boolean
        }
      }>,
      reply: FastifyReply,
    ) => {
      const updateUserRequest = request as FastifyRequest & {
        params: { id: string }
        Body: {
          name?: string
          email?: string
          credits?: number
          isPremium?: boolean
        }
        body: {
          name?: string
          email?: string
          credits?: number
          isPremium?: boolean
        }
        Params: { id: string }
        userId?: string
      }
      return usersController.updateUser(updateUserRequest, reply)
    },
  })

  // Deletar usuário
  fastify.delete('/:id', {
    schema: {
      tags: ['User'],
      description: 'Deletar usuário',
      security: [{ bearerAuth: [] }],
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
    handler: async (
      request: FastifyRequest<{
        Params: { id: string }
      }>,
      reply: FastifyReply,
    ) => {
      const deleteUserRequest = request as FastifyRequest & {
        Params: { id: string }
        params: { id: string }
        userId?: string
      }
      return usersController.deleteUser(deleteUserRequest, reply)
    },
  })

  // ===== ROTAS ADMINISTRATIVAS =====
  
  // Promover usuário a admin (apenas para admins)
  fastify.patch('/:id/promote-admin', {
    schema: {
      tags: ['User'],
      description: 'Promover usuário a admin (apenas para admins)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Usuário promovido a admin com sucesso',
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                credits: { type: 'integer' },
                isPremium: { type: 'boolean' },
                role: { type: 'string', enum: ['USER', 'ADMIN'] },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        403: {
          description: 'Acesso negado - apenas admins',
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
    handler: async (
      request: FastifyRequest<{
        Params: { id: string }
      }>,
      reply: FastifyReply,
    ) => {
      const promoteUserRequest = request as FastifyRequest & {
        Params: { id: string }
        params: { id: string }
        userId?: string
        userRole?: 'USER' | 'ADMIN'
      }
      return usersController.promoteUserToAdmin(promoteUserRequest, reply)
    },
  })
}
