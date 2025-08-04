import { useState } from 'react'
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FlashcardsResponse } from '@/services/aiServices'

interface Flashcard {
  id: number
  frente: string
  verso: string
  categoria: string
}

interface FlashcardsSectionProps {
  flashcards?: FlashcardsResponse
}

export function FlashcardsSection({
  flashcards: flashcardsData,
}: FlashcardsSectionProps) {
  const [cardAtual, setCardAtual] = useState(0)
  const [virado, setVirado] = useState(false)
  const [cardsEstudados, setCardsEstudados] = useState<Set<number>>(new Set())

  // Dados padrão como fallback
  const defaultFlashcards: Flashcard[] = [
    {
      id: 1,
      frente: 'O que é fotossíntese?',
      verso:
        'Processo pelo qual plantas convertem energia luminosa em energia química (glicose), usando CO₂ e H₂O, liberando O₂ como subproduto.',
      categoria: 'Conceito',
    },
    {
      id: 2,
      frente: 'Onde ocorre a fotossíntese?',
      verso:
        'Principalmente nos cloroplastos das folhas, onde estão localizados os pigmentos fotossintéticos como a clorofila.',
      categoria: 'Localização',
    },
    {
      id: 3,
      frente: 'Quais são os reagentes da fotossíntese?',
      verso:
        '6CO₂ (dióxido de carbono) + 6H₂O (água) + energia luminosa → C₆H₁₂O₆ (glicose) + 6O₂ (oxigênio)',
      categoria: 'Equação',
    },
    {
      id: 4,
      frente: 'Qual é a fase clara da fotossíntese?',
      verso:
        'Reações fotoquímicas que ocorrem nos tilacoides, onde a energia luminosa é convertida em ATP e NADPH, liberando O₂.',
      categoria: 'Processo',
    },
    {
      id: 5,
      frente: 'O que é o Ciclo de Calvin?',
      verso:
        'Fase escura da fotossíntese que ocorre no estroma, onde CO₂ é fixado e convertido em glicose usando ATP e NADPH.',
      categoria: 'Processo',
    },
  ]

  // Usar dados reais se disponíveis, senão usar dados padrão
  const flashcards: Flashcard[] = flashcardsData?.flashcards
    ? flashcardsData.flashcards.map((card, index) => ({
        id: index + 1,
        frente: card.frente,
        verso: card.verso,
        categoria: card.categoria || 'Geral',
      }))
    : defaultFlashcards

  const virarCard = () => {
    setVirado(!virado)
    if (!virado) {
      setCardsEstudados((prev) => new Set([...prev, cardAtual]))
    }
  }

  const proximoCard = () => {
    setCardAtual((prev) => (prev + 1) % flashcards.length)
    setVirado(false)
  }

  const cardAnterior = () => {
    setCardAtual((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setVirado(false)
  }

  const embaralharCards = () => {
    setCardAtual(Math.floor(Math.random() * flashcards.length))
    setVirado(false)
  }

  const resetarProgresso = () => {
    setCardsEstudados(new Set())
    setCardAtual(0)
    setVirado(false)
  }

  const card = flashcards[cardAtual]
  const progresso = Math.round((cardsEstudados.size / flashcards.length) * 100)

  return (
    <section id="flashcards" className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
          <span className="text-2xl">🧩</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flashcards</h2>
          <p className="text-muted-foreground">
            Memorize com cartas interativas
          </p>
        </div>
      </div>

      {/* Progresso */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-accent" />
          <span className="text-sm text-muted-foreground">
            Progresso: {cardsEstudados.size}/{flashcards.length} cards estudados
          </span>
        </div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-hero transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Card Principal */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <Card
            className={`h-64 p-6 cursor-pointer transition-all duration-700 preserve-3d ${
              virado ? 'rotate-y-180' : ''
            } ${cardsEstudados.has(cardAtual) ? 'ring-2 ring-success/50' : ''}`}
            onClick={virarCard}
            style={{
              transformStyle: 'preserve-3d',
              transform: virado
                ? 'perspective(1000px) rotateY(180deg)'
                : 'perspective(1000px) rotateY(0deg)',
            }}
          >
            {/* Frente do Card */}
            <div
              className={`absolute inset-0 w-full h-full bg-gradient-primary text-primary-foreground rounded-lg p-6 flex flex-col justify-center items-center text-center backface-hidden ${
                virado ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="mb-4">
                <span className="text-xs px-3 py-1 bg-primary-foreground/20 rounded-full">
                  {card.categoria}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                {card.frente}
              </h3>
              <p className="text-sm opacity-80 text-black">
                Clique para ver a resposta
              </p>
            </div>

            {/* Verso do Card */}
            <div
              className={`absolute inset-0 w-full h-full bg-gradient-secondary text-secondary-foreground rounded-lg p-6 flex flex-col justify-center items-center text-center backface-hidden ${
                virado ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="mb-4">
                <span className="text-xs px-3 py-1 bg-secondary-foreground/20 rounded-full">
                  Resposta
                </span>
              </div>
              <p className="text-sm leading-relaxed">{card.verso}</p>
              <p className="text-xs opacity-80 mt-4">
                Clique novamente para voltar
              </p>
            </div>
          </Card>

          {/* Indicador de Card Estudado */}
          {cardsEstudados.has(cardAtual) && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center animate-bounce-in">
              <span className="text-xs text-success-foreground">✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-3 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={cardAnterior}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button variant="outline" onClick={embaralharCards} className="gap-2">
          <Shuffle className="w-4 h-4" />
          Embaralhar
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={proximoCard}
          disabled={flashcards.length <= 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Contador e Reset */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Card {cardAtual + 1} de {flashcards.length}
        </span>

        {cardsEstudados.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetarProgresso}
            className="gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Resetar Progresso
          </Button>
        )}
      </div>

      {/* Dica de Estudo */}
      {progresso === 100 && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-4 flex items-center gap-3 animate-bounce-in">
          <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              <strong className="text-success">Parabéns!</strong> Você estudou
              todos os flashcards! Que tal revisar o quiz para consolidar o
              aprendizado?
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
