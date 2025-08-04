import { prisma } from '../lib/prisma'
import { FileType } from '@prisma/client'
import { aiService } from './ai.service'

export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

export class FileNotFoundError extends FileUploadError {
  constructor(fileId: string) {
    super(`Arquivo não encontrado: ${fileId}`, 'FILE_NOT_FOUND')
  }
}

export class UnauthorizedAccessError extends FileUploadError {
  constructor() {
    super('Acesso não autorizado a este arquivo', 'UNAUTHORIZED_ACCESS')
  }
}

export class FileUploadService {
  async createFileUpload(
    userId: string,
    filename: string,
    contentText: string,
    type: 'pdf' | 'docx' | 'txt' | 'raw' | 'image',
  ) {
    const upload = await prisma.fileUpload.create({
      data: {
        userId,
        filename,
        contentText,
        type,
      },
    })
    return upload
  }

  async getFileUploadById(fileId: string, requestingUserId: string) {
    const upload = await prisma.fileUpload.findUnique({ where: { id: fileId } })
    if (!upload) throw new FileNotFoundError(fileId)
    if (upload.userId !== requestingUserId) throw new UnauthorizedAccessError()
    return upload
  }

  // Método público para buscar arquivo por ID (sem verificação de usuário)
  async getFileUploadByIdPublic(fileId: string) {
    const upload = await prisma.fileUpload.findUnique({ where: { id: fileId } })
    if (!upload) throw new FileNotFoundError(fileId)
    return upload
  }

  async listUserUploads(
    userId: string,
    requestingUserId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    if (userId !== requestingUserId) throw new UnauthorizedAccessError()

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.fileUpload.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fileUpload.count({ where: { userId } }),
    ])

    const totalPages = Math.ceil(total / limit)

    return { data, total, page, limit, totalPages }
  }

  async createFileUploadWithStudyMaterial(
    userId: string,
    filename: string,
    contentText: string,
    type: FileType,
  ) {
    console.log('🚀 Iniciando createFileUploadWithStudyMaterial:', {
      userId,
      filename,
      contentTextLength: contentText.length,
      type,
    })

    // Criar o upload primeiro
    const upload = await prisma.fileUpload.create({
      data: {
        userId,
        filename,
        contentText,
        type,
      },
    })

    console.log('✅ Upload criado:', upload.id)

    try {
      console.log('🤖 Iniciando geração de materiais com IA...')

      // Gerar os materiais de estudo usando a IA
      const [summaryResponse, quizResponse, flashcardsResponse] =
        await Promise.all([
          aiService.generateSumario({
            text: contentText,
            detalhamento: 'intermediario',
            temperatura: 0.7,
          }),
          aiService.generateQuiz({
            text: contentText,
            quantidadeQuestoes: 5,
            temperatura: 0.7,
          }),
          aiService.generateFlashcards({
            text: contentText,
            quantidadeFlashcards: 5,
            temperatura: 0.7,
          }),
        ])

      console.log('✅ Materiais de IA gerados:', {
        summaryKeys: Object.keys(summaryResponse || {}),
        quizKeys: Object.keys(quizResponse || {}),
        flashcardsKeys: Object.keys(flashcardsResponse || {}),
      })

      // Criar o StudyMaterial com todos os dados
      const studyMaterial = await prisma.studyMaterial.create({
        data: {
          uploadId: upload.id,
          userId,
          summary: JSON.stringify(summaryResponse),
          quizJson: quizResponse,
          flashcardsJson: flashcardsResponse,
          language: 'pt-br',
          mode: 'summary',
        },
      })

      console.log('✅ StudyMaterial criado:', studyMaterial.id)

      return {
        upload,
        studyMaterial,
        content: {
          summary: summaryResponse,
          quiz: quizResponse,
          flashcards: flashcardsResponse,
        },
      }
    } catch (error) {
      console.error('❌ Erro na geração do material:', error)
      // Se der erro na geração do material, deletar o upload
      await prisma.fileUpload.delete({ where: { id: upload.id } })
      throw new FileUploadError(
        'Erro ao gerar material de estudo: ' +
          (error instanceof Error ? error.message : 'Erro desconhecido'),
        'STUDY_MATERIAL_GENERATION_ERROR',
      )
    }
  }
}

export const fileUploadService = new FileUploadService()
