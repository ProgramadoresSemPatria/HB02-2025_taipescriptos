import { FastifyRequest, FastifyReply } from 'fastify'
import {
  fileUploadService,
  FileNotFoundError,
  UnauthorizedAccessError,
} from '../services/fileUpload.service'
import {
  fileUploadParamsSchema,
  createFileUploadBodySchema,
} from '../schemas/fileUpload.schema'

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
  userRole?: 'USER' | 'ADMIN'
}

interface CreateFileUploadRequest extends AuthenticatedRequest {
  Body: {
    filename: string
    contentText: string
    type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
  }
}

interface GetFileUploadByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

interface ListUserUploadsRequest extends AuthenticatedRequest {
  Querystring: {
    userId?: string
    page?: number
    limit?: number
  }
}

export class FileUploadController {
  async createFileUpload(
    request: CreateFileUploadRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const validated = createFileUploadBodySchema.parse(request.body)

      const upload = await fileUploadService.createFileUpload(
        request.userId,
        validated.filename,
        validated.contentText,
        validated.type,
      )

      return reply.status(201).send({
        success: true,
        message: 'Upload criado com sucesso',
        data: upload,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async getFileUploadById(
    request: GetFileUploadByIdRequest,
    reply: FastifyReply,
  ) {
    try {
      const { id } = fileUploadParamsSchema.parse(request.params)

      // Como esta é uma rota pública, usa o método público do serviço
      const upload = await fileUploadService.getFileUploadByIdPublic(id)

      return reply.status(200).send({
        success: true,
        data: upload,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listUserUploads(request: ListUserUploadsRequest, reply: FastifyReply) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const query = request.query as ListUserUploadsRequest['Querystring']

      const userId = query.userId || request.userId
      if (userId !== request.userId)
        return reply.status(403).send({
          success: false,
          message: 'Não autorizado a listagem de uploads de outro usuário',
          code: 'UNAUTHORIZED_ACCESS',
        })

      const page = query.page || 1
      const limit = query.limit || 20

      const result = await fileUploadService.listUserUploads(
        userId,
        request.userId,
        page,
        limit,
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

  private handleError(error: unknown, reply: FastifyReply) {
    console.error('[FileUploadController] Error:', error)

    if (error instanceof FileNotFoundError)
      return reply.status(404).send({
        success: false,
        message: error.message,
        code: error.code,
      })

    if (error instanceof UnauthorizedAccessError)
      return reply.status(403).send({
        success: false,
        message: error.message,
        code: error.code,
      })

    return reply.status(500).send({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    })
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: 'FileUpload module is healthy',
      timestamp: new Date().toISOString(),
    })
  }
}

export const fileUploadController = new FileUploadController()
