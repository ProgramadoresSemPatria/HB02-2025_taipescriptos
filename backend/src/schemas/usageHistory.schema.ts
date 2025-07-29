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

// Schema para resposta da API
export const usageHistoryResponseSchema = usageHistoryBaseSchema.extend({
  user: z
    .object({
      id: uuidSchema,
      name: z.string(),
      email: z.email(),
      credits: z.number().int(),
      isPremium: z.boolean(),
    })
    .optional(),
  material: z
    .object({
      id: uuidSchema,
      summary: z.string(),
      language: z.string(),
      mode: z.enum(['summary', 'quiz', 'flashcard', 'review']),
    })
    .optional(),
})

// Schema para estatísticas de uso
export const usageStatsSchema = z.object({
  totalCreditsUsed: z.number().int(),
  totalMaterialsAccessed: z.number().int(),
  averageCreditsPerMaterial: z.number(),
  usageByDay: z.array(
    z.object({
      date: z.string().date(),
      creditsUsed: z.number().int(),
      materialsAccessed: z.number().int(),
    }),
  ),
  usageByMode: z.array(
    z.object({
      mode: z.enum(['summary', 'quiz', 'flashcard', 'review']),
      count: z.number().int(),
      totalCredits: z.number().int(),
    }),
  ),
})

// Schema para relatório de uso por período
export const usageReportSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  totalCreditsUsed: z.number().int(),
  totalSessions: z.number().int(),
  materials: z.array(
    z.object({
      materialId: uuidSchema,
      summary: z.string(),
      accessCount: z.number().int(),
      totalCredits: z.number().int(),
      lastAccessed: z.date(),
    }),
  ),
})

// Schema para parâmetros de ID na URL
export const usageHistoryParamsSchema = z.object({
  id: uuidSchema,
})

export const materialParamsSchema = z.object({
  materialId: uuidSchema,
})
