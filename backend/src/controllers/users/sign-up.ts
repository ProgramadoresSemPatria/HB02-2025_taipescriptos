import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSignUpUseCase } from '../../services/factories/make-sign-up-use-case'

export async function signUp(request: FastifyRequest, reply: FastifyReply) {
  const signUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { name, email, password } = signUpSchema.parse(request.body)

  try {
    const signUpUseCase = await makeSignUpUseCase()

    await signUpUseCase.execute({ name, email, password })

    reply.status(201).send()
  } catch (error) {
    reply.status(409).send({
      message: 'user with this email already exists',
    })
  }
}
