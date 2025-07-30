import { z } from 'zod'

// Schema para validar UUID
const uuidSchema = z.string().uuid('ID deve ser um UUID válido')

// Schema base do User (para resposta da API)
export const userBaseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.email('Email inválido'),
  credits: z
    .number()
    .int()
    .nonnegative('Créditos não podem ser negativos')
    .default(3),
  isPremium: z.boolean().default(false),
  createdAt: z.iso.datetime(),
})
