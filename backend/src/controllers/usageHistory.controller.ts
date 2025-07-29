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

  // ===== BUSCAR REGISTROS =====

  async getUsageById(request: GetUsageByIdRequest, reply: FastifyReply) {
    try {
      // Verificar se usuário está autenticado
      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })
      }

      // Validar parâmetros
      const { id } = usageHistoryParamsSchema.parse(request.params)

      // Buscar registro
      const usage = await usageHistoryService.getUsageById(id, request.userId)

      return reply.status(200).send({
        success: true,
        data: usage,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async getUserUsageHistory(
    request: GetUsageHistoryRequest,
    reply: FastifyReply,
  ) {
    try {
      // Verificar se usuário está autenticado
      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })
      }

      // Validar query parameters
      const queryParams = request.query as GetUsageHistoryRequest['Querystring']
      const query = usageHistoryQuerySchema.parse(queryParams)

      // Buscar histórico do usuário
      const result = await usageHistoryService.getUserUsageHistory(
        request.userId,
        request.userId,
        {
          materialId: query.materialId,
          startDate: query.startDate,
          endDate: query.endDate,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      )

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async getUserMaterialUsage(
    request: GetMaterialUsageRequest,
    reply: FastifyReply,
  ) {
    try {
      // Verificar se usuário está autenticado
      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })
      }

      // Validar parâmetros
      const { materialId } = materialParamsSchema.parse(request.params)

      // Buscar uso do material
      const usage = await usageHistoryService.getUserMaterialUsage(
        request.userId,
        materialId,
        request.userId,
      )

      return reply.status(200).send({
        success: true,
        data: usage,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }
}

// Instância única do controller (singleton)
export const usageHistoryController = new UsageHistoryController()
