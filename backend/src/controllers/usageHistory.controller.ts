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

  // ===== ESTATÍSTICAS =====

  async getUserUsageStats(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      // Verificar se usuário está autenticado
      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })
      }

      // Buscar estatísticas (últimos 30 dias por padrão)
      const stats = await usageHistoryService.getUserUsageStats(
        request.userId,
        request.userId,
      )

      return reply.status(200).send({
        success: true,
        data: stats,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async getUserTotalCredits(
    request: AuthenticatedRequest,
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

      // Buscar total de créditos
      const totalCredits = await usageHistoryService.getUserTotalCreditsUsed(
        request.userId,
        request.userId,
      )

      return reply.status(200).send({
        success: true,
        data: {
          userId: request.userId,
          totalCreditsUsed: totalCredits,
        },
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  // ===== RELATÓRIOS =====

  async generateUsageReport(
    request: GenerateReportRequest,
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
      const queryParams = request.query as GenerateReportRequest['Querystring']
      if (!queryParams.startDate || !queryParams.endDate) {
        return reply.status(400).send({
          success: false,
          message: 'startDate e endDate são obrigatórios',
          code: 'MISSING_REQUIRED_PARAMS',
        })
      }

      const startDate = new Date(queryParams.startDate)
      const endDate = new Date(queryParams.endDate)

      // Validar datas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return reply.status(400).send({
          success: false,
          message: 'Formato de data inválido. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT',
        })
      }

      if (startDate > endDate) {
        return reply.status(400).send({
          success: false,
          message: 'Data de início deve ser anterior à data de fim',
          code: 'INVALID_DATE_RANGE',
        })
      }

      // Gerar relatório
      const report = await usageHistoryService.generateUsageReport(
        request.userId,
        request.userId,
        startDate,
        endDate,
      )

      return reply.status(200).send({
        success: true,
        data: report,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  // ===== TRATAMENTO DE ERROS =====

  private handleError(error: unknown, reply: FastifyReply) {
    console.error('[UsageHistoryController] Error:', error)

    // Erros específicos do service
    if (error instanceof InsufficientCreditsError) {
      return reply.status(400).send({
        success: false,
        message: error.message,
        code: error.code,
      })
    }

    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        success: false,
        message: error.message,
        code: error.code,
      })
    }

    if (error instanceof UnauthorizedAccessError) {
      return reply.status(403).send({
        success: false,
        message: error.message,
        code: error.code,
      })
    }

    // Erro interno do servidor
    return reply.status(500).send({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    })
  }
  // ===== HEALTH CHECK =====

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: 'UsageHistory module is healthy',
      timestamp: new Date().toISOString(),
    })
  }
}

export const usageHistoryController = new UsageHistoryController()
