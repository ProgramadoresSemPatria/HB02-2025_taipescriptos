import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, Trophy, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QuizResponse } from '@/services/aiServices'

interface Pergunta {
  id: number
  pergunta: string
  opcoes: string[]
  resposta: number
  explicacao: string
}

interface QuizSectionProps {
  quiz?: QuizResponse
}

export function QuizSection({ quiz }: QuizSectionProps) {
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<{ [key: number]: number }>({})
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(
    null,
  )
  const [quizFinalizado, setQuizFinalizado] = useState(false)

  // Dados padrão como fallback
  const defaultPerguntas: Pergunta[] = [
    {
      id: 1,
      pergunta: 'Qual é o principal objetivo da fotossíntese?',
      opcoes: [
        'Produzir oxigênio para os animais',
        'Converter energia luminosa em energia química',
        'Absorver dióxido de carbono da atmosfera',
        'Manter as plantas verdes',
      ],
      resposta: 1,
      explicacao:
        'A fotossíntese converte energia luminosa em energia química (glicose), que pode ser armazenada e utilizada pela planta.',
    },
    {
      id: 2,
      pergunta: 'Em que parte da célula vegetal ocorre a fotossíntese?',
      opcoes: ['Núcleo', 'Mitocôndria', 'Cloroplasto', 'Vacúolo'],
      resposta: 2,
      explicacao:
        'Os cloroplastos contêm clorofila e são as organelas especializadas onde ocorre a fotossíntese.',
    },
    {
      id: 3,
      pergunta: 'Qual é a equação geral da fotossíntese?',
      opcoes: [
        '6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂',
        'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP',
        '6O₂ + 6H₂O + luz → C₆H₁₂O₆ + 6CO₂',
        'CO₂ + H₂O → O₂ + glicose',
      ],
      resposta: 0,
      explicacao:
        'Esta equação mostra que 6 moléculas de CO₂ e 6 de H₂O, com energia luminosa, produzem 1 molécula de glicose e 6 de O₂.',
    },
  ]

  // Usar dados da API se disponíveis, senão usar dados padrão
  const perguntas: Pergunta[] = quiz?.questoes
    ? quiz.questoes.map((questao, index) => ({
        id: index + 1,
        pergunta: questao.pergunta,
        opcoes: questao.opcoes,
        resposta: questao.respostaCorreta,
        explicacao: questao.explicacao || 'Explicação não disponível',
      }))
    : defaultPerguntas

  const titulo = quiz?.titulo || 'Quiz Interativo'
  const descricao = quiz?.descricao || 'Teste seus conhecimentos com este quiz!'

  const responderPergunta = (opcaoIndex: number) => {
    setRespostaSelecionada(opcaoIndex)
    setRespostas((prev) => ({ ...prev, [perguntaAtual]: opcaoIndex }))
    setMostrarResultado(true)
  }

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1)
      setMostrarResultado(false)
      setRespostaSelecionada(null)
    } else {
      setQuizFinalizado(true)
    }
  }

  const reiniciarQuiz = () => {
    setPerguntaAtual(0)
    setRespostas({})
    setMostrarResultado(false)
    setRespostaSelecionada(null)
    setQuizFinalizado(false)
  }

  const calcularPontuacao = () => {
    return Object.entries(respostas).reduce(
      (acertos, [perguntaId, resposta]) => {
        const pergunta = perguntas.find(
          (p) => p.id === parseInt(perguntaId) + 1,
        )
        return acertos + (pergunta && pergunta.resposta === resposta ? 1 : 0)
      },
      0,
    )
  }

  if (quizFinalizado) {
    const pontuacao = calcularPontuacao()
    const porcentagem = Math.round((pontuacao / perguntas.length) * 100)

    return (
      <section id="quiz" className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-secondary">
            <span className="text-2xl">❓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Quiz Finalizado!
            </h2>
            <p className="text-muted-foreground">Veja seu desempenho</p>
          </div>
        </div>

        <Card className="p-8 text-center bg-gradient-card">
          <Trophy
            className={`w-16 h-16 mx-auto mb-4 ${porcentagem >= 70 ? 'text-success' : porcentagem >= 50 ? 'text-warning' : 'text-destructive'}`}
          />
          <h3 className="text-3xl font-bold mb-2">
            {pontuacao}/{perguntas.length}
          </h3>
          <p className="text-xl text-muted-foreground mb-4">
            {porcentagem}% de acertos
          </p>
          <p className="text-muted-foreground mb-6">
            {porcentagem >= 70
              ? 'Excelente! Você domina o conteúdo!'
              : porcentagem >= 50
                ? 'Bom trabalho! Revise alguns conceitos.'
                : 'Continue estudando! O resumo pode ajudar.'}
          </p>
          <Button variant="default" onClick={reiniciarQuiz} className="gap-2">
            <RotateCcw className="w-4 h-4 text-primary-foreground dark:text-foreground" />
            <span className="text-primary-foreground dark:text-foreground">
              Tentar Novamente
            </span>
          </Button>
        </Card>
      </section>
    )
  }

  const pergunta = perguntas[perguntaAtual]
  const respostaCorreta =
    mostrarResultado && respostaSelecionada === pergunta.resposta

  return (
    <section id="quiz" className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-secondary">
          <span className="text-2xl">❓</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{titulo}</h2>
          <p className="text-muted-foreground">{descricao}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Pergunta {perguntaAtual + 1} de {perguntas.length}
          </span>
        </div>
        <div className="w-32 h-2 bg-muted-foreground/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary dark:bg-primary transition-all duration-500"
            style={{
              width: `${((perguntaAtual + 1) / perguntas.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-6 text-foreground">
          {pergunta.pergunta}
        </h3>

        <div className="space-y-3 mb-6">
          {pergunta.opcoes.map((opcao, index) => (
            <button
              key={index}
              onClick={() => !mostrarResultado && responderPergunta(index)}
              disabled={mostrarResultado}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                mostrarResultado
                  ? index === pergunta.resposta
                    ? 'bg-success/10 border-success text-success font-medium'
                    : index === respostaSelecionada &&
                        index !== pergunta.resposta
                      ? 'bg-destructive/10 border-destructive text-destructive'
                      : 'bg-muted/50 border-border text-muted-foreground'
                  : 'bg-background border-border hover:bg-muted hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    mostrarResultado && index === pergunta.resposta
                      ? 'border-success bg-success'
                      : mostrarResultado &&
                          index === respostaSelecionada &&
                          index !== pergunta.resposta
                        ? 'border-destructive bg-destructive'
                        : 'border-border'
                  }`}
                >
                  {mostrarResultado && index === pergunta.resposta && (
                    <CheckCircle className="w-4 h-4 text-success-foreground" />
                  )}
                  {mostrarResultado &&
                    index === respostaSelecionada &&
                    index !== pergunta.resposta && (
                      <XCircle className="w-4 h-4 text-destructive-foreground" />
                    )}
                  {!mostrarResultado && (
                    <span className="text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  )}
                </div>
                <span>{opcao}</span>
              </div>
            </button>
          ))}
        </div>

        {mostrarResultado && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              respostaCorreta
                ? 'bg-success/10 border border-success/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {respostaCorreta ? (
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${respostaCorreta ? 'text-success' : 'text-destructive'} mb-1`}
                >
                  {respostaCorreta ? 'Correto!' : 'Incorreto!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pergunta.explicacao}
                </p>
              </div>
            </div>
          </div>
        )}

        {mostrarResultado && (
          <Button
            onClick={proximaPergunta}
            variant="default"
            className="w-full text-primary-foreground dark:text-foreground"
          >
            {perguntaAtual < perguntas.length - 1
              ? 'Próxima Pergunta'
              : 'Ver Resultado'}
          </Button>
        )}
      </Card>
    </section>
  )
}
