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
