import { Brain } from 'lucide-react'
import { Button } from './ui/button'

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold oklch(0 0 0)">Study Buddy</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-4">
            <Button>Login</Button>
            <Button>Registro</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
