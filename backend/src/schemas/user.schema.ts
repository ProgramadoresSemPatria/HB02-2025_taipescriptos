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

// Schema para criar usuário (input)
export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Schema para login
export const loginUserSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})
