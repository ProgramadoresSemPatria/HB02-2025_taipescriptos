import { z } from 'zod'

// Schema para envio de mensagem para IA
export const sendMessageBodySchema = z.object({
  message: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(2000, 'Mensagem não pode ter mais que 2000 caracteres'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
})

export type SendMessageBody = z.infer<typeof sendMessageBodySchema>

// Schema para resposta da IA
export const aiResponseSchema = z.object({
  response: z.string(),
  model: z.string(),
  timestamp: z.string(),
  inputMessage: z.string(),
})

export type AIResponse = z.infer<typeof aiResponseSchema>

// Schema Swagger para envio de mensagem
export const sendMessageSchemaSwagger = {
  tags: ['AI'],
  description: 'Enviar mensagem para a IA Google Gemma',
  body: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Mensagem a ser enviada para a IA',
        minLength: 1,
        maxLength: 2000,
      },
      temperature: {
        type: 'number',
        description:
          'Temperatura para controlar a criatividade da resposta (0.0 - 2.0)',
        minimum: 0,
        maximum: 2,
        default: 0.7,
      },
    },
    required: ['message'],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Resposta da IA',
      type: 'object',
      properties: {
        response: {
          type: 'string',
          description: 'Resposta gerada pela IA',
        },
        model: {
          type: 'string',
          description: 'Modelo de IA utilizado',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp da resposta',
        },
        inputMessage: {
          type: 'string',
          description: 'Mensagem original enviada',
        },
      },
    },
    400: {
      description: 'Dados inválidos',
      type: 'object',
      properties: {
        message: { type: 'string' },
        issues: { type: 'object' },
      },
    },
    500: {
      description: 'Erro interno do servidor',
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
}

// Schema para status da IA
export const aiStatusSchemaSwagger = {
  tags: ['AI'],
  description: 'Verificar status da conexão com a IA',
  response: {
    200: {
      description: 'Status da IA',
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['connected', 'disconnected'],
          description: 'Status da conexão com a IA',
        },
        model: {
          type: 'string',
          description: 'Modelo disponível',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp da verificação',
        },
      },
    },
  },
}
