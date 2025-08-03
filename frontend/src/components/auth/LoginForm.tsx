import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema } from '@/schemas/auth-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link } from 'react-router-dom'

type LoginFormInput = z.infer<typeof loginSchema>

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormInput) => {
    console.log('Form submitted successfully:', data)
    reset()
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Faça login na sua conta</CardTitle>
          <CardDescription>
            Insira seu email abaixo para fazer login na sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      required
                      {...field}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input id="password" type="password" required {...field} />
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full cursor-pointer">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta ainda?{' '}
              <Link to="/register" className="underline underline-offset-4">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
