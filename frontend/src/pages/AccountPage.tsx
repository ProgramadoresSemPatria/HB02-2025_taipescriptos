import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Lock, PencilLine, Trash } from 'lucide-react'

export function AccountPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Minha conta</h1>
      <div className="bg-card text-card-foreground p-4 flex flex-col gap-4 rounded-xl border shadow-sm w-full mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Seu nome</h2>
          <div className="flex gap-3 items-center">
            <p>John Doe</p>
            <Button>
              <PencilLine />
              Editar
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Seu email</h2>
          <div className="flex gap-3 items-center">
            <p>johndoe@example.com</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Redefinir senha</h2>
          <div className="flex gap-3 items-center">
            <Button>
              <Lock />
              Redefinir senha
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Deletar conta</h2>
          <div className="flex gap-3 items-center">
            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash />
              Deletar conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
