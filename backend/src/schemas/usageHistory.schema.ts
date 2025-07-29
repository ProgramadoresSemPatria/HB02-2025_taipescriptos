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

// Schema para atualizar registro
export const updateUsageHistorySchema = z.object({
  creditsUsed: z
    .number()
    .int()
    .positive('Créditos devem ser um número positivo')
    .optional(),
})

// Schema para consultas/filtros
export const usageHistoryQuerySchema = z.object({
  userId: uuidSchema.optional(),
  materialId: uuidSchema.optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  limit: z.number().int().positive().max(100).default(20),
  page: z.number().int().positive().default(1),
})

