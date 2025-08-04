import { Separator } from '@/components/ui/separator'
import { User, CreditCard, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import LogoutButton from '@/components/auth/LogoutButton'
import { UpdateNameModal } from '@/components/UpdateNameModal'
import { ResetPasswordModal } from '@/components/ResetPasswordModal'
import { DeleteAccountModal } from '@/components/DeleteAccountModal'

export function AccountPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando informações da conta...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold">Minha conta</h1>
        <div className="bg-card text-card-foreground p-4 flex flex-col gap-4 rounded-xl border shadow-sm w-full mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Seu nome</h2>
            <div className="flex gap-3 items-center">
              <p>{user.name}</p>
              <UpdateNameModal />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Seu email</h2>
            <span className="flex gap-3 items-center">{user.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Créditos</h2>
            <div className="flex gap-2 items-center">
              <CreditCard className="h-4 w-4" />
              <span>{user.credits} créditos</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Status da conta</h2>
            <div className="flex gap-2 items-center">
              {user.isPremium ? (
                <>
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Premium
                  </span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>Básico</span>
                </>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Redefinir senha</h2>
            <div className="flex gap-3 items-center">
              <ResetPasswordModal />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Deletar conta</h2>
            <div className="flex gap-3 items-center">
              <DeleteAccountModal />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Sair da conta</h2>
            <div className="flex gap-3 items-center">
              <LogoutButton
                variant="destructive"
                className="bg-destructive text-primary-foreground dark:text-foreground hover:bg-destructive/90"
              >
                <span className="text-primary-foreground dark:text-foreground">
                  Sair
                </span>
              </LogoutButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
