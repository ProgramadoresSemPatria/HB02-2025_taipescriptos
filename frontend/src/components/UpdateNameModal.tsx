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
import { PencilLine } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { accountService } from '@/services/accountService'
import {
  updateNameSchema,
  type UpdateNameFormData,
} from '@/schemas/accountPageSchema'
import { toast } from 'sonner'

export function UpdateNameModal() {
  const [open, setOpen] = useState(false)
  const { user, refreshUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: user?.name || '',
    },
  })

  const onSubmit = async (data: UpdateNameFormData) => {
    try {
      // Verificar se o token existe
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error(
          'Sessão expirada. Você será redirecionado para fazer login novamente.',
        )
        // Limpar dados do localStorage
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        // Redirecionar para login
        window.location.href = '/login'
        return
      }

      await accountService.updateName(data)
      await refreshUser()
      toast.success('Nome atualizado com sucesso!')
      setOpen(false)
      reset()
    } catch {
      reset()
      toast.error('Erro ao atualizar nome. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PencilLine className="h-4 w-4 text-primary-foreground dark:text-foreground" />
          <span className="text-primary-foreground dark:text-foreground">
            Editar nome
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Nome</DialogTitle>
          <DialogDescription>
            Digite seu novo nome abaixo. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Digite seu nome"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
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
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
