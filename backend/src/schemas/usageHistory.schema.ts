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

// ===== SCHEMAS PARA SWAGGER =====

export const healthCheckSchema = {
  tags: ['UsageHistory'],
  description: 'Verificar se o módulo UsageHistory está funcionando',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  },
}

export const createUsageHistorySchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Registrar o uso de um material de estudo',
  body: {
    type: 'object',
    required: ['materialId', 'creditsUsed'],
    properties: {
      materialId: { type: 'string', format: 'uuid' },
      creditsUsed: { type: 'number', minimum: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}

export const usageHistoryParamsSchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Buscar um registro específico de uso por ID',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}

export const usageHistoryQuerySchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Listar histórico de uso do usuário com filtros e paginação',
  querystring: {
    type: 'object',
    properties: {
      materialId: { type: 'string', format: 'uuid' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
        pagination: { type: 'object' },
      },
    },
  },
}

export const materialParamsSchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Listar histórico de uso de um material específico pelo usuário',
  params: {
    type: 'object',
    required: ['materialId'],
    properties: {
      materialId: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
      },
    },
  },
}

export const usageStatsSchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Obter estatísticas completas de uso do usuário (últimos 30 dias)',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalCreditsUsed: { type: 'number' },
            totalMaterialsAccessed: { type: 'number' },
            averageCreditsPerMaterial: { type: 'number' },
            usageByMode: { type: 'array' },
            period: { type: 'object' },
          },
        },
      },
    },
  },
}

export const userTotalCreditsSchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Obter total de créditos utilizados pelo usuário',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            totalCreditsUsed: { type: 'number' },
          },
        },
      },
    },
  },
}

export const usageReportSchemaSwagger = {
  tags: ['UsageHistory'],
  description: 'Gerar relatório detalhado de uso para um período específico',
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}

// Tipos TypeScript derivados dos schemas
export type CreateUsageHistoryData = z.infer<typeof createUsageHistorySchema>
export type UpdateUsageHistoryData = z.infer<typeof updateUsageHistorySchema>
export type UsageHistoryQuery = z.infer<typeof usageHistoryQuerySchema>
export type UsageHistoryResponse = z.infer<typeof usageHistoryResponseSchema>
export type UsageStats = z.infer<typeof usageStatsSchema>
export type UsageReport = z.infer<typeof usageReportSchema>
export type UsageHistoryParams = z.infer<typeof usageHistoryParamsSchema>
export type MaterialParams = z.infer<typeof materialParamsSchema>
