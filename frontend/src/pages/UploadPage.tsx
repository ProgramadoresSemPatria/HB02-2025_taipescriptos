import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  detectFileType,
  processFile,
  type ProcessedFile,
} from '@/lib/fileProcessing'
import {
  generateQuiz,
  generateFlashcards,
  generateSumario,
  type QuizResponse,
  type FlashcardsResponse,
  type SumarioResponse,
  ApiException,
} from '@/lib/api'

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [results, setResults] = useState<{
    quiz?: QuizResponse
    flashcards?: FlashcardsResponse
    sumario?: SumarioResponse
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processedChunks, setProcessedChunks] = useState<string[] | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    setResults(null)
    setError(null)
    setProcessedChunks(null)
    setProcessedImage(null)
    if (file) {
      const fileInfo = detectFileType(file)
      console.log('Arquivo detectado:', fileInfo)
      setMessage('') // Limpa texto quando arquivo é selecionado
    }
  }

  const handleModeChange = (mode: 'file' | 'text') => {
    setInputMode(mode)
    setSelectedFile(null)
    setMessage('')
    setResults(null)
    setError(null)
    setProcessedChunks(null)
    setProcessedImage(null)
    // Limpa o input de arquivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async () => {
    // Validação: apenas texto OU arquivo
    if (inputMode === 'file' && !selectedFile) {
      setError('Por favor, selecione um arquivo')
      return
    }
    if (inputMode === 'text' && !message.trim()) {
      setError('Por favor, digite um texto')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      let payload: {
        text: string
        image?: string
        pdfTextChunks?: string[]
      }

      if (inputMode === 'file' && selectedFile) {
        // Processar arquivo baseado no tipo
        setProcessingStep('Detectando tipo de arquivo...')
        const fileInfo = detectFileType(selectedFile)

        if (fileInfo.type === 'unsupported') {
          throw new Error(
            `Tipo de arquivo não suportado: ${fileInfo.extension}`,
          )
        }

        setProcessingStep(`Processando ${fileInfo.type}...`)
        const processedFile: ProcessedFile = await processFile(
          selectedFile,
          'Analise o conteúdo fornecido',
        )

        // Atualizar estado para exibir no frontend
        if (processedFile.pdfTextChunks) {
          setProcessedChunks(processedFile.pdfTextChunks)
        }
        if (processedFile.image) {
          setProcessedImage(processedFile.image)
        }

        payload = {
          text: processedFile.text,
          image: processedFile.image || undefined,
          pdfTextChunks: processedFile.pdfTextChunks || undefined,
        }
      } else {
        // Modo texto
        payload = {
          text: message,
        }
      }

      // Gerar conteúdos usando rotas separadas
      setProcessingStep('Gerando quiz...')
      const quizPromise = generateQuiz({
        ...payload,
        quantidadeQuestoes: 5,
        temperatura: 0.3,
      })

      setProcessingStep('Gerando flashcards...')
      const flashcardsPromise = generateFlashcards({
        ...payload,
        quantidadeFlashcards: 5,
        temperatura: 0.3,
      })

      setProcessingStep('Gerando sumário...')
      const sumarioPromise = generateSumario({
        ...payload,
        detalhamento: 'intermediario' as const,
        temperatura: 0.3,
      })

      setProcessingStep('Finalizando...')
      const [quiz, flashcards, sumario] = await Promise.all([
        quizPromise,
        flashcardsPromise,
        sumarioPromise,
      ])

      setResults({ quiz, flashcards, sumario })
      setProcessingStep('')

      // Limpar campos após sucesso
      if (inputMode === 'file') {
        setSelectedFile(null)
        const fileInput = document.getElementById(
          'file-input',
        ) as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setMessage('')
      }
    } catch (error) {
      console.error('Erro ao processar:', error)

      if (error instanceof ApiException) {
        setError(`Erro da API: ${error.apiError.message}`)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro desconhecido ao processar')
      }
    } finally {
      setIsLoading(false)
      setProcessingStep('')
    }
  }

  const getSupportedFormats = () => {
    return 'Imagens (JPG, PNG, GIF, WebP), PDFs, arquivos de texto (TXT, MD)'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl space-y-6">
        {/* Card principal */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              🚀 IA Multimodal - Studdy Buddy
            </CardTitle>
            <p className="text-center text-gray-600">
              Gere quiz, flashcards e resumos através de arquivos ou texto
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seletor de modo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                📝 Modo de entrada
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleModeChange('file')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputMode === 'file'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📁 Enviar Arquivo
                </button>
                <button
                  onClick={() => handleModeChange('text')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputMode === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✏️ Digite Texto
                </button>
              </div>
            </div>

            {/* Input de arquivo (apenas se modo = file) */}
            {inputMode === 'file' && (
              <div>
                <label
                  htmlFor="file-input"
                  className="block text-sm font-medium mb-2"
                >
                  📁 Selecionar arquivo
                </label>
                <Input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos suportados: {getSupportedFormats()}
                </p>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-800">
                      ✅ <strong>{selectedFile.name}</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                      Tipo: {detectFileType(selectedFile).type} | Tamanho:{' '}
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Campo de texto (apenas se modo = text) */}
            {inputMode === 'text' && (
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  ✏️ Digite seu texto
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite o texto que você quer usar para gerar quiz, flashcards e resumo..."
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Status de processamento */}
            {processingStep && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">⏳ {processingStep}</p>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            {/* Botão de envio */}
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                (inputMode === 'file' && !selectedFile) ||
                (inputMode === 'text' && !message.trim())
              }
              className="w-full h-12 text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  ⏳ {processingStep || 'Processando...'}
                </span>
              ) : (
                '🚀 Gerar Material de Estudo'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card de preview dos chunks processados */}
        {(processedChunks || processedImage) && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">
                🔍 Preview do Processamento
              </CardTitle>
              <p className="text-sm text-gray-500">
                Visualize como o arquivo foi processado antes do envio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview da imagem processada */}
              {processedImage && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    📷 Imagem Processada:
                  </h4>
                  <div className="bg-gray-50 p-3 rounded border">
                    <img
                      src={processedImage}
                      alt="Imagem processada"
                      className="max-w-xs max-h-48 object-contain rounded border"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Redimensionada e convertida para Base64
                    </p>
                  </div>
                </div>
              )}

              {/* Preview dos chunks de texto */}
              {processedChunks && processedChunks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    📄 Chunks de Texto Extraídos: ({processedChunks.length})
                  </h4>
                  {processedChunks.length === 50 && (
                    <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        ⚠️ PDF muito grande! Limitado aos primeiros 50 chunks
                        para processamento otimizado.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {processedChunks.map((chunk, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-blue-600">
                            Chunk {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {chunk.length} caracteres
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-h-24 overflow-y-auto">
                          {chunk.length > 200 ? (
                            <>
                              {chunk.substring(0, 200)}
                              <span className="text-blue-500">
                                ... (truncado)
                              </span>
                            </>
                          ) : (
                            chunk
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cards de resultados */}
        {results && (
          <div className="space-y-6">
            {/* Sumário */}
            {results.sumario && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">
                    📄 Resumo
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Modelo: {results.sumario.modelo} | Gerado em:{' '}
                    {new Date(results.sumario.timestamp).toLocaleString(
                      'pt-BR',
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded border">
                      {results.sumario.resumoExecutivo}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz */}
            {results.quiz && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">
                    🧠 Quiz ({results.quiz.questoes.length} questões)
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Modelo: {results.quiz.modelo} | Gerado em:{' '}
                    {new Date(results.quiz.timestamp).toLocaleString('pt-BR')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.quiz.questoes.map((questao, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded border"
                      >
                        <h4 className="font-semibold mb-2">
                          {index + 1}. {questao.pergunta}
                        </h4>
                        <div className="space-y-1">
                          {questao.opcoes.map((opcao, opcaoIndex) => (
                            <div
                              key={opcaoIndex}
                              className={`p-2 rounded text-sm ${
                                opcaoIndex === questao.respostaCorreta
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : 'bg-white'
                              }`}
                            >
                              {String.fromCharCode(65 + opcaoIndex)}) {opcao}
                              {opcaoIndex === questao.respostaCorreta && ' ✅'}
                            </div>
                          ))}
                        </div>
                        {questao.explicacao && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Explicação:</strong> {questao.explicacao}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flashcards */}
            {results.flashcards && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">
                    🃏 Flashcards ({results.flashcards.flashcards.length} cards)
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Modelo: {results.flashcards.modelo} | Gerado em:{' '}
                    {new Date(results.flashcards.timestamp).toLocaleString(
                      'pt-BR',
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.flashcards.flashcards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded border"
                      >
                        <div className="bg-purple-100 p-3 rounded mb-2">
                          <h4 className="font-semibold text-purple-800">
                            Pergunta {index + 1}:
                          </h4>
                          <p className="text-purple-700">{card.frente}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <h4 className="font-semibold text-purple-800">
                            Resposta:
                          </h4>
                          <p className="text-purple-700">{card.verso}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
