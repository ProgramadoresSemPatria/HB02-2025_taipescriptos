import { z } from 'zod'

// Schema Zod para validação dos parâmetros de rota (runtime)
export const fileUploadParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido'),
})

// Schema Zod para validação do body na criação (exemplo simples)
export const createFileUploadBodySchema = z.object({
  filename: z.string().min(1, 'filename é obrigatório'),
  contentText: z.string().min(1, 'contentText é obrigatório'),
  type: z.enum(['pdf', 'docx', 'txt', 'raw', 'image']),
})

// ==== SCHEMAS PARA SWAGGER ====

// Schema para criação de upload
export const createFileUploadSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Realizar upload de um arquivo de estudo',
  security: [{ bearerAuth: [] }],
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
        enum: ['pdf', 'docx', 'txt', 'raw', 'image'],
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
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            filename: { type: 'string' },
            contentText: { type: 'string' },
            type: { type: 'string', enum: ['pdf', 'docx', 'txt', 'raw', 'image'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
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
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            filename: { type: 'string' },
            contentText: { type: 'string' },
            type: { type: 'string', enum: ['pdf', 'docx', 'txt', 'raw', 'image'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
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
  security: [{ bearerAuth: [] }],
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
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              filename: { type: 'string' },
              contentText: { type: 'string' },
              type: { type: 'string', enum: ['pdf', 'docx', 'txt', 'raw', 'image'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
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

// Schema para criação de upload com material de estudo
export const createFileUploadWithStudyMaterialSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Criar upload e gerar automaticamente resumo, quiz e flashcards',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      filename: { type: 'string' },
      contentText: { type: 'string' },
      type: {
        type: 'string',
        enum: ['pdf', 'docx', 'txt', 'raw', 'image'],
      },
    },
    required: ['filename', 'contentText', 'type'],
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            upload: { type: 'object' },
            studyMaterial: { type: 'object' },
            content: {
              type: 'object',
              properties: {
                summary: { type: 'object' },
                quiz: { type: 'object' },
                flashcards: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
}

// Schema para upload de arquivo multipart
export const createFileUploadWithFileSchemaSwagger = {
  tags: ['FileUpload'],
  description: 'Upload de arquivo com geração automática de material de estudo',
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            upload: { type: 'object' },
            studyMaterial: { type: 'object' },
            content: {
              type: 'object',
              properties: {
                summary: { type: 'object' },
                quiz: { type: 'object' },
                flashcards: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
}
