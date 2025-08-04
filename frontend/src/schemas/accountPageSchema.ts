import * as z from 'zod'

// Schema para atualizar nome
export const updateNameSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(25, 'Nome deve ter no máximo 25 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
})

// Schema para redefinir senha
export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

// Schema para deletar conta
export const deleteAccountSchema = z
  .object({
    confirmation: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.confirmation === 'DELETAR CONTA', {
    message: 'Digite exatamente "DELETAR CONTA" para confirmar',
    path: ['confirmation'],
  })

// Tipos TypeScript derivados dos schemas
export type UpdateNameFormData = z.infer<typeof updateNameSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>
