import { FastifyRequest, FastifyReply } from 'fastify'
import {
  studyMaterialService,
  StudyMaterialNotFoundError,
  UnauthorizedAccessError,
} from '../services/studyMaterial.service'

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
  userRole?: 'USER' | 'ADMIN'
}

interface GetStudyMaterialByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

interface ListUserStudyMaterialsRequest extends AuthenticatedRequest {
  Querystring: {
    page?: number
    limit?: number
  }
}

interface DeleteStudyMaterialRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

export class StudyMaterialController {
  async listUserStudyMaterials(
    request: ListUserStudyMaterialsRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const query =
        request.query as ListUserStudyMaterialsRequest['Querystring']
      const page = query?.page || 1
      const limit = query?.limit || 20

      const result = await studyMaterialService.listUserStudyMaterials(
        request.userId,
        page,
        limit,
      )

      return reply.status(200).send({
        success: true,
        data: JSON.parse(JSON.stringify(result.data)),
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

  async getStudyMaterialById(
    request: GetStudyMaterialByIdRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const { id } = request.params as { id: string }

      const material = await studyMaterialService.getStudyMaterialById(
        id,
        request.userId,
      )

      return reply.status(200).send({
        success: true,
        data: material,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async deleteStudyMaterial(
    request: DeleteStudyMaterialRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const { id } = request.params as { id: string }

      const result = await studyMaterialService.deleteStudyMaterial(
        id,
        request.userId,
      )

      return reply.status(200).send({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: 'StudyMaterial service is healthy',
      timestamp: new Date().toISOString(),
    })
  }

  private handleError(error: unknown, reply: FastifyReply) {
    console.error('StudyMaterialController Error:', error)

    if (error instanceof StudyMaterialNotFoundError) {
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

    if (error instanceof Error) {
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }

    return reply.status(500).send({
      success: false,
      message: 'Erro interno do servidor',
      error: 'Erro desconhecido',
    })
  }
}

export const studyMaterialController = new StudyMaterialController()
