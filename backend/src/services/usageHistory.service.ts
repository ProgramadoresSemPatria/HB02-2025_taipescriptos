import { prisma } from '../lib/prisma'
import {
  usageHistoryRepository,
  type PaginationOptions,
  type UsageHistoryWithRelations,
} from '../repositories/usageHistory.repository'
import type { UsageHistoryQuery } from '../schemas/usageHistory.schema'

// Tipos de erro personalizados
export class UsageHistoryError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'UsageHistoryError'
  }
}

export class InsufficientCreditsError extends UsageHistoryError {
  constructor(required: number, available: number) {
    super(
      `Créditos insuficientes. Necessário: ${required}, Disponível: ${available}`,
      'INSUFFICIENT_CREDITS',
    )
  }
}

export class ResourceNotFoundError extends UsageHistoryError {
  constructor(resource: string, id: string) {
    super(`${resource} não encontrado: ${id}`, 'RESOURCE_NOT_FOUND')
  }
}

export class UnauthorizedAccessError extends UsageHistoryError {
  constructor() {
    super('Acesso não autorizado a este recurso', 'UNAUTHORIZED_ACCESS')
  }
}

export class UsageHistoryService {
  // ===== OPERAÇÕES PRINCIPAIS =====
  /**
   * Registra o uso de um material por um usuário
   * Esta é a operação principal que:
   * 1. Valida se usuário e material existem
   * 2. Verifica se usuário tem créditos suficientes
   * 3. Cria registro de uso
   * 4. Decrementa créditos do usuário
   * Tudo em uma transação
   */
  async recordUsage(
    userId: string,
    materialId: string,
    creditsUsed: number,
  ): Promise<UsageHistoryWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar se usuário existe e tem créditos suficientes
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, credits: true, name: true, isPremium: true },
      })

      if (!user) {
        throw new ResourceNotFoundError('Usuário', userId)
      }

      if (user.credits < creditsUsed) {
        throw new InsufficientCreditsError(creditsUsed, user.credits)
      }

      // 2. Validar se material existe
      const material = await tx.studyMaterial.findUnique({
        where: { id: materialId },
        select: { id: true, summary: true, mode: true, language: true },
      })

      if (!material) {
        throw new ResourceNotFoundError('Material de estudo', materialId)
      }

      // 3. Criar registro de uso
      const usageRecord = await tx.usageHistory.create({
        data: {
          userId,
          materialId,
          creditsUsed,
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

      // 4. Decrementar créditos do usuário
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: creditsUsed,
          },
        },
      })
      return usageRecord
    })
  }

  /**
   * Busca um registro de uso por ID
   * Verifica se o usuário tem permissão para ver este registro
   */
  async getUsageById(
    id: string,
    requestingUserId: string,
  ): Promise<UsageHistoryWithRelations> {
    const usage = await usageHistoryRepository.findById(id)

    if (!usage) {
      throw new ResourceNotFoundError('Registro de uso', id)
    }

    // Verificar se o usuário tem permissão para ver este registro
    if (usage.userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    return usage
  }

  /**
   * Busca histórico de uso de um usuário
   */
  async getUserUsageHistory(
    userId: string,
    requestingUserId: string,
    filters: Partial<UsageHistoryQuery> = {},
    options: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{
    data: UsageHistoryWithRelations[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    // Garantir que estamos filtrando pelo usuário correto
    const userFilters = { ...filters, userId }

    return await usageHistoryRepository.findMany(userFilters, options)
  }

  /**
   * Busca uso de um material específico por um usuário
   */
  async getUserMaterialUsage(
    userId: string,
    materialId: string,
    requestingUserId: string,
  ): Promise<UsageHistoryWithRelations[]> {
    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    // Validar se material existe
    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
      select: { id: true },
    })

    if (!material) {
      throw new ResourceNotFoundError('Material de estudo', materialId)
    }

    return await usageHistoryRepository.findByUserAndMaterial(
      userId,
      materialId,
    )
  }

  // ===== ESTATÍSTICAS =====

  /**
   * Estatísticas completas de uso de um usuário
   */
  async getUserUsageStats(
    userId: string,
    requestingUserId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalCreditsUsed: number
    totalMaterialsAccessed: number
    averageCreditsPerMaterial: number
    usageByMode: Array<{
      mode: 'summary' | 'quiz' | 'flashcard' | 'review'
      count: number
      totalCredits: number
    }>
    period?: {
      startDate: Date
      endDate: Date
    }
  }> {
    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    // Validar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new ResourceNotFoundError('Usuário', userId)
    }

    // Se não forneceu datas, usar últimos 30 dias
    const defaultEndDate = endDate || new Date()
    const defaultStartDate =
      startDate || new Date(defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = await usageHistoryRepository.getUsageStatsInPeriod(
      userId,
      defaultStartDate,
      defaultEndDate,
    )

    return {
      ...stats,
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      },
    }
  }

  /**
   * Total de créditos usados por um usuário
   */
  async getUserTotalCreditsUsed(
    userId: string,
    requestingUserId: string,
  ): Promise<number> {
    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    return await usageHistoryRepository.getTotalCreditsByUser(userId)
  }

  // ===== RELATÓRIOS =====

  /**
   * Gera relatório detalhado de uso para um período
   */
  async generateUsageReport(
    userId: string,
    requestingUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    user: {
      id: string
      name: string
      email: string
    }
    period: {
      startDate: Date
      endDate: Date
    }
    summary: {
      totalCreditsUsed: number
      totalMaterialsAccessed: number
      averageCreditsPerMaterial: number
    }
    materials: Array<{
      materialId: string
      summary: string
      mode: 'summary' | 'quiz' | 'flashcard' | 'review'
      accessCount: number
      totalCredits: number
      lastAccessed: Date
    }>
    usageByMode: Array<{
      mode: 'summary' | 'quiz' | 'flashcard' | 'review'
      count: number
      totalCredits: number
    }>
  }> {
    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId) {
      throw new UnauthorizedAccessError()
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      throw new ResourceNotFoundError('Usuário', userId)
    }

    // Buscar estatísticas do período
    const stats = await usageHistoryRepository.getUsageStatsInPeriod(
      userId,
      startDate,
      endDate,
    )

    // Buscar detalhes dos materiais usados no período
    const materialsUsage = await prisma.usageHistory.groupBy({
      by: ['materialId'],
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
      _sum: { creditsUsed: true },
      _max: { createdAt: true },
    })

    // Buscar informações completas dos materiais
    const materialIds = materialsUsage.map((m) => m.materialId)
    const materials = await prisma.studyMaterial.findMany({
      where: { id: { in: materialIds } },
      select: { id: true, summary: true, mode: true },
    })

    const materialsReport = materialsUsage.map((usage) => {
      const material = materials.find((m) => m.id === usage.materialId)
      return {
        materialId: usage.materialId,
        summary: material?.summary || '',
        mode: material?.mode || ('summary' as const),
        accessCount: usage._count.id,
        totalCredits: usage._sum.creditsUsed || 0,
        lastAccessed: usage._max.createdAt || new Date(),
      }
    })

    return {
      user,
      period: { startDate, endDate },
      summary: {
        totalCreditsUsed: stats.totalCreditsUsed,
        totalMaterialsAccessed: stats.totalMaterialsAccessed,
        averageCreditsPerMaterial: stats.averageCreditsPerMaterial,
      },
      materials: materialsReport,
      usageByMode: stats.usageByMode,
    }
  }
}

// Instância única do service (singleton)
export const usageHistoryService = new UsageHistoryService()
