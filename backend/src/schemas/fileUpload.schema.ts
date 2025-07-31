import { z } from 'zod'

// Schema Zod para validação dos parâmetros de rota (runtime)
export const fileUploadParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// Schema Zod para validação do body na criação (exemplo simples)
export const createFileUploadBodySchema = z.object({
  filename: z.string().min(1, 'filename é obrigatório'),
  contentText: z.string().min(1, 'contentText é obrigatório'),
  type: z.enum(['pdf', 'docx', 'txt', 'raw']),
})

// ==== SCHEMAS PARA SWAGGER ====

// Schema de objeto FileUpload para documentação Swagger/OpenAPI
export const fileUploadSchemaSwagger = {
  type: 'object',
  description: 'Representação de um upload de arquivo',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    filename: { type: 'string' },
    contentText: { type: 'string' },
    type: { type: 'string', enum: ['pdf', 'docx', 'txt', 'raw'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'userId', 'filename', 'contentText', 'type', 'createdAt'],
}

export const fileUploadDefinitionSwagger = {
  FileUpload: fileUploadSchemaSwagger,
}

export const createFileUploadSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Realizar upload de um arquivo de estudo',
  consumes: ['application/json'],
  body: {
    type: 'object',
    required: ['filename', 'contentText', 'type'],
    properties: {
      filename: {
        type: 'string',
        description: 'Nome do arquivo',
      },
      contentText: {
        type: 'string',
        description: 'Conteúdo do arquivo',
      },
      type: {
        type: 'string',
        enum: ['pdf', 'docx', 'txt', 'raw'],
        description: 'Tipo do arquivo',
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { $ref: 'FileUpload#' },
      },
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
}

export const fileUploadParamsSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Buscar informações de um arquivo via ID',
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
        data: { $ref: 'FileUpload#' },
      },
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
}

export const fileUploadListSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Listar uploads do usuário',
  querystring: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { $ref: 'FileUpload#' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  },
}
