import { Zap, Target, FileText } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'IA Instantânea',
    description:
      'Processamento em segundos, não em horas. Nossa IA trabalha 24/7 para você.',
  },
  {
    icon: Target,
    title: 'Aprendizado Focado',
    description:
      'Identifica automaticamente os pontos-chave e cria revisões direcionadas.',
  },
  {
    icon: FileText,
    title: 'Multi-formato',
    description: 'PDFs e textos - funciona com qualquer tipo de conteúdo.',
  },
]

const FeaturesSection = () => {
  return (
    <section className="py-15">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="oklch(0 0 0)">Recursos que fazem a</span>
            <br />
            <span className="oklch(0 0 0)">diferença</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tecnologia de ponta para maximizar seu aprendizado e economizar
            tempo precioso
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary-foreground dark:text-foreground" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
