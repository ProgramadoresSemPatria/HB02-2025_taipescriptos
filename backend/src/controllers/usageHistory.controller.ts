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
