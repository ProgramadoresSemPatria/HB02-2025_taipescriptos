import { Brain } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

const Header = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleRegister = () => {
    navigate('/register')
  }

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-2 md:px-4 lg:px-6 py-3 md:py-4 lg:py-4 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="p-1.5 md:p-2 lg:p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground">
            <Brain className="h-5 w-5 md:h-6 md:w-6 lg:h-6 lg:w-6" />
          </div>
          <span className="text-lg md:text-xl lg:text-xl font-bold oklch(0 0 0)">
            Study Buddy
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <nav className="flex items-center gap-2 md:gap-4 lg:gap-4">
            <Button
              onClick={handleLogin}
              className="text-xs md:text-sm lg:text-base px-3 md:px-4 lg:px-4 py-1.5 md:py-2 lg:py-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground cursor-pointer"
            >
              Login
            </Button>
            <Button
              onClick={handleRegister}
              className="text-xs md:text-sm lg:text-base px-3 md:px-4 lg:px-4 py-1.5 md:py-2 lg:py-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground cursor-pointer"
            >
              Registro
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
