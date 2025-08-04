import { CheckCircle, BookOpen, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SumarioResponse } from '@/services/aiServices'

interface ResumoSectionProps {
  summary?: SumarioResponse
}

export function ResumoSection({ summary }: ResumoSectionProps) {
  // Dados padrão como fallback
  const defaultTopicos = [
    {
      categoria: 'Conceitos Fundamentais',
      items: [
        'Definição de fotossíntese como processo de conversão de energia luminosa',
        'Importância para a vida na Terra e cadeia alimentar',
        'Localização: principalmente nas folhas, especificamente nos cloroplastos',
      ],
    },
    {
      categoria: 'Componentes Necessários',
      items: [
        'Luz solar como fonte de energia',
        'Dióxido de carbono (CO₂) absorvido pelas folhas',
        'Água (H₂O) absorvida pelas raízes',
        'Clorofila como pigmento fotossintético principal',
      ],
    },
    {
      categoria: 'Processo e Etapas',
      items: [
        'Fase clara (reações fotoquímicas): conversão de energia luminosa',
        'Fase escura (Ciclo de Calvin): fixação do CO₂',
        'Produção de glicose e liberação de oxigênio',
      ],
    },
    {
      categoria: 'Resultados e Importância',
      items: [
        'Produção de oxigênio essencial para respiração',
        'Base da cadeia alimentar terrestre',
        'Regulação do CO₂ atmosférico',
        'Formação de biomassa vegetal',
      ],
    },
  ]

  const titulo = summary?.titulo || 'Resumo do Material'
  const resumoExecutivo =
    summary?.resumoExecutivo ||
    'Material de estudo sobre os conceitos fundamentais.'
  const topicosChave = summary?.topicosChave || []
  const pontosPrincipais = summary?.pontosPrincipais || []
  const conclusao = summary?.conclusao

  // Se há dados da API, usar eles; senão usar os dados padrão
  const topicos = summary
    ? [
        {
          categoria: 'Tópicos Chave',
          items: topicosChave,
        },
        ...pontosPrincipais.map((ponto) => ({
          categoria: ponto.topico,
          items: [ponto.descricao],
        })),
      ]
    : defaultTopicos

  return (
    <section id="resumo" className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
          <span className="text-2xl">📝</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{titulo}</h2>
          <p className="text-muted-foreground">{resumoExecutivo}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {topicos.map((topico, index) => (
          <Card
            key={index}
            className="p-6 bg-gradient-card hover:shadow-primary transition-all duration-300 border-l-4 border-l-primary animate-bounce-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                  {topico.categoria}
                  <Lightbulb className="w-4 h-4 text-accent" />
                </h3>

                <ul className="space-y-3">
                  {topico.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-3 group"
                    >
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conclusão se disponível */}
      {conclusao && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary-foreground dark:text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-3">
                Conclusão
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {conclusao}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-primary-foreground dark:text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            <strong className="text-primary-foreground dark:text-foreground">
              Dica de estudo:
            </strong>{' '}
            Use este resumo como base e depois teste seus conhecimentos no quiz!
          </p>
        </div>
      </div>
    </section>
  )
}
