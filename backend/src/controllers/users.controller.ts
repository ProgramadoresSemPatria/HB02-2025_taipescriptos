import { FastifyRequest, FastifyReply } from 'fastify'
import {
  usersService,
  UserAlreadyExistsError,
  UserNotFoundError,
  InvalidCredentialsError,
  UnauthorizedError,
} from '../services/users.service'
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  editProfileSchema,
} from '../schemas/user.schema'

// ===== INTERFACES DE REQUEST =====

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string
  userRole?: 'USER' | 'ADMIN'
}

interface RegisterRequest extends FastifyRequest {
  Body: {
    name: string
    email: string
    password: string
  }
}

interface LoginRequest extends FastifyRequest {
  Body: {
    email: string
    password: string
  }
}

interface GetUserRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
}

interface UpdateUserRequest extends AuthenticatedRequest {
  Params: {
    id: string
  }
  Body: {
    name?: string
    email?: string
    credits?: number
    isPremium?: boolean
    role?: 'USER' | 'ADMIN'
  }
}

interface EditProfileRequest extends AuthenticatedRequest {
  Body: {
    name?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}

// ===== CONTROLLER =====

export class UsersController {
  // ===== HEALTH CHECK =====

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({
      status: 'ok',
      message: 'Users service is running',
      timestamp: new Date().toISOString(),
    })
  }

  // ===== AUTENTICAÇÃO =====

  async register(request: RegisterRequest, reply: FastifyReply) {
    try {
      // Validação dos dados
      const { name, email, password } = createUserSchema.parse(request.body)

      // Registrar usuário e gerar token
      const authResponse = await usersService.registerWithToken({
        name,
        email,
        password,
      })

      return reply.code(201).send({
        message: 'Usuário registrado com sucesso',
        token: authResponse.token,
        user: authResponse.user,
      })
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return reply.code(409).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro no registro:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  async login(request: LoginRequest, reply: FastifyReply) {
    try {
      // Validação dos dados
      const { email, password } = loginUserSchema.parse(request.body)

      // Fazer login
      const authResponse = await usersService.login({ email, password })

      return reply.code(200).send({
        message: 'Login realizado com sucesso',
        ...authResponse,
      })
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return reply.code(401).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro no login:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  // ===== OPERAÇÕES DO USUÁRIO =====

  async getUserById(request: GetUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const requestingUserId = request.userId
      const userRole = request.userRole

      // Verificar se o usuário está tentando acessar seus próprios dados
      // ou se é um admin
      if (requestingUserId !== id && userRole !== 'ADMIN') {
        throw new UnauthorizedError()
      }

      const user = await usersService.getUserById(id)

      return reply.code(200).send({
        user,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(403).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao buscar usuário:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  async getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.userId
      if (!userId) {
        throw new UnauthorizedError()
      }

      const user = await usersService.getUserById(userId)

      return reply.code(200).send({
        user,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(401).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao buscar perfil:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  async editProfile(request: EditProfileRequest, reply: FastifyReply) {
    try {
      const userId = request.userId
      if (!userId) {
        throw new UnauthorizedError()
      }

      // Validação dos dados
      const editData = editProfileSchema.parse(request.body)

      // Editar perfil
      const user = await usersService.editProfile(userId, editData)

      return reply.code(200).send({
        message: 'Perfil atualizado com sucesso',
        user,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof InvalidCredentialsError) {
        return reply.code(401).send({
          message: 'Senha atual inválida',
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(401).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao editar perfil:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  async updateUser(request: UpdateUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const requestingUserId = request.userId
      const userRole = request.userRole

      // Verificar se o usuário está tentando atualizar seus próprios dados
      // ou se é um admin
      if (requestingUserId !== id && userRole !== 'ADMIN') {
        throw new UnauthorizedError()
      }

      // Validação dos dados
      const updateData = updateUserSchema.parse(request.body)

      const user = await usersService.updateUser(id, updateData)

      return reply.code(200).send({
        message: 'Usuário atualizado com sucesso',
        user,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UserAlreadyExistsError) {
        return reply.code(409).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(403).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao atualizar usuário:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  async deleteUser(request: GetUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const requestingUserId = request.userId
      const userRole = request.userRole

      // Verificar se o usuário está tentando deletar sua própria conta
      // ou se é um admin
      if (requestingUserId !== id && userRole !== 'ADMIN') {
        throw new UnauthorizedError()
      }

      await usersService.deleteUser(id)

      return reply.code(200).send({
        message: 'Usuário deletado com sucesso',
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(403).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao deletar usuário:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }

  // ===== OPERAÇÕES ADMINISTRATIVAS =====

  async promoteUserToAdmin(request: GetUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const requestingUserRole = request.userRole

      // Verificar se o usuário que está fazendo a requisição é admin
      if (requestingUserRole !== 'ADMIN') {
        throw new UnauthorizedError()
      }

      // Promover usuário para admin
      const user = await usersService.updateUser(id, { role: 'ADMIN' })

      return reply.code(200).send({
        message: 'Usuário promovido a admin com sucesso',
        user,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof UnauthorizedError) {
        return reply.code(403).send({
          message: error.message,
          code: error.code,
        })
      }

      console.error('Erro ao promover usuário:', error)
      return reply.code(500).send({
        message: 'Erro interno do servidor',
      })
    }
  }
}

// Instância global do controller
export const usersController = new UsersController()
