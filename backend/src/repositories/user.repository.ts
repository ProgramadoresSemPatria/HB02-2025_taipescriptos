import { prisma } from '../lib/prisma'
import type { CreateUser, UpdateUser } from '../schemas/user.schema'
import bcrypt from 'bcryptjs'

export interface UserWithoutPassword {
  id: string
  name: string
  email: string
  credits: number
  isPremium: boolean
  createdAt: Date
}

export interface UserCreateData {
  name: string
  email: string
  password: string
}

export class UserRepository {
  // ===== CRUD BÁSICO =====

  /**
   * Busca um usuário por ID (sem retornar password)
   */
  async findById(id: string): Promise<UserWithoutPassword | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Busca um usuário por email (incluindo password para autenticação)
   */
  async findByEmail(
    email: string,
  ): Promise<(UserWithoutPassword & { passwordHash: string }) | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
        passwordHash: true,
      },
    })
  }

  /**
   * Busca um usuário por email (sem password)
   */
  async findByEmailWithoutPassword(
    email: string,
  ): Promise<UserWithoutPassword | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Cria um novo usuário
   */
  async create(data: CreateUser): Promise<UserWithoutPassword> {
    // Hash da senha
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(data.password, saltRounds)

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: UpdateUser): Promise<UserWithoutPassword> {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Deleta um usuário
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Verifica se um email já está em uso
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return !!user
  }

  /**
   * Verifica se um usuário existe por ID
   */
  async exists(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })
    return !!user
  }

  /**
   * Atualiza os créditos de um usuário
   */
  async updateCredits(
    id: string,
    credits: number,
  ): Promise<UserWithoutPassword> {
    return await prisma.user.update({
      where: { id },
      data: { credits },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Incrementa os créditos de um usuário
   */
  async incrementCredits(
    id: string,
    amount: number,
  ): Promise<UserWithoutPassword> {
    return await prisma.user.update({
      where: { id },
      data: {
        credits: {
          increment: amount,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }

  /**
   * Decrementa os créditos de um usuário
   */
  async decrementCredits(
    id: string,
    amount: number,
  ): Promise<UserWithoutPassword> {
    return await prisma.user.update({
      where: { id },
      data: {
        credits: {
          decrement: amount,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        isPremium: true,
        createdAt: true,
      },
    })
  }
}

// Instância única do repository (singleton)
export const userRepository = new UserRepository()
