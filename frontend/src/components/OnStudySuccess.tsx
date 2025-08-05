import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { HomeIcon } from 'lucide-react'

interface OnStudySuccessProps {
  isSuccessDialogOpen: boolean
  setIsSuccessDialogOpen: (open: boolean) => void
}

export function OnStudySuccess({
  isSuccessDialogOpen,
  setIsSuccessDialogOpen,
}: OnStudySuccessProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estudo criado com sucesso!</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-primary to-primary-glow"
          >
            <HomeIcon className="w-4 h-4 text-primary-foreground dark:text-foreground" />
            <span className="text-primary-foreground dark:text-foreground">
              Ir para dashboard
            </span>
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
