import { User } from '@prisma/client'
import { SignUpUseCaseRequest } from '../services/sign-up'

export interface UsersRepository {
  create(data: SignUpUseCaseRequest): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(userId: string): Promise<User | null>
}
