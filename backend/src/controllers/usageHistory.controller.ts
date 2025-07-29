import { FastifyRequest, FastifyReply } from 'fastify'
import {
  usageHistoryService,
  InsufficientCreditsError,
  ResourceNotFoundError,
  UnauthorizedAccessError,
} from '../services/usageHistory.service'
import {
  createUsageHistorySchema,
  usageHistoryQuerySchema,
  usageHistoryParamsSchema,
  materialParamsSchema,
} from '../schemas/usageHistory.schema'

// Tipos para requests com autenticação
interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
}

// Interfaces para os requests
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
export class UsageHistoryController {
  // ===== CRIAR REGISTRO DE USO =====

  async createUsage(request: CreateUsageRequest, reply: FastifyReply) {
    try {
      // Verificar se usuário está autenticado
      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })
      }

      // Validar dados de entrada
      const body = request.body as CreateUsageRequest['Body']
      const validatedData = createUsageHistorySchema.parse({
        userId: request.userId,
        materialId: body.materialId,
        creditsUsed: body.creditsUsed,
      })

      // Registrar uso através do service
      const usage = await usageHistoryService.recordUsage(
        validatedData.userId,
        validatedData.materialId,
        validatedData.creditsUsed,
      )

      return reply.status(201).send({
        success: true,
        message: 'Uso registrado com sucesso',
        data: usage,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }
}

// Instância única do controller (singleton)
export const usageHistoryController = new UsageHistoryController()
