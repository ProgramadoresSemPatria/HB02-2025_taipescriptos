import { FastifyRequest, FastifyReply } from 'fastify'
import {
  fileUploadService,
  FileNotFoundError,
  UnauthorizedAccessError,
} from '../services/fileUpload.service'
import {
  fileUploadParamsSchema,
  createFileUploadBodySchema,
} from '../schemas/fileUpload.schema'
import pdfParse from 'pdf-parse'

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
  userRole?: 'USER' | 'ADMIN'
}

interface CreateFileUploadRequest extends AuthenticatedRequest {
  Body: {
    filename: string
    contentText: string
    type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
  }
}

interface CreateFileUploadWithStudyMaterialRequest
  extends AuthenticatedRequest {
  Body: {
    filename: string
    contentText: string
    type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'
    generateStudyMaterial?: boolean
  }
}

interface GetFileUploadByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

interface ListUserUploadsRequest extends AuthenticatedRequest {
  Querystring: {
    userId?: string
    page?: number
    limit?: number
  }
}

export class FileUploadController {
  async createFileUpload(
    request: CreateFileUploadRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const validated = createFileUploadBodySchema.parse(request.body)

      const upload = await fileUploadService.createFileUpload(
        request.userId,
        validated.filename,
        validated.contentText,
        validated.type,
      )

      return reply.status(201).send({
        success: true,
        message: 'Upload criado com sucesso',
        data: upload,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createFileUploadWithStudyMaterial(
    request: CreateFileUploadWithStudyMaterialRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const validated = createFileUploadBodySchema.parse(request.body)

      const result = await fileUploadService.createFileUploadWithStudyMaterial(
        request.userId,
        validated.filename,
        validated.contentText,
        validated.type,
      )

      return reply.status(201).send({
        success: true,
        message: 'Upload e material de estudo criados com sucesso',
        data: result,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async getFileUploadById(
    request: GetFileUploadByIdRequest,
    reply: FastifyReply,
  ) {
    try {
      const { id } = fileUploadParamsSchema.parse(request.params)

      // Como esta é uma rota pública, usa o método público do serviço
      const upload = await fileUploadService.getFileUploadByIdPublic(id)

      return reply.status(200).send({
        success: true,
        data: upload,
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listUserUploads(request: ListUserUploadsRequest, reply: FastifyReply) {
    try {
      if (!request.userId)
        return reply.status(401).send({
          success: false,
          message: 'Token de autenticação necessário',
          code: 'AUTHENTICATION_REQUIRED',
        })

      const query = request.query as ListUserUploadsRequest['Querystring']

      const userId = query.userId || request.userId
      if (userId !== request.userId)
        return reply.status(403).send({
          success: false,
          message: 'Não autorizado a listagem de uploads de outro usuário',
          code: 'UNAUTHORIZED_ACCESS',
        })

      const page = query.page || 1
      const limit = query.limit || 20

      const result = await fileUploadService.listUserUploads(
        userId,
        request.userId,
        page,
        limit,
      )

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createFileUploadWithFile(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ) {
    try {
      console.log('📁 Processando upload de arquivo...')

      // Processar multipart data
      const data = await request.file()
      console.log(
        '📄 Dados do arquivo:',
        data ? 'arquivo encontrado' : 'nenhum arquivo',
      )

      if (!data) {
        return reply.status(400).send({
          success: false,
          message: 'Nenhum arquivo foi enviado',
          code: 'NO_FILE_PROVIDED',
        })
      }

      const buffer = await data.toBuffer()
      
      // Tratar diferentes tipos de arquivo adequadamente
      let contentText: string
      let pdfTextChunks: string[] | undefined
      
      if (data.mimetype.includes('image')) {
        // Para imagens, usamos base64 para armazenar os dados
        contentText = buffer.toString('base64')
      } else if (data.mimetype.includes('pdf')) {
        // Para PDFs, extraímos o texto usando pdf-parse
        try {
          const pdfData = await pdfParse(buffer)
          contentText = pdfData.text
          
          // Se o texto for muito longo, dividir em chunks para a IA
          if (contentText.length > 3500) {
            pdfTextChunks = this.chunkText(contentText, 3500, 50)
          }
        } catch (pdfError) {
          console.error('Erro ao extrair texto do PDF:', pdfError)
          return reply.status(400).send({
            success: false,
            message: 'Erro ao processar o arquivo PDF. Verifique se o arquivo não está corrompido.',
            code: 'PDF_EXTRACTION_ERROR',
          })
        }
      } else {
        // Para outros tipos de arquivo, tentamos UTF-8
        contentText = buffer.toString('utf-8')
      }

      if (!request.userId) {
        return reply.status(401).send({
          success: false,
          message: 'Usuário não autenticado',
          code: 'UNAUTHENTICATED',
        })
      }

      const result = await fileUploadService.createFileUploadWithStudyMaterial(
        request.userId,
        data.filename,
        contentText,
        this.getFileTypeFromMimetype(data.mimetype),
        data.mimetype, // Passar o mimetype para tratamento correto de imagens
        pdfTextChunks, // Passar os chunks do PDF se disponíveis
      )

      return reply.status(201).send({
        success: true,
        message: 'Upload realizado e material de estudo gerado com sucesso',
        data: result,
      })
    } catch (error: unknown) {
      console.error('Erro no createFileUploadWithFile:', error)
      
      // Tratamento específico para erro de arquivo muito grande
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
          return reply.status(413).send({
            success: false,
            message: 'Arquivo muito grande. O tamanho máximo permitido é 10MB.',
            code: 'FILE_TOO_LARGE',
          })
        }
      }
      
      // Tratamento específico para erro de encoding UTF-8
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message)
        if (errorMessage.includes('invalid byte sequence for encoding "UTF8"')) {
          return reply.status(400).send({
            success: false,
            message: 'Formato de arquivo não suportado. Tente um arquivo de texto, PDF ou imagem válida.',
            code: 'INVALID_FILE_FORMAT',
          })
        }
        
        // Tratamento específico para erros de validação da IA
        if (errorMessage.includes('too_small') || errorMessage.includes('ZodError')) {
          return reply.status(422).send({
            success: false,
            message: 'Erro na geração de materiais de estudo. Tente novamente.',
            code: 'AI_VALIDATION_ERROR',
          })
        }
      }
      
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  }

  private getFileTypeFromMimetype(
    mimetype: string,
  ): 'pdf' | 'docx' | 'txt' | 'raw' | 'image' {
    if (mimetype.includes('pdf')) return 'pdf'
    if (mimetype.includes('word') || mimetype.includes('document'))
      return 'docx'
    if (mimetype.includes('text')) return 'txt'
    if (mimetype.includes('image')) return 'image'
    return 'raw'
  }

  private chunkText(text: string, maxChunkSize: number, maxChunks: number): string[] {
    const chunks: string[] = []
    let currentChunk = ''
    
    // Dividir por parágrafos primeiro
    const paragraphs = text.split(/\n\s*\n/)
    
    for (const paragraph of paragraphs) {
      if (chunks.length >= maxChunks) break
      
      if (currentChunk.length + paragraph.length <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = ''
        }
        
        // Se o parágrafo individual for muito longo, dividir por frases
        if (paragraph.length > maxChunkSize) {
          const sentences = paragraph.split(/[.!?]+/)
          for (const sentence of sentences) {
            if (chunks.length >= maxChunks) break
            if (currentChunk.length + sentence.length <= maxChunkSize) {
              currentChunk += (currentChunk ? ' ' : '') + sentence
            } else {
              if (currentChunk) {
                chunks.push(currentChunk.trim())
                currentChunk = sentence
              } else {
                // Se uma única frase for muito longa, truncar
                chunks.push(sentence.substring(0, maxChunkSize).trim())
              }
            }
          }
        } else {
          currentChunk = paragraph
        }
      }
    }
    
    if (currentChunk && chunks.length < maxChunks) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  private handleError(error: unknown, reply: FastifyReply) {
    console.error('[FileUploadController] Error:', error)

    if (error instanceof FileNotFoundError)
      return reply.status(404).send({
        success: false,
        message: error.message,
        code: error.code,
      })

    if (error instanceof UnauthorizedAccessError)
      return reply.status(403).send({
        success: false,
        message: error.message,
        code: error.code,
      })

    return reply.status(500).send({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    })
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: 'FileUpload module is healthy',
      timestamp: new Date().toISOString(),
    })
  }
}

export const fileUploadController = new FileUploadController()
