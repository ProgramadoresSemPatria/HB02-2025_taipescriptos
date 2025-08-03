import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  detectFileType,
  processFile,
  type ProcessedFile,
} from '@/lib/fileProcessing'
import { generateAll, type AIResponse, ApiException } from '@/lib/api'

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [aiResponse, setAiResponse] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processedChunks, setProcessedChunks] = useState<string[] | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    setAiResponse(null)
    setError(null)
    setProcessedChunks(null)
    setProcessedImage(null)
    if (file) {
      const fileInfo = detectFileType(file)
      console.log('Arquivo detectado:', fileInfo)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile || !message.trim()) {
      setError('Por favor, selecione um arquivo e digite uma mensagem')
      return
    }

    setIsLoading(true)
    setError(null)
    setAiResponse(null)

    try {
      // Processar arquivo baseado no tipo
      setProcessingStep('Detectando tipo de arquivo...')
      const fileInfo = detectFileType(selectedFile)

      if (fileInfo.type === 'unsupported') {
        throw new Error(`Tipo de arquivo não suportado: ${fileInfo.extension}`)
      }

      setProcessingStep(`Processando ${fileInfo.type}...`)
      const processedFile: ProcessedFile = await processFile(
        selectedFile,
        message,
      )

      // Atualizar estado para exibir no frontend
      if (processedFile.pdfTextChunks) {
        setProcessedChunks(processedFile.pdfTextChunks)
      }
      if (processedFile.image) {
        setProcessedImage(processedFile.image)
      }

      // Montar payload completo para o endpoint /api/ai/generate/all
      setProcessingStep('Enviando para IA...')
      const payload = {
        text: processedFile.text,
        image: processedFile.image || '',
        pdfTextChunks: processedFile.pdfTextChunks || [],
        quantidadeQuestoes: 5, // ou outro valor padrão/configurável
        quantidadeFlashcards: 5, // ou outro valor padrão/configurável
        detalhamento: 'intermediario' as const, // ou 'intermediario', 'detalhado', conforme desejado
        temperatura: 0.3,
      }

      console.log('Payload enviado:', payload)

      // Enviar para o endpoint correto /api/ai/generate/all
      const response = await generateAll(payload)
      setAiResponse(response)
      setProcessingStep('')

      // Limpar campos após sucesso
      setSelectedFile(null)
      setMessage('')
      const fileInput = document.getElementById(
        'file-input',
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Erro ao processar:', error)

      if (error instanceof ApiException) {
        setError(`Erro da API: ${error.apiError.message}`)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro desconhecido ao processar arquivo')
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
              Envie imagens, PDFs ou documentos com sua pergunta
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input de arquivo */}
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

            {/* Campo de mensagem */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                💬 Sua pergunta para a IA
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: O que você vê nesta imagem? Resuma este PDF. Explique este documento..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
              disabled={!selectedFile || !message.trim() || isLoading}
              className="w-full h-12 text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  ⏳ {processingStep || 'Processando...'}
                </span>
              ) : (
                '🚀 Enviar para IA'
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

        {/* Card de resposta */}
        {aiResponse && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg text-green-700">
                🤖 Resposta da IA
              </CardTitle>
              <p className="text-sm text-gray-500">
                Modelo: {aiResponse.model} | Respondido em:{' '}
                {new Date(aiResponse.timestamp).toLocaleString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded border">
                  {aiResponse.response}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default UploadPage
