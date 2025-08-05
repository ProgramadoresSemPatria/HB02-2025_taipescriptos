import { z } from 'zod'

// Schema para validar UUID
const uuidSchema = z.uuid('ID deve ser um UUID válido')

// Enum para roles de usuário
export const UserRoleEnum = z.enum(['USER', 'ADMIN'])

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
  role: UserRoleEnum.default('USER'),
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

// Schema para atualizar usuário (admin)
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
    role: UserRoleEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })

// Schema para editar perfil do usuário logado
export const editProfileSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    currentPassword: z
      .string()
      .min(6, 'Senha atual deve ter pelo menos 6 caracteres')
      .optional(),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
      .optional(),
    confirmPassword: z
      .string()
      .min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })
  .refine(
    (data) => {
      // Se está tentando alterar senha, deve fornecer senha atual
      if (data.newPassword && !data.currentPassword) {
        return false
      }
      return true
    },
    {
      message: 'Para alterar a senha, você deve fornecer a senha atual',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      // Se está tentando alterar senha, deve confirmar a nova senha
      if (data.newPassword && !data.confirmPassword) {
        return false
      }
      return true
    },
    {
      message: 'Para alterar a senha, você deve confirmar a nova senha',
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data) => {
      // Nova senha e confirmação devem ser iguais
      if (
        data.newPassword &&
        data.confirmPassword &&
        data.newPassword !== data.confirmPassword
      ) {
        return false
      }
      return true
    },
    {
      message: 'Nova senha e confirmação devem ser iguais',
      path: ['confirmPassword'],
    },
  )

// Tipos TypeScript derivados dos schemas
export type User = z.infer<typeof userBaseSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type EditProfile = z.infer<typeof editProfileSchema>

// ==== SCHEMAS PARA SWAGGER ====

// Schema para registro de usuário
export const registerUserSchemaSwagger = {
  tags: ['User'],
  description: 'Registrar um novo usuário',
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        description: 'Nome do usuário',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
      },
      password: {
        type: 'string',
        minLength: 6,
        description: 'Senha do usuário (mínimo 6 caracteres)',
      },
    },
    required: ['name', 'email', 'password'],
  },
  response: {
    201: {
      description: 'Usuário registrado com sucesso',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensagem de sucesso',
        },
        token: {
          type: 'string',
          description: 'Token JWT para autenticação',
        },
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário',
            },
          },
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
    409: {
      description: 'Usuário já existe',
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem de erro' },
        code: { type: 'string', description: 'Código do erro' },
      },
    },
    500: {
      description: 'Erro interno do servidor',
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem de erro' },
      },
    },
  },
}

// Schema para login de usuário
export const loginUserSchemaSwagger = {
  tags: ['User'],
  description: 'Login de usuário',
  body: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
      },
      password: {
        type: 'string',
        minLength: 6,
        description: 'Senha do usuário',
      },
    },
    required: ['email', 'password'],
  },
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

// Schema para health check
export const healthCheckSchema = {
  tags: ['User'],
  description: 'Health check do serviço de usuários',
  response: {
    200: {
      description: 'Serviço funcionando',
      type: 'object',
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
}

// Schema para buscar usuário por ID
export const getUserByIdSchema = {
  tags: ['User'],
  description: 'Buscar usuário por ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Usuário encontrado',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            credits: { type: 'integer' },
            isPremium: { type: 'boolean' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    404: {
      description: 'Usuário não encontrado',
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}

// Schema para atualizar usuário (admin)
export const updateUserSchemaSwagger = {
  tags: ['User'],
  description: 'Atualizar dados do usuário (admin)',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        description: 'Nome do usuário',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
      },
      credits: {
        type: 'integer',
        minimum: 0,
        description: 'Créditos do usuário',
      },
      isPremium: {
        type: 'boolean',
        description: 'Se o usuário é premium',
      },
      role: {
        type: 'string',
        enum: ['USER', 'ADMIN'],
        description: 'Role do usuário',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Usuário atualizado com sucesso',
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            credits: { type: 'integer' },
            isPremium: { type: 'boolean' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
}

// Schema para editar perfil do usuário logado
export const editProfileSchemaSwagger = {
  tags: ['User'],
  description: 'Editar perfil do usuário logado (nome e/ou senha)',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        description: 'Novo nome do usuário',
      },
      currentPassword: {
        type: 'string',
        minLength: 6,
        description: 'Senha atual (obrigatório para alterar senha)',
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'Nova senha',
      },
      confirmPassword: {
        type: 'string',
        minLength: 6,
        description: 'Confirmação da nova senha',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Perfil atualizado com sucesso',
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            credits: { type: 'integer' },
            isPremium: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    400: {
      description: 'Erro de validação',
      type: 'object',
      properties: {
        message: { type: 'string' },
        issues: { type: 'object' },
      },
    },
    401: {
      description: 'Senha atual inválida',
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
    404: {
      description: 'Usuário não encontrado',
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
}
