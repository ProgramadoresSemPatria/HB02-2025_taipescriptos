import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { PlusIcon, FileText, Brain, BookOpen } from 'lucide-react'
import { type FormEventHandler, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { detectFileType, processFile } from '@/lib/fileProcessing'
import {
  generateQuiz,
  generateFlashcards,
  generateSumario,
  type QuizResponse,
  type FlashcardsResponse,
  type SumarioResponse,
  ApiException,
} from '@/lib/api'

type StudyType = 'quiz' | 'flashcards' | 'sumario'

const NewUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType>('quiz')
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<
    QuizResponse | FlashcardsResponse | SumarioResponse | null
  >(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setError('Por favor, anexe um arquivo para gerar o estudo')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Processa arquivo
      setProcessingStep('Processando arquivo...')
      const processedFile = await processFile(selectedFile, message || '')

      // Cria prompt automático baseado no tipo selecionado
      let promptText = message.trim()
      if (!promptText) {
        switch (selectedStudyType) {
          case 'quiz':
            promptText = 'Crie um quiz educativo baseado neste conteúdo'
            break
          case 'flashcards':
            promptText = 'Crie flashcards para estudo baseados neste conteúdo'
            break
          case 'sumario':
            promptText = 'Crie um sumário estruturado deste conteúdo'
            break
        }
      }

      // Prepara dados para a API
      const apiData = {
        text: promptText,
        image: processedFile?.image,
        pdfTextChunks: processedFile?.pdfTextChunks,
        temperatura: 0.3,
      }

      // Chama a API baseado no tipo de estudo selecionado
      setProcessingStep('Gerando conteúdo com IA...')
      let response: QuizResponse | FlashcardsResponse | SumarioResponse

      switch (selectedStudyType) {
        case 'quiz':
          response = await generateQuiz({
            ...apiData,
            quantidadeQuestoes: 5,
          })
          break
        case 'flashcards':
          response = await generateFlashcards({
            ...apiData,
            quantidadeFlashcards: 10,
          })
          break
        case 'sumario':
          response = await generateSumario({
            ...apiData,
            detalhamento: 'intermediario',
          })
          break
      }

      setResult(response)
      setProcessingStep('')

      // Limpa campos após sucesso
      setMessage('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Erro ao processar:', error)

      if (error instanceof ApiException) {
        setError(`Erro da API: ${error.apiError.message}`)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro desconhecido ao processar conteúdo')
      }
    } finally {
      setIsLoading(false)
      setProcessingStep('')
    }
  }

  const studyTypes = [
    {
      type: 'quiz' as StudyType,
      label: 'Quiz',
      icon: Brain,
      description: 'Questões de múltipla escolha',
    },
    {
      type: 'flashcards' as StudyType,
      label: 'Flashcards',
      icon: BookOpen,
      description: 'Cartões para memorização',
    },
    {
      type: 'sumario' as StudyType,
      label: 'Sumário',
      icon: FileText,
      description: 'Resumo estruturado',
    },
  ]

  return (
    <div className="flex min-h-full justify-center items-center p-4">
      <div className="flex flex-col gap-6 p-6 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Gere um novo estudo
          </h1>
          <p className="text-muted-foreground mt-1">
            Anexe um arquivo (imagem, PDF ou documento) para gerar conteúdo
            educativo
          </p>
        </div>

        {/* Seleção do tipo de estudo */}
        <div className="grid grid-cols-3 gap-3">
          {studyTypes.map(({ type, label, icon: Icon, description }) => (
            <Button
              key={type}
              variant={selectedStudyType === type ? 'default' : 'outline'}
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => setSelectedStudyType(type)}
            >
              <Icon size={24} />
              <div className="text-center">
                <div className="font-semibold">{label}</div>
                <div className="text-xs opacity-70">{description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Input de arquivo (oculto) */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md"
        />

        {/* Arquivo selecionado */}
        {selectedFile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {detectFileType(selectedFile).type} •{' '}
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Instruções adicionais (opcional) - Anexe um arquivo para começar..."
              disabled={isLoading}
            />
            <AIInputToolbar className="flex items-end">
              <AIInputTools>
                <AIInputButton type="button" onClick={handleFileSelect}>
                  <PlusIcon size={16} />
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit disabled={!selectedFile} />
            </AIInputToolbar>
          </AIInput>
        </div>

        {/* Status de processamento */}
        {processingStep && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                ⏳ {processingStep}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de erro */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Resultado */}
        {result && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{result.titulo}</h2>
                  {'descricao' in result && result.descricao && (
                    <p className="text-muted-foreground">{result.descricao}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.modelo} •{' '}
                    {new Date(result.timestamp).toLocaleString('pt-BR')} •
                    Fonte: {result.fonte}
                  </p>
                </div>

                {/* Renderiza conteúdo baseado no tipo */}
                {'questoes' in result && (
                  <div className="space-y-4">
                    {result.questoes.map((questao, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">
                          {index + 1}. {questao.pergunta}
                        </h3>
                        <div className="space-y-1 mb-2">
                          {questao.opcoes.map((opcao, opcaoIndex) => (
                            <div
                              key={opcaoIndex}
                              className={`p-2 rounded ${
                                opcaoIndex === questao.respostaCorreta
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {String.fromCharCode(65 + opcaoIndex)}. {opcao}
                            </div>
                          ))}
                        </div>
                        {questao.explicacao && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Explicação:</strong> {questao.explicacao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {'flashcards' in result && (
                  <div className="grid gap-4">
                    {result.flashcards.map((flashcard, index) => (
                      <div key={index} className="border rounded-lg">
                        <div className="grid grid-cols-2 divide-x">
                          <div className="p-4">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Frente
                            </h4>
                            <p>{flashcard.frente}</p>
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Verso
                            </h4>
                            <p>{flashcard.verso}</p>
                          </div>
                        </div>
                        {flashcard.categoria && (
                          <div className="px-4 pb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {flashcard.categoria}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {'resumoExecutivo' in result && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Resumo Executivo</h3>
                      <p className="text-sm">{result.resumoExecutivo}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Tópicos-Chave</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.topicosChave.map((topico, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {topico}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Pontos Principais</h3>
                      <div className="space-y-3">
                        {result.pontosPrincipais.map((ponto, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-200 pl-4"
                          >
                            <h4 className="font-medium">{ponto.topico}</h4>
                            <p className="text-sm text-muted-foreground">
                              {ponto.descricao}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.conclusao && (
                      <div>
                        <h3 className="font-semibold mb-2">Conclusão</h3>
                        <p className="text-sm">{result.conclusao}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
export default NewUploadPage
