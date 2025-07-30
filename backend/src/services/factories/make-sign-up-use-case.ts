import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { SignUpUseCase } from '../sign-up'

export async function makeSignUpUseCase() {
  const prismaRepository = new PrismaUsersRepository()
  const signUpUseCase = new SignUpUseCase(prismaRepository)

  return signUpUseCase
}
