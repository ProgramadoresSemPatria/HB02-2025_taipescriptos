import React, { useState } from 'react'
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
import { Link, useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

type LoginFormInput = z.infer<typeof loginSchema>

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const onSubmit = async (data: LoginFormInput) => {
    try {
      setIsLoading(true)
      setError(null)

      await login(data)

      // Redireciona para a página principal após login bem-sucedido
      navigate('/')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-start gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                  <Brain className="h-6 w-6 text-primary-foreground dark:text-foreground" />
                </div>
                <span className="text-xl font-bold text-primary dark:text-primary-glow">
                  Study Buddy
                </span>
              </div>
              <div className="flex flex-col">
                <CardTitle>Bem vindo de volta!</CardTitle>
                <CardDescription>
                  Insira seu email e senha abaixo para fazer login na sua conta
                </CardDescription>
              </div>
            </div>
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
                  </div>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                    )}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full cursor-pointer text-primary-foreground dark:text-foreground"
                  >
                    {isLoading ? 'Fazendo login...' : 'Login'}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Não tem uma conta ainda?{' '}
                <Link to="/register" className="underline underline-offset-4">
                  Cadastre-se
                </Link>
                {error && (
                  <div className="text-sm text-red-500 text-center">
                    {error}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default LoginForm
