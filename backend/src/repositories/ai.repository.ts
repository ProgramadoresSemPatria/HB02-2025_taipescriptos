import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export interface CreateStudyMaterialData {
  userId: string
  summary: string
  quizJson: Prisma.InputJsonValue
  flashcardsJson: Prisma.InputJsonValue
  language: string
  mode: 'summary' | 'quiz' | 'flashcard' | 'review'
}

export interface StudyMaterialWithUser {
  id: string
  userId: string
  summary: string
  quizJson: Prisma.JsonValue
  flashcardsJson: Prisma.JsonValue
  language: string
  mode: 'summary' | 'quiz' | 'flashcard' | 'review'
  createdAt: Date
  user?: {
    id: string
    name: string
    email: string
    credits: number
    isPremium: boolean
  }
}

export class AIRepository {
  /**
   * Cria e salva um novo StudyMaterial
   */
  async create(data: CreateStudyMaterialData): Promise<StudyMaterialWithUser> {
    try {
      const result = await prisma.studyMaterial.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
              isPremium: true,
            },
          },
        },
      })
      return result
    } catch (err) {
      console.error('[AIRepository.create] Erro ao salvar no banco:', err)
      throw err
    }
  }

  /**
   * Busca um StudyMaterial por ID
   */
  async findById(id: string): Promise<StudyMaterialWithUser | null> {
    return await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            credits: true,
            isPremium: true,
          },
        },
      },
    })
  }

  /**
   * Lista materiais de estudo de um usuário
   */
  async findByUserId(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    data: StudyMaterialWithUser[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const page = options.page ?? 1
    const limit = options.limit ?? 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.studyMaterial.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
              isPremium: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyMaterial.count({ where: { userId } }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}

export const aiRepository = new AIRepository()
