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

// ===== INTERFACES PARA TIPOS DE REQUEST =====

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
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
   * Hook que aplica autenticação JWT em todas as rotas exceto health check
   */
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Pular autenticação para health check
    if (request.url === '/api/health') {
      return
    }

    // Verificar JWT e extrair userId
    try {
      await request.jwtVerify()
      // Assumindo que o payload do JWT tem um campo 'sub' com o userId
      const authRequest = request as AuthenticatedRequest
      authRequest.userId = (request.user as { sub?: string })?.sub
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
    schema: usageStatsSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithAuth = request as AuthenticatedRequest
      return usageHistoryController.getUserUsageStats(requestWithAuth, reply)
    },
  })

  // Total de créditos usados
  fastify.get('/total-credits', {
    schema: userTotalCreditsSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithAuth = request as AuthenticatedRequest
      return usageHistoryController.getUserTotalCredits(requestWithAuth, reply)
    },
  })

  // Relatório detalhado
  fastify.get('/report', {
    schema: usageReportSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithQuery = request as GenerateReportRequest
      return usageHistoryController.generateUsageReport(requestWithQuery, reply)
    },
  })

  // Uso de material específico
  fastify.get('/material/:materialId', {
    schema: materialParamsSchemaSwagger,
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
    schema: usageHistoryParamsSchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithParams = request as GetUsageByIdRequest
      return usageHistoryController.getUsageById(requestWithParams, reply)
    },
  })

  // Registrar uso de material
  fastify.post('/', {
    schema: createUsageHistorySchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithBody = request as CreateUsageRequest
      return usageHistoryController.createUsage(requestWithBody, reply)
    },
  })

  // Listar histórico do usuário
  fastify.get('/', {
    schema: usageHistoryQuerySchemaSwagger,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestWithQuery = request as GetUsageHistoryRequest
      return usageHistoryController.getUserUsageHistory(requestWithQuery, reply)
    },
  })
}
