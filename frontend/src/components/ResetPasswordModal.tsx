import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Lock } from 'lucide-react'
import { accountService } from '@/services/accountService'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/schemas/accountPageSchema'

export function ResetPasswordModal() {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // Verificar se o token existe
      const token = localStorage.getItem('token')
      if (!token) {
        alert(
          'Sessão expiada. Você será redirecionado para fazer login novamente.',
        )
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }

      await accountService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      alert('Senha atualizada com sucesso!')
      setOpen(false)
      reset()
    } catch {
      reset()
      alert('Erro ao atualizar senha. Verifique sua senha atual.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Lock className="h-4 w-4 text-primary-foreground dark:text-foreground" />
          <span className="text-primary-foreground dark:text-foreground">
            Redefinir senha
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription>
            Digite sua senha atual e a nova senha desejada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              placeholder="Digite sua senha atual"
              className={errors.currentPassword ? 'border-red-500' : ''}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="Digite a nova senha"
              className={errors.newPassword ? 'border-red-500' : ''}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirme a nova senha"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground dark:text-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
