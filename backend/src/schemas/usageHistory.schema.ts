import { z } from 'zod'

// Schema para validar UUID
const uuidSchema = z.uuid('ID deve ser um UUID válido')

// Schema base do UsageHistory
const usageHistoryBaseSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  materialId: uuidSchema,
  creditsUsed: z
    .number()
    .int()
    .positive('Créditos devem ser um número positivo'),
  createdAt: z.date(),
})

// Schema para criar um novo registro de uso
export const createUsageHistorySchema = z.object({
  userId: uuidSchema,
  materialId: uuidSchema,
  creditsUsed: z
    .number()
    .int()
    .positive('Créditos devem ser um número positivo'),
})
