import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop } from 'lucide-react'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export function FloatingThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'system':
        return <Laptop className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Tema: Claro (clique para alternar)'
      case 'dark':
        return 'Tema: Escuro (clique para alternar)'
      case 'system':
        return 'Tema: Sistema (clique para alternar)'
      default:
        return 'Alternar tema'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/95 backdrop-blur-sm border-border hover:scale-105"
          >
            {getIcon()}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="mb-2">
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
