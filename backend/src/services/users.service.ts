import {
  userRepository,
  type UserWithoutPassword,
  type UserCreateData,
} from '../repositories/user.repository'
import type { CreateUser, LoginUser, UpdateUser } from '../schemas/user.schema'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../env'

// ===== CLASSES DE ERRO =====

export class UserError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'UserError'
  }
}

export class UserAlreadyExistsError extends UserError {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe`, 'USER_ALREADY_EXISTS')
  }
}

export class UserNotFoundError extends UserError {
  constructor(identifier?: string) {
    super(
      identifier
        ? `Usuário ${identifier} não encontrado`
        : 'Usuário não encontrado',
      'USER_NOT_FOUND',
    )
  }
}

export class InvalidCredentialsError extends UserError {
  constructor() {
    super('Email ou senha inválidos', 'INVALID_CREDENTIALS')
  }
}

export class UnauthorizedError extends UserError {
  constructor() {
    super('Acesso não autorizado', 'UNAUTHORIZED')
  }
}

// ===== INTERFACES =====

export interface AuthResponse {
  token: string
  user: UserWithoutPassword
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

// ===== SERVICE =====

export class UsersService {
  // ===== AUTENTICAÇÃO =====

  /**
   * Registra um novo usuário
   */
  async register(data: RegisterRequest): Promise<UserWithoutPassword> {
    // Verificar se o email já está em uso
    const emailExists = await userRepository.emailExists(data.email)
    if (emailExists) {
      throw new UserAlreadyExistsError(data.email)
    }

    // Criar o usuário
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    })

    return user
  }

  /**
   * Faz login do usuário
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Buscar usuário por email (incluindo password hash)
    const user = await userRepository.findByEmail(data.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    )
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    // Gerar JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    // Remover passwordHash do retorno
    const { passwordHash, ...userWithoutPassword } = user

    return {
      token,
      user: userWithoutPassword,
    }
  }

  // ===== OPERAÇÕES DO USUÁRIO =====

  /**
   * Busca um usuário por ID
   */
  async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new UserNotFoundError(id)
    }
    return user
  }

  /**
   * Atualiza dados de um usuário
   */
  async updateUser(id: string, data: UpdateUser): Promise<UserWithoutPassword> {
    // Verificar se o usuário existe
    const userExists = await userRepository.exists(id)
    if (!userExists) {
      throw new UserNotFoundError(id)
    }

    // Se está tentando atualizar o email, verificar se não está em uso
    if (data.email) {
      const emailInUse = await userRepository.findByEmailWithoutPassword(
        data.email,
      )
      if (emailInUse && emailInUse.id !== id) {
        throw new UserAlreadyExistsError(data.email)
      }
    }

    const updatedUser = await userRepository.update(id, data)
    return updatedUser
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(id: string): Promise<void> {
    // Verificar se o usuário existe
    const userExists = await userRepository.exists(id)
    if (!userExists) {
      throw new UserNotFoundError(id)
    }

    const success = await userRepository.delete(id)
    if (!success) {
      throw new Error('Erro ao deletar usuário')
    }
  }

  // ===== OPERAÇÕES DE CRÉDITOS =====

  /**
   * Atualiza os créditos de um usuário
   */
  async updateCredits(
    id: string,
    credits: number,
  ): Promise<UserWithoutPassword> {
    // Verificar se o usuário existe
    const userExists = await userRepository.exists(id)
    if (!userExists) {
      throw new UserNotFoundError(id)
    }

    return await userRepository.updateCredits(id, credits)
  }

  /**
   * Adiciona créditos a um usuário
   */
  async addCredits(id: string, amount: number): Promise<UserWithoutPassword> {
    // Verificar se o usuário existe
    const userExists = await userRepository.exists(id)
    if (!userExists) {
      throw new UserNotFoundError(id)
    }

    return await userRepository.incrementCredits(id, amount)
  }

  /**
   * Remove créditos de um usuário
   */
  async removeCredits(
    id: string,
    amount: number,
  ): Promise<UserWithoutPassword> {
    // Verificar se o usuário existe
    const user = await userRepository.findById(id)
    if (!user) {
      throw new UserNotFoundError(id)
    }

    // Verificar se tem créditos suficientes
    if (user.credits < amount) {
      throw new Error(
        `Usuário possui apenas ${user.credits} créditos, mas tentou remover ${amount}`,
      )
    }

    return await userRepository.decrementCredits(id, amount)
  }

  // ===== UTILITÁRIOS =====

  /**
   * Verifica se um usuário existe
   */
  async userExists(id: string): Promise<boolean> {
    return await userRepository.exists(id)
  }

  /**
   * Verifica se um email está disponível
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    return !(await userRepository.emailExists(email))
  }
}

// Instância única do service (singleton)
export const usersService = new UsersService()
