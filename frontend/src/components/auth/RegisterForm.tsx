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
import { registerSchema } from '@/schemas/auth-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { motion } from 'framer-motion'

type RegisterFormInput = z.infer<typeof registerSchema>

const RegisterForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: RegisterFormInput) => {
    console.log('Form submitted successfully:', data)
    reset()
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
                <CardTitle>Bem vindo ao Study Buddy!</CardTitle>
                <CardDescription>
                  Insira seus dados abaixo para criar sua conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Nome</Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        required
                        {...field}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
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
                  <Label htmlFor="password">Senha</Label>
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
                    className="w-full cursor-pointer text-primary-foreground dark:text-foreground"
                  >
                    Criar Conta
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Já possui uma conta?{' '}
                <Link to="/login" className="underline underline-offset-4">
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default RegisterForm
