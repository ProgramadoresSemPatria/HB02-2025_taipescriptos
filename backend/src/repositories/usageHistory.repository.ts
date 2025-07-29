import { prisma } from '../lib/prisma'
import type {
  CreateUsageHistoryData,
  UsageHistoryQuery,
} from '../schemas/usageHistory.schema'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface UsageHistoryWithRelations {
  id: string
  userId: string
  materialId: string
  creditsUsed: number
  createdAt: Date
  user?: {
    id: string
    name: string
    email: string
    credits: number
    isPremium: boolean
  }
  material?: {
    id: string
    summary: string
    language: string
    mode: 'summary' | 'quiz' | 'flashcard' | 'review'
  }
}

export class UsageHistoryRepository {
  // ===== CRUD BÁSICO =====

  /**
   * Busca um registro de uso por ID
   */
  async findById(id: string): Promise<UsageHistoryWithRelations | null> {
    return await prisma.usageHistory.findUnique({
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
        material: {
          select: {
            id: true,
            summary: true,
            language: true,
            mode: true,
          },
        },
      },
    })
  }

  /**
   * Lista registros com filtros e paginação
   */
  async findMany(
    filters: Partial<UsageHistoryQuery>,
    options: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{
    data: UsageHistoryWithRelations[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page, limit } = options
    const skip = (page - 1) * limit

    // Construir filtros para o WHERE
    const where: any = {}

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.materialId) {
      where.materialId = filters.materialId
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate)
      }
    }

    // Buscar dados e total em paralelo
    const [data, total] = await Promise.all([
      prisma.usageHistory.findMany({
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
          material: {
            select: {
              id: true,
              summary: true,
              language: true,
              mode: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.usageHistory.count({ where }),
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
   * Cria um novo registro de uso
   */
  async create(
    data: CreateUsageHistoryData,
  ): Promise<UsageHistoryWithRelations> {
    return await prisma.usageHistory.create({
      data: {
        userId: data.userId,
        materialId: data.materialId,
        creditsUsed: data.creditsUsed,
      },
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
        material: {
          select: {
            id: true,
            summary: true,
            language: true,
            mode: true,
          },
        },
      },
    })
  }

  /**
   * Deleta um registro de uso por ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.usageHistory.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  // ===== CONSULTAS ESPECÍFICAS =====

  /**
   * Busca histórico de uso de um usuário
   */
  async findByUserId(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{
    data: UsageHistoryWithRelations[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    return this.findMany({ userId }, options)
  }

  /**
   * Busca uso de um material específico
   */
  async findByMaterialId(
    materialId: string,
  ): Promise<UsageHistoryWithRelations[]> {
    return await prisma.usageHistory.findMany({
      where: { materialId },
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
        material: {
          select: {
            id: true,
            summary: true,
            language: true,
            mode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Busca uso específico de um usuário em um material
   */
  async findByUserAndMaterial(
    userId: string,
    materialId: string,
  ): Promise<UsageHistoryWithRelations[]> {
    return await prisma.usageHistory.findMany({
      where: {
        userId,
        materialId,
      },
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
        material: {
          select: {
            id: true,
            summary: true,
            language: true,
            mode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ===== ESTATÍSTICAS =====

  /**
   * Calcula total de créditos usados por um usuário
   */
  async getTotalCreditsByUser(userId: string): Promise<number> {
    const result = await prisma.usageHistory.aggregate({
      where: { userId },
      _sum: {
        creditsUsed: true,
      },
    })

    return result._sum.creditsUsed || 0
  }

  /**
   * Calcula total de créditos usados em um material
   */
  async getTotalCreditsByMaterial(materialId: string): Promise<number> {
    const result = await prisma.usageHistory.aggregate({
      where: { materialId },
      _sum: {
        creditsUsed: true,
      },
    })

    return result._sum.creditsUsed || 0
  }

  /**
   * Estatísticas de uso de um usuário em um período
   */
  async getUsageStatsInPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalCreditsUsed: number
    totalMaterialsAccessed: number
    averageCreditsPerMaterial: number
    usageByMode: Array<{
      mode: 'summary' | 'quiz' | 'flashcard' | 'review'
      count: number
      totalCredits: number
    }>
  }> {
    // Total de créditos no período
    const creditsResult = await prisma.usageHistory.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        creditsUsed: true,
      },
      _count: {
        materialId: true,
      },
    })

    // Materiais únicos acessados
    const uniqueMaterials = await prisma.usageHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        materialId: true,
      },
      distinct: ['materialId'],
    })

    // Uso por modo de estudo
    const usageByMode = await prisma.usageHistory.groupBy({
      by: ['materialId'],
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        creditsUsed: true,
      },
      _count: {
        id: true,
      },
    })

    // Buscar informações dos materiais para obter os modos
    const materialIds = usageByMode.map((item) => item.materialId)
    const materials = await prisma.studyMaterial.findMany({
      where: {
        id: {
          in: materialIds,
        },
      },
      select: {
        id: true,
        mode: true,
      },
    })

    // Agrupar por modo
    const modeStats = materials.reduce(
      (acc, material) => {
        const usage = usageByMode.find((u) => u.materialId === material.id)
        if (!usage) return acc

        const existing = acc.find((item) => item.mode === material.mode)
        if (existing) {
          existing.count += usage._count.id
          existing.totalCredits += usage._sum.creditsUsed || 0
        } else {
          acc.push({
            mode: material.mode,
            count: usage._count.id,
            totalCredits: usage._sum.creditsUsed || 0,
          })
        }
        return acc
      },
      [] as Array<{
        mode: 'summary' | 'quiz' | 'flashcard' | 'review'
        count: number
        totalCredits: number
      }>,
    )

    const totalCreditsUsed = creditsResult._sum.creditsUsed || 0
    const totalMaterialsAccessed = uniqueMaterials.length
    const averageCreditsPerMaterial =
      totalMaterialsAccessed > 0 ? totalCreditsUsed / totalMaterialsAccessed : 0

    return {
      totalCreditsUsed,
      totalMaterialsAccessed,
      averageCreditsPerMaterial:
        Math.round(averageCreditsPerMaterial * 100) / 100,
      usageByMode: modeStats,
    }
  }

  /**
   * Materiais mais populares (mais acessados)
   */
  async getMaterialPopularityStats(limit: number = 10): Promise<
    Array<{
      materialId: string
      summary: string
      mode: 'summary' | 'quiz' | 'flashcard' | 'review'
      accessCount: number
      totalCredits: number
      uniqueUsers: number
    }>
  > {
    const popularMaterials = await prisma.usageHistory.groupBy({
      by: ['materialId'],
      _count: {
        id: true,
        userId: true,
      },
      _sum: {
        creditsUsed: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    })

    // Buscar informações dos materiais
    const materialIds = popularMaterials.map((item) => item.materialId)
    const materials = await prisma.studyMaterial.findMany({
      where: {
        id: {
          in: materialIds,
        },
      },
      select: {
        id: true,
        summary: true,
        mode: true,
      },
    })

    // Contar usuários únicos para cada material
    const uniqueUsersPromises = materialIds.map(async (materialId) => {
      const users = await prisma.usageHistory.findMany({
        where: { materialId },
        select: { userId: true },
        distinct: ['userId'],
      })
      return { materialId, uniqueUsers: users.length }
    })

    const uniqueUsersCounts = await Promise.all(uniqueUsersPromises)

    return popularMaterials.map((usage) => {
      const material = materials.find((m) => m.id === usage.materialId)
      const uniqueUsers = uniqueUsersCounts.find(
        (u) => u.materialId === usage.materialId,
      )

      return {
        materialId: usage.materialId,
        summary: material?.summary || '',
        mode: material?.mode || 'summary',
        accessCount: usage._count.id,
        totalCredits: usage._sum.creditsUsed || 0,
        uniqueUsers: uniqueUsers?.uniqueUsers || 0,
      }
    })
  }

  // ===== VERIFICAÇÕES =====

  /**
   * Verifica se um usuário já usou um material específico
   */
  async hasUserUsedMaterial(
    userId: string,
    materialId: string,
  ): Promise<boolean> {
    const usage = await prisma.usageHistory.findFirst({
      where: {
        userId,
        materialId,
      },
    })

    return !!usage
  }

  /**
   * Conta quantas vezes um usuário usou um material
   */
  async countUserMaterialUsage(
    userId: string,
    materialId: string,
  ): Promise<number> {
    return await prisma.usageHistory.count({
      where: {
        userId,
        materialId,
      },
    })
  }
}

// Instância única do repository (singleton)
export const usageHistoryRepository = new UsageHistoryRepository()
