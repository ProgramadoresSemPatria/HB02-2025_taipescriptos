import React from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface LogoutButtonProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'ghost',
  size = 'default',
  className = '',
  showIcon = true,
  children = 'Sair',
}) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  )
}

export default LogoutButton
