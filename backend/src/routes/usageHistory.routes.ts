import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { usageHistoryController } from '../controllers/usageHistory.controller'
import {
  healthCheckSchema,
  createUsageHistorySchemaSwagger,
  usageHistoryParamsSchemaSwagger,
  usageHistoryQuerySchemaSwagger,
  materialParamsSchemaSwagger,
  usageStatsSchemaSwagger,
  userTotalCreditsSchemaSwagger,
  usageReportSchemaSwagger,
} from '../schemas/usageHistory.schema'

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

// ===== INTERFACES PARA TIPOS DE REQUEST =====

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
  userRole?: 'USER' | 'ADMIN'
}

interface CreateUsageRequest extends AuthenticatedRequest {
  Body: {
    materialId: string
    creditsUsed: number
  }
}

interface GetUsageByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

interface GetMaterialUsageRequest extends AuthenticatedRequest {
  Params: {
    materialId: string
  }
}

interface GetUsageHistoryRequest extends AuthenticatedRequest {
  Querystring: {
    userId?: string
    materialId?: string
    startDate?: string
    endDate?: string
    limit?: number
    page?: number
  }
}

interface GenerateReportRequest extends AuthenticatedRequest {
  Querystring: {
    startDate: string
    endDate: string
  }
}

export async function usageHistoryRoutes(fastify: FastifyInstance) {
  // ===== MIDDLEWARE DE AUTENTICAÇÃO =====

  /**
   * Hook que aplica autenticação JWT em rotas que precisam
   */
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Rotas que não precisam de autenticação
    const publicRoutes = [
      '/api/usage-history/health',
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

  // ===== ROTAS =====

  // Health check
  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return usageHistoryController.healthCheck(request, reply)
    },
  })

  // Estatísticas do usuário
  fastify.get('/stats', {
    schema: {
      ...usageStatsSchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithAuth = request as AuthenticatedRequest
      return usageHistoryController.getUserUsageStats(requestWithAuth, reply)
    },
  })

  // Total de créditos usados
  fastify.get('/total-credits', {
    schema: {
      ...userTotalCreditsSchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithAuth = request as AuthenticatedRequest
      return usageHistoryController.getUserTotalCredits(requestWithAuth, reply)
    },
  })

  // Relatório detalhado
  fastify.get('/report', {
    schema: {
      ...usageReportSchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithQuery = request as GenerateReportRequest
      return usageHistoryController.generateUsageReport(requestWithQuery, reply)
    },
  })

  // Uso de material específico
  fastify.get('/material/:materialId', {
    schema: {
      ...materialParamsSchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithParams = request as GetMaterialUsageRequest
      return usageHistoryController.getUserMaterialUsage(
        requestWithParams,
        reply,
      )
    },
  })

  // Buscar registro por ID
  fastify.get('/:id', {
    schema: {
      ...usageHistoryParamsSchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithParams = request as GetUsageByIdRequest
      return usageHistoryController.getUsageById(requestWithParams, reply)
    },
  })

  // Registrar uso de material
  fastify.post('/', {
    schema: {
      ...createUsageHistorySchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithBody = request as CreateUsageRequest
      return usageHistoryController.createUsage(requestWithBody, reply)
    },
  })

  // Listar histórico do usuário
  fastify.get('/', {
    schema: {
      ...usageHistoryQuerySchemaSwagger,
      security: [{ bearerAuth: [] }],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithQuery = request as GetUsageHistoryRequest
      return usageHistoryController.getUserUsageHistory(requestWithQuery, reply)
    },
  })
}
