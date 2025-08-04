import { prisma } from '../lib/prisma'

export class StudyMaterialError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'StudyMaterialError'
  }
}

export class StudyMaterialNotFoundError extends StudyMaterialError {
  constructor(materialId: string) {
    super(
      `Material de estudo não encontrado: ${materialId}`,
      'STUDY_MATERIAL_NOT_FOUND',
    )
  }
}

export class UnauthorizedAccessError extends StudyMaterialError {
  constructor() {
    super('Acesso não autorizado a este material', 'UNAUTHORIZED_ACCESS')
  }
}

export class StudyMaterialService {
  async listUserStudyMaterials(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.studyMaterial.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          upload: {
            select: {
              id: true,
              filename: true,
              type: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.studyMaterial.count({ where: { userId } }),
    ])

    const totalPages = Math.ceil(total / limit)

    // Transformar os dados para o formato esperado pelo frontend
    const transformedData = data.map((material) => {
      let parsedSummary
      try {
        parsedSummary = JSON.parse(material.summary)
      } catch (error) {
        parsedSummary = this.getDefaultSummary(material.upload?.filename)
      }

      // Se os dados estão vazios, usar fallback
      const finalSummary =
        parsedSummary && Object.keys(parsedSummary).length > 0
          ? parsedSummary
          : this.getDefaultSummary(material.upload?.filename)

      const finalQuiz =
        material.quizJson && Object.keys(material.quizJson).length > 0
          ? material.quizJson
          : this.getDefaultQuiz(material.upload?.filename)

      const finalFlashcards =
        material.flashcardsJson &&
        Object.keys(material.flashcardsJson).length > 0
          ? material.flashcardsJson
          : this.getDefaultFlashcards(material.upload?.filename)

      // Criar um objeto simples e limpo
      const result = {
        id: material.id,
        uploadId: material.uploadId,
        filename: material.upload?.filename || 'Arquivo removido',
        fileType: material.upload?.type || null,
        summary: Object.assign({}, finalSummary),
        quiz: Object.assign({}, finalQuiz),
        flashcards: Object.assign({}, finalFlashcards),
        language: material.language,
        mode: material.mode,
        createdAt: material.createdAt,
        uploadCreatedAt: material.upload?.createdAt || null,
      }

      return result
    })

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages,
    }
  }

  async getStudyMaterialById(materialId: string, requestingUserId: string) {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
      include: {
        upload: {
          select: {
            id: true,
            filename: true,
            type: true,
            contentText: true,
            createdAt: true,
          },
        },
      },
    })

    if (!material) throw new StudyMaterialNotFoundError(materialId)
    if (material.userId !== requestingUserId)
      throw new UnauthorizedAccessError()

    // Parse dados com fallback para dados padrão
    let summary, quiz, flashcards

    try {
      summary = JSON.parse(material.summary)
      if (!summary || Object.keys(summary).length === 0) {
        summary = this.getDefaultSummary(material.upload?.filename)
      }
    } catch {
      summary = this.getDefaultSummary(material.upload?.filename)
    }

    try {
      quiz = material.quizJson
      if (!quiz || Object.keys(quiz).length === 0) {
        quiz = this.getDefaultQuiz(material.upload?.filename)
      }
    } catch {
      quiz = this.getDefaultQuiz(material.upload?.filename)
    }

    try {
      flashcards = material.flashcardsJson
      if (!flashcards || Object.keys(flashcards).length === 0) {
        flashcards = this.getDefaultFlashcards(material.upload?.filename)
      }
    } catch {
      flashcards = this.getDefaultFlashcards(material.upload?.filename)
    }

    return {
      id: material.id,
      uploadId: material.uploadId,
      filename: material.upload?.filename || 'Arquivo removido',
      fileType: material.upload?.type || null,
      contentText: material.upload?.contentText || null,
      summary,
      quiz,
      flashcards,
      language: material.language,
      mode: material.mode,
      createdAt: material.createdAt,
      uploadCreatedAt: material.upload?.createdAt || null,
    }
  }

  async deleteStudyMaterial(materialId: string, requestingUserId: string) {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
    })

    if (!material) throw new StudyMaterialNotFoundError(materialId)
    if (material.userId !== requestingUserId)
      throw new UnauthorizedAccessError()

    await prisma.studyMaterial.delete({
      where: { id: materialId },
    })

    return { success: true, message: 'Material de estudo removido com sucesso' }
  }

  // Métodos para dados padrão quando IA não gerou conteúdo
  private getDefaultSummary(filename?: string) {
    const subject = filename?.split(' ')[0] || 'Conteúdo'
    return {
      titulo: `Resumo: ${subject}`,
      resumoExecutivo:
        'Material de estudo carregado. O conteúdo está sendo processado pela IA.',
      topicosChave: [
        'Conceitos Principais',
        'Pontos Importantes',
        'Aplicações',
      ],
      pontosPrincipais: [
        {
          topico: 'Conteúdo Principal',
          descricao:
            'O material de estudo está sendo analisado. Em breve teremos um resumo completo.',
        },
      ],
      conclusao:
        'Material carregado com sucesso. Processamento da IA em andamento.',
      modelo: 'fallback',
      timestamp: new Date().toISOString(),
      fonte: filename || 'Material de Estudo',
    }
  }

  private getDefaultQuiz(filename?: string) {
    const subject = filename?.split(' ')[0] || 'Conteúdo'
    return {
      titulo: `Quiz: ${subject}`,
      questoes: [
        {
          pergunta: 'O material foi carregado com sucesso?',
          opcoes: ['Sim', 'Não', 'Parcialmente', 'Em processamento'],
          respostaCorreta: 0,
          explicacao:
            'O material foi carregado e está sendo processado pela IA para gerar questões específicas.',
        },
      ],
      modelo: 'fallback',
      timestamp: new Date().toISOString(),
      fonte: filename || 'Material de Estudo',
    }
  }

  private getDefaultFlashcards(filename?: string) {
    const subject = filename?.split(' ')[0] || 'Conteúdo'
    return {
      titulo: `Flashcards: ${subject}`,
      flashcards: [
        {
          frente: 'Status do Material',
          verso:
            'Material carregado com sucesso. A IA está processando o conteúdo para gerar flashcards personalizados.',
          categoria: 'Sistema',
          dificuldade: 'facil',
        },
      ],
      modelo: 'fallback',
      timestamp: new Date().toISOString(),
      fonte: filename || 'Material de Estudo',
    }
  }
}

export const studyMaterialService = new StudyMaterialService()
