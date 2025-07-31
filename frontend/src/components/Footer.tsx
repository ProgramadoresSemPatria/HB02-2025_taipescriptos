import { Brain } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold oklch(0 0 0)">Study Buddy</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed pb-2">
            Transformando a educação com inteligência artificial. Estude menos,
            aprenda mais, conquiste seus objetivos.
          </p>
        </div>

        <div className="pt-4 border-t border-border/80">
          <p className="text-xs text-muted-foreground">
            © 2025 Study Buddy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
