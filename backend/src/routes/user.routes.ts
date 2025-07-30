import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { usersController } from '../controllers/users.controller'
import {
  registerUserSchemaSwagger,
  loginUserSchemaSwagger,
} from '../schemas/user.schema'

// Schema para health check
const healthCheckSchema = {
  tags: ['User'],
  description: 'Health check do serviço de usuários',
  response: {
    200: {
      description: 'Serviço funcionando',
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'Users service is running' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
}

// Schema para buscar usuário por ID
const getUserByIdSchema = {
  tags: ['User'],
  description: 'Buscar usuário por ID',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Usuário encontrado',
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
    404: {
      description: 'Usuário não encontrado',
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}

// Schema para atualizar usuário
const updateUserSchemaSwagger = {
  tags: ['User'],
  description: 'Atualizar dados do usuário',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        description: 'Nome do usuário',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
      },
      credits: {
        type: 'integer',
        minimum: 0,
        description: 'Créditos do usuário',
      },
      isPremium: {
        type: 'boolean',
        description: 'Se o usuário é premium',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Usuário atualizado com sucesso',
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
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
}

export async function usersRoutes(fastify: FastifyInstance) {
  // ===== MIDDLEWARE DE AUTENTICAÇÃO =====

  /**
   * Hook que aplica autenticação JWT em rotas que precisam
   */
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Rotas que não precisam de autenticação
    const publicRoutes = ['/health', '/register', '/login']

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
