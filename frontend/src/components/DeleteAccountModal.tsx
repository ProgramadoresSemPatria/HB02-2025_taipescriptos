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
import { accountService } from '@/services/accountService'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, Trash } from 'lucide-react'
import {
  deleteAccountSchema,
  type DeleteAccountFormData,
} from '@/schemas/accountPageSchema'
import { toast } from 'sonner'

export function DeleteAccountModal() {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  })

  const onSubmit = async () => {
    try {
      const userString = localStorage.getItem('user')
      if (!userString) {
        toast.error('Erro: Usuário não encontrado. Faça login novamente.')
        return
      }

      const user = JSON.parse(userString)
      const userId = user.id

      if (!userId) {
        toast.error('Erro: ID do usuário não encontrado. Faça login novamente.')
        return
      }

      await accountService.deleteAccount({
        userId,
      })
      toast.success('Conta deletada com sucesso!')
      logout()
      setOpen(false)
      reset()
    } catch {
      reset()
      toast.error('Erro ao deletar conta. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="h-4 w-4" />
          <span>Deletar conta</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Deletar Conta
          </DialogTitle>
          <DialogDescription className="text-red-600">
            Esta ação é irreversível. Todos os seus dados serão perdidos
            permanentemente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirmação</Label>
            <Input
              id="confirmation"
              {...register('confirmation')}
              placeholder='Digite "DELETAR CONTA"'
              className={errors.confirmation ? 'border-red-500' : ''}
            />
            {errors.confirmation && (
              <p className="text-sm text-red-500">
                {errors.confirmation.message}
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Deletando...' : 'Deletar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
