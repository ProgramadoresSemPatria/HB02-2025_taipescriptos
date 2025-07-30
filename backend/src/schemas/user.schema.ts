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

// Schema para atualizar usuário
export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    email: z.string().email('Email inválido').optional(),
    credits: z
      .number()
      .int()
      .nonnegative('Créditos não podem ser negativos')
      .optional(),
    isPremium: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })

// Tipos TypeScript derivados dos schemas
export type User = z.infer<typeof userBaseSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

// ==== SCHEMAS PARA SWAGGER ====

// Schema para registro de usuário
export const registerUserSchemaSwagger = {
  tags: ['User'],
  description: 'Registrar um novo usuário',
  body: createUserSchema, // Usa o schema Zod para validação
  response: {
    201: {
      description: 'Usuário registrado com sucesso',
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
        name: { type: 'string', description: 'Nome do usuário' },
        email: {
          type: 'string',
          format: 'email',
          description: 'Email do usuário',
        },
        credits: { type: 'integer', description: 'Créditos do usuário' },
        isPremium: { type: 'boolean', description: 'Se o usuário é premium' },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Data de criação do usuário',
        },
      },
    },
    400: {
      description: 'Erro de validação',
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem de erro' },
        errors: {
          type: 'object',
          additionalProperties: {
            type: 'string',
            description: 'Detalhes do erro de validação',
          },
        },
      },
    },
  },
}

// Schema para login de usuário
export const loginUserSchemaSwagger = {
  tags: ['User'],
  description: 'Login de usuário',
  body: loginUserSchema, // Usa o schema Zod para validação
  response: {
    200: {
      description: 'Login bem-sucedido',
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token de autenticação' },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário',
            },
            name: { type: 'string', description: 'Nome do usuário' },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            credits: { type: 'integer', description: 'Créditos do usuário' },
            isPremium: {
              type: 'boolean',
              description: 'Se o usuário é premium',
            },
          },
        },
      },
    },
    400: {
      description: 'Erro de validação ou credenciais inválidas',
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem de erro' },
      },
    },
  },
}
