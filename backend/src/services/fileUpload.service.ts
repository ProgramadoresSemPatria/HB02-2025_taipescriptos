import { prisma } from '../lib/prisma'
import { FileType } from '@prisma/client'

export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

export class FileNotFoundError extends FileUploadError {
  constructor(fileId: string) {
    super(`Arquivo não encontrado: ${fileId}`, 'FILE_NOT_FOUND')
  }
}

export class UnauthorizedAccessError extends FileUploadError {
  constructor() {
    super('Acesso não autorizado a este arquivo', 'UNAUTHORIZED_ACCESS')
  }
}

export class FileUploadService {
  async createFileUpload(
    userId: string,
    filename: string,
    contentText: string,
    type: FileType,
  ) {
    const upload = await prisma.fileUpload.create({
      data: {
        userId,
        filename,
        contentText,
        type,
      },
    })
    return upload
  }

  async getFileUploadById(fileId: string, requestingUserId: string) {
    const upload = await prisma.fileUpload.findUnique({ where: { id: fileId } })
    if (!upload) throw new FileNotFoundError(fileId)
    if (upload.userId !== requestingUserId) throw new UnauthorizedAccessError()
    return upload
  }

  // Método público para buscar arquivo por ID (sem verificação de usuário)
  async getFileUploadByIdPublic(fileId: string) {
    const upload = await prisma.fileUpload.findUnique({ where: { id: fileId } })
    if (!upload) throw new FileNotFoundError(fileId)
    return upload
  }

  async listUserUploads(
    userId: string,
    requestingUserId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    if (userId !== requestingUserId) throw new UnauthorizedAccessError()

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.fileUpload.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fileUpload.count({ where: { userId } }),
    ])

    const totalPages = Math.ceil(total / limit)

    return { data, total, page, limit, totalPages }
  }
}

export const fileUploadService = new FileUploadService()
