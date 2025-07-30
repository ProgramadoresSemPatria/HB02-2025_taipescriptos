import { hash } from 'bcryptjs'
import { UsersRepository } from '../repositories/users-repository'

export interface SignUpUseCaseRequest {
  name: string
  email: string
  password: string
}

export class SignUpUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: SignUpUseCaseRequest): Promise<void> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email)

    if (userAlreadyExists) {
      throw new Error('User with this email already exists.')
    }

    const hashedPassword = await hash(password, 6)

    await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    })
  }
}
