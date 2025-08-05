import { prisma } from '../lib/prisma'
import type { Prisma } from '@prisma/client'

// Tipos para paginação
export interface PaginationOptions {
  page: number
  limit: number
}

// Tipo que representa um FileUpload com relação de User
export interface FileUploadWithUser {
  id: string
  userId: string
  filename: string
  contentText: string
  type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
  createdAt: Date

  user?: {
    id: string
    name: string
    email: string
    credits: number
    isPremium: boolean
  }
}

export class FileUploadRepository {
  // ===== CRUD BÁSICO =====

  /**
   * Busca um upload pelo ID, incluindo dados do usuário
   */
  async findById(id: string): Promise<FileUploadWithUser | null> {
    return await prisma.fileUpload.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            credits: true,
            isPremium: true,
          },
        },
      },
    })
  }

  /**
   * Lista uploads com paginação e filtro por usuário
   */
  async findMany(
    filters: { userId?: string } = {},
    options: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{
    data: FileUploadWithUser[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page, limit } = options
    const skip = (page - 1) * limit

    // Construir filtros para WHERE
    const where: Prisma.FileUploadWhereInput = {}

    if (filters.userId) {
      where.userId = filters.userId
    }

    const [data, total] = await Promise.all([
      prisma.fileUpload.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
              isPremium: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fileUpload.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Cria um novo registro de upload
   */
  async create(data: {
    userId: string
    filename: string
    contentText: string
    type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
  }): Promise<FileUploadWithUser> {
    return await prisma.fileUpload.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            credits: true,
            isPremium: true,
          },
        },
      },
    })
  }

  /**
   * Atualiza filename de um upload (opcional)
   */
  async updateFilename(
    fileId: string,
    newFilename: string,
  ): Promise<FileUploadWithUser | null> {
    try {
      return await prisma.fileUpload.update({
        where: { id: fileId },
        data: { filename: newFilename },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
              isPremium: true,
            },
          },
        },
      })
    } catch {
      return null
    }
  }

  /**
   * Deleta upload pelo ID, retorna true se deletado com sucesso
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.fileUpload.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  // ===== CONSULTAS ESPECÍFICAS =====

  /**
   * Lista uploads de um usuário específico
   */
  async findByUserId(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 20 },
  ) {
    return this.findMany({ userId }, options)
  }
}

// Instância única do repositório
export const fileUploadRepository = new FileUploadRepository()
