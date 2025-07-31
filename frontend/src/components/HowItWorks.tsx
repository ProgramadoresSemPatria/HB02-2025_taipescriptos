import { Upload, Brain, BookOpen } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Faça upload do seu conteúdo',
    description:
      'Envie PDFs ou cole textos. Nossa IA aceita vários tipos de conteúdos.',
    color: 'from-blue-500 to-purple-600',
  },
  {
    icon: Brain,
    title: 'IA gera resumo, quiz e flashcards',
    description:
      'Em segundos, nossa inteligência artificial analisa e cria resumos objetivos, quizzes interativos e flashcards personalizados.',
    color: 'from-purple-600 to-pink-600',
  },
  {
    icon: BookOpen,
    title: 'Revise e aprenda de forma ativa',
    description:
      'Estude com métodos comprovados, testes de conhecimento e repetição ativa para máxima retenção.',
    color: 'from-pink-600 to-red-600',
  },
]

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="oklch(0 0 0)">Como funciona o</span>
            <br />
            <span className="oklch(0 0 0)">Study Buddy</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Três passos simples para transformar qualquer conteúdo em uma
            experiência de aprendizado eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-10" />
              )}

              <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${step.color} mb-6`}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
