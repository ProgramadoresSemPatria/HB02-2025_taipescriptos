import { Button } from '../components/ui/button'
import { ArrowRight } from 'lucide-react'
import ImageTest from '../assets/ImageTest.jpg'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-between overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80 z-10" />

      <div className="container mx-auto px-4 py-20 z-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="oklch(0 0 0)">Estude menos,</span>
              <br />
              <span className="oklch(0 0 0)">aprenda mais</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Faça upload de PDFs ou cole textos, e a IA cria resumos, quizzes e
              flashcards para você revisar rapidinho. Transforme qualquer
              conteúdo em uma experiência de aprendizado ativa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="default"
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground cursor-pointer"
            >
              Começar agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 cursor-pointer"
            >
              Ver demonstração
            </Button>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Comece por apenas R$XX por mês</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Assine em segundos</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            <img
              src={ImageTest}
              alt="Study Buddy App Interface"
              className="w-full h-full "
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
