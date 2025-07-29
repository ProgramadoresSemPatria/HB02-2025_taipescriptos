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
}

// Instância única do service (singleton)
export const usageHistoryService = new UsageHistoryService()
