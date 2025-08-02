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

// Schema para envio multimodal (texto + imagem + PDF chunks)
export const sendMultimodalBodySchema = z.object({
  text: z
    .string()
    .min(1, 'Texto é obrigatório')
    .max(5000, 'Texto não pode ter mais que 5000 caracteres'),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/,
      'Formato de imagem Base64 inválido',
    )
    .optional(),
  pdfTextChunks: z
    .array(
      z.string().max(4000, 'Cada chunk não pode ter mais que 4000 caracteres'),
    )
    .max(50, 'Máximo 50 chunks de PDF')
    .optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
})

export type SendMultimodalBody = z.infer<typeof sendMultimodalBodySchema>

// Schema para resposta da IA
export const aiResponseSchema = z.object({
  response: z.string(),
  model: z.string(),
  timestamp: z.string(),
  inputMessage: z.string(),
})

export type AIResponse = z.infer<typeof aiResponseSchema>

// ===== SCHEMAS PARA RESPOSTAS ESTRUTURADAS =====

// Schema para questão de quiz
export const quizQuestionSchema = z.object({
  pergunta: z.string().min(10, 'Pergunta deve ter pelo menos 10 caracteres'),
  opcoes: z.array(z.string()).min(2).max(5),
  respostaCorreta: z.number().min(0),
  explicacao: z.string().optional(),
})

export type QuizQuestion = z.infer<typeof quizQuestionSchema>

// Schema para resposta de quiz
export const quizResponseSchema = z.object({
  titulo: z.string(),
  descricao: z.string().optional(),
  questoes: z.array(quizQuestionSchema).min(1).max(20),
  modelo: z.string(),
  timestamp: z.string(),
  fonte: z.string(), // indica se veio de imagem, PDF, texto, etc.
})

export type QuizResponse = z.infer<typeof quizResponseSchema>

// Schema para flashcard
export const flashcardSchema = z.object({
  frente: z
    .string()
    .min(5, 'Frente do flashcard deve ter pelo menos 5 caracteres'),
  verso: z
    .string()
    .min(5, 'Verso do flashcard deve ter pelo menos 5 caracteres'),
  categoria: z.string().optional(),
  dificuldade: z.enum(['facil', 'medio', 'dificil']).optional(),
})

export type Flashcard = z.infer<typeof flashcardSchema>

// Schema para resposta de flashcards
export const flashcardsResponseSchema = z.object({
  titulo: z.string(),
  descricao: z.string().optional(),
  flashcards: z.array(flashcardSchema).min(1).max(30),
  modelo: z.string(),
  timestamp: z.string(),
  fonte: z.string(),
})

export type FlashcardsResponse = z.infer<typeof flashcardsResponseSchema>

// Schema para resposta de sumário
export const sumarioResponseSchema = z.object({
  titulo: z.string(),
  resumoExecutivo: z
    .string()
    .min(50, 'Resumo executivo deve ter pelo menos 50 caracteres'),
  topicosChave: z.array(z.string()).min(1).max(10),
  pontosPrincipais: z
    .array(
      z.object({
        topico: z.string(),
        descricao: z.string(),
      }),
    )
    .min(1)
    .max(15),
  conclusao: z.string().optional(),
  modelo: z.string(),
  timestamp: z.string(),
  fonte: z.string(),
})

export type SumarioResponse = z.infer<typeof sumarioResponseSchema>

// ===== SCHEMAS PARA VALIDAÇÃO DE BODY DOS NOVOS ENDPOINTS =====

// Schema para body de geração de quiz
export const generateQuizBodySchema = z.object({
  text: z
    .string()
    .min(1, 'Texto é obrigatório')
    .max(5000, 'Texto não pode ter mais que 5000 caracteres'),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/,
      'Formato de imagem Base64 inválido',
    )
    .optional(),
  pdfTextChunks: z
    .array(
      z.string().max(4000, 'Cada chunk não pode ter mais que 4000 caracteres'),
    )
    .max(50, 'Máximo 50 chunks de PDF')
    .optional(),
  quantidadeQuestoes: z.number().min(1).max(20).optional().default(5),
  temperatura: z.number().min(0).max(2).optional().default(0.3),
})

export type GenerateQuizBody = z.infer<typeof generateQuizBodySchema>

// Schema para body de geração de flashcards
export const generateFlashcardsBodySchema = z.object({
  text: z
    .string()
    .min(1, 'Texto é obrigatório')
    .max(5000, 'Texto não pode ter mais que 5000 caracteres'),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/,
      'Formato de imagem Base64 inválido',
    )
    .optional(),
  pdfTextChunks: z
    .array(
      z.string().max(4000, 'Cada chunk não pode ter mais que 4000 caracteres'),
    )
    .max(50, 'Máximo 50 chunks de PDF')
    .optional(),
  quantidadeFlashcards: z.number().min(1).max(30).optional().default(10),
  temperatura: z.number().min(0).max(2).optional().default(0.3),
})

export type GenerateFlashcardsBody = z.infer<
  typeof generateFlashcardsBodySchema
>

// Schema para body de geração de sumário
export const generateSumarioBodySchema = z.object({
  text: z
    .string()
    .min(1, 'Texto é obrigatório')
    .max(5000, 'Texto não pode ter mais que 5000 caracteres'),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/,
      'Formato de imagem Base64 inválido',
    )
    .optional(),
  pdfTextChunks: z
    .array(
      z.string().max(4000, 'Cada chunk não pode ter mais que 4000 caracteres'),
    )
    .max(50, 'Máximo 50 chunks de PDF')
    .optional(),
  detalhamento: z
    .enum(['basico', 'intermediario', 'detalhado'])
    .optional()
    .default('intermediario'),
  temperatura: z.number().min(0).max(2).optional().default(0.3),
})

export type GenerateSumarioBody = z.infer<typeof generateSumarioBodySchema>

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

// Schema Swagger para envio multimodal
export const sendMultimodalSchemaSwagger = {
  tags: ['AI'],
  description: 'Enviar conteúdo multimodal (texto + imagem + PDF) para a IA',
  body: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Texto da mensagem para a IA',
        minLength: 1,
        maxLength: 5000,
      },
      image: {
        type: 'string',
        description: 'Imagem em formato Base64 (data:image/type;base64,...)',
        pattern: '^data:image/(png|jpeg|jpg|gif|webp);base64,',
      },
      pdfTextChunks: {
        type: 'array',
        description: 'Chunks de texto extraído de PDF',
        maxItems: 50,
        items: {
          type: 'string',
          maxLength: 4000,
        },
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
    required: ['text'],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Resposta da IA para conteúdo multimodal',
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
          description: 'Texto original enviado',
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

// ===== SCHEMAS SWAGGER PARA RESPOSTAS ESTRUTURADAS =====

// Schema Swagger para geração de quiz
export const generateQuizSchemaSwagger = {
  tags: ['AI - Estudos'],
  description: 'Gerar quiz estruturado baseado em conteúdo multimodal',
  body: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Texto da mensagem/instrução para gerar o quiz',
        minLength: 1,
        maxLength: 5000,
      },
      image: {
        type: 'string',
        description: 'Imagem em formato Base64 (data:image/type;base64,...)',
        pattern: '^data:image/(png|jpeg|jpg|gif|webp);base64,',
      },
      pdfTextChunks: {
        type: 'array',
        description: 'Chunks de texto extraído de PDF',
        maxItems: 50,
        items: {
          type: 'string',
          maxLength: 4000,
        },
      },
      quantidadeQuestoes: {
        type: 'number',
        description: 'Quantidade de questões a gerar (1-20)',
        minimum: 1,
        maximum: 20,
        default: 5,
      },
      temperatura: {
        type: 'number',
        description: 'Temperatura para controlar a criatividade (0.0 - 2.0)',
        minimum: 0,
        maximum: 2,
        default: 0.3,
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Quiz estruturado gerado pela IA',
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descricao: { type: 'string' },
        questoes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pergunta: { type: 'string' },
              opcoes: { type: 'array', items: { type: 'string' } },
              respostaCorreta: { type: 'number' },
              explicacao: { type: 'string' },
            },
          },
        },
        modelo: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        fonte: { type: 'string' },
      },
    },
  },
}

// Schema Swagger para geração de flashcards
export const generateFlashcardsSchemaSwagger = {
  tags: ['AI - Estudos'],
  description: 'Gerar flashcards estruturados baseado em conteúdo multimodal',
  body: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Texto da mensagem/instrução para gerar flashcards',
        minLength: 1,
        maxLength: 5000,
      },
      image: {
        type: 'string',
        description: 'Imagem em formato Base64 (data:image/type;base64,...)',
        pattern: '^data:image/(png|jpeg|jpg|gif|webp);base64,',
      },
      pdfTextChunks: {
        type: 'array',
        description: 'Chunks de texto extraído de PDF',
        maxItems: 50,
        items: {
          type: 'string',
          maxLength: 4000,
        },
      },
      quantidadeFlashcards: {
        type: 'number',
        description: 'Quantidade de flashcards a gerar (1-30)',
        minimum: 1,
        maximum: 30,
        default: 10,
      },
      temperatura: {
        type: 'number',
        description: 'Temperatura para controlar a criatividade (0.0 - 2.0)',
        minimum: 0,
        maximum: 2,
        default: 0.3,
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Flashcards estruturados gerados pela IA',
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descricao: { type: 'string' },
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              frente: { type: 'string' },
              verso: { type: 'string' },
              categoria: { type: 'string' },
              dificuldade: {
                type: 'string',
                enum: ['facil', 'medio', 'dificil'],
              },
            },
          },
        },
        modelo: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        fonte: { type: 'string' },
      },
    },
  },
}

// Schema Swagger para geração de sumário
export const generateSumarioSchemaSwagger = {
  tags: ['AI - Estudos'],
  description: 'Gerar sumário estruturado baseado em conteúdo multimodal',
  body: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Texto da mensagem/instrução para gerar sumário',
        minLength: 1,
        maxLength: 5000,
      },
      image: {
        type: 'string',
        description: 'Imagem em formato Base64 (data:image/type;base64,...)',
        pattern: '^data:image/(png|jpeg|jpg|gif|webp);base64,',
      },
      pdfTextChunks: {
        type: 'array',
        description: 'Chunks de texto extraído de PDF',
        maxItems: 50,
        items: {
          type: 'string',
          maxLength: 4000,
        },
      },
      detalhamento: {
        type: 'string',
        description: 'Nível de detalhamento do sumário',
        enum: ['basico', 'intermediario', 'detalhado'],
        default: 'intermediario',
      },
      temperatura: {
        type: 'number',
        description: 'Temperatura para controlar a criatividade (0.0 - 2.0)',
        minimum: 0,
        maximum: 2,
        default: 0.3,
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Sumário estruturado gerado pela IA',
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        resumoExecutivo: { type: 'string' },
        topicosChave: { type: 'array', items: { type: 'string' } },
        pontosPrincipais: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              topico: { type: 'string' },
              descricao: { type: 'string' },
            },
          },
        },
        conclusao: { type: 'string' },
        modelo: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        fonte: { type: 'string' },
      },
    },
  },
}
