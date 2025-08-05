import { useState } from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone'
import { AIInput, AIInputTextarea } from '@/components/ui/kibo-ui/ai/input'
import {
  detectFileType,
  processFile,
  type ProcessedFile,
} from '@/services/fileProcessing'
import {
  createUploadWithStudyMaterial,
  createFileUploadWithStudyMaterial,
  ApiException,
} from '@/services/aiServices'
import { motion } from 'framer-motion'
import { FileText, Brain, BookOpen, Upload, Type } from 'lucide-react'
import { toast } from 'sonner'
import { OnStudySuccess } from '@/components/OnStudySuccess'

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [selectedFiles, setSelectedFiles] = useState<File[] | undefined>()
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  const handleDrop = (files: File[]) => {
    console.log(files)
    setSelectedFiles(files)
    if (files.length > 0) {
      setSelectedFile(files[0])
      const fileInfo = detectFileType(files[0])
      console.log('Arquivo detectado:', fileInfo)
      setMessage('') // Limpa texto quando arquivo é selecionado
    }
  }

  const handleModeChange = (mode: 'file' | 'text') => {
    setInputMode(mode)
    setSelectedFile(null)
    setSelectedFiles(undefined)
    setMessage('')
  }

  const handleSubmit = async () => {
    // Validação: apenas texto OU arquivo
    if (inputMode === 'file' && !selectedFile) {
      return
    }
    if (inputMode === 'text' && !message.trim()) {
      return
    }

    setIsLoading(true)

    try {
      let filename: string
      let contentText: string
      let fileType: 'pdf' | 'docx' | 'txt' | 'raw' | 'image'

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

        // Processar arquivo baseado no tipo

        filename = selectedFile.name
        contentText = processedFile.text
        fileType =
          fileInfo.type === 'image'
            ? 'image'
            : fileInfo.type === 'pdf'
              ? 'pdf'
              : fileInfo.type === 'text'
                ? 'txt'
                : 'raw'
      } else {
        // Modo texto
        filename = `Texto_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
        contentText = message
        fileType = 'txt'
      }

      // Usar o novo endpoint que salva tudo no banco de dados
      setProcessingStep('Criando material de estudo completo...')

      let response
      if (inputMode === 'file' && selectedFile) {
        // Upload direto do arquivo - mais eficiente
        response = await createFileUploadWithStudyMaterial(
          selectedFile,
          'pt-br',
          'all',
        )
      } else {
        // Modo texto - usar endpoint JSON
        response = await createUploadWithStudyMaterial({
          filename,
          contentText,
          type: fileType,
        })
      }

      // Processar resposta

      setProcessingStep('')

      // Verificar se o ID do studyMaterial está disponível
      const studyMaterialId = response.data.studyMaterial?.id
      if (!studyMaterialId) {
        console.error(
          'ID do StudyMaterial não encontrado na resposta:',
          response.data,
        )
        return
      }

      console.log('✅ Material de estudo criado com ID:', studyMaterialId)

      // Mostrar mensagem de sucesso e redirecionar após 3 segundos
      setProcessingStep(
        'Material de estudo criado com sucesso! Redirecionando...',
      )

      toast.success('Material de estudo criado com sucesso! Redirecionando...')

      setTimeout(() => {
        // Redirecionar para o estudo específico usando o ID
        console.log(
          '🔄 Redirecionando para:',
          `/dashboard/study/${studyMaterialId}`,
        )
        setIsSuccessDialogOpen(true)
      }, 3000)

      // Limpar campos após sucesso
      if (inputMode === 'file') {
        setSelectedFile(null)
        setSelectedFiles(undefined)
      } else {
        setMessage('')
      }
    } catch (error) {
      setIsSuccessDialogOpen(true)
      console.error('Erro ao processar:', error)

      if (error instanceof ApiException) {
        toast.error(`Erro da API: ${error.apiError.message}`)
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro desconhecido ao processar')
      }
    } finally {
      setIsSuccessDialogOpen(true)
      setIsLoading(false)
      setProcessingStep('')
    }
  }

  const getSupportedFormats = () => {
    return 'Imagens (JPG, PNG, GIF, WebP), PDFs, arquivos de texto (TXT, MD)'
  }

  const inputModes = [
    {
      mode: 'file' as const,
      label: 'Enviar Arquivo',
      icon: Upload,
      description: 'Anexe um arquivo para processar',
    },
    {
      mode: 'text' as const,
      label: 'Digite Texto',
      icon: Type,
      description: 'Digite o conteúdo diretamente',
    },
  ]

  const studyTypes = [
    {
      type: 'quiz',
      label: 'Quiz',
      icon: Brain,
      description: 'Questões de múltipla escolha',
    },
    {
      type: 'flashcards',
      label: 'Flashcards',
      icon: BookOpen,
      description: 'Cartões para memorização',
    },
    {
      type: 'sumario',
      label: 'Sumário',
      icon: FileText,
      description: 'Resumo estruturado',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-h-full justify-center p-4">
        <div className="flex flex-col justify-center gap-12 p-6 max-w-4xl w-full">
          {isSuccessDialogOpen && (
            <OnStudySuccess
              isSuccessDialogOpen={isSuccessDialogOpen}
              setIsSuccessDialogOpen={setIsSuccessDialogOpen}
            />
          )}

          <div>
            <div className="text-center gap-2 flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">
                IA Multimodal - Studdy Buddy
              </h1>
              <p className="text-muted-foreground mt-1">
                Gere quiz, flashcards e resumos através de arquivos ou texto
              </p>

              {/* Seletor de modo */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-3">
                  Modo de entrada
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inputModes.map(
                    ({ mode, label, icon: Icon, description }) => (
                      <Card
                        key={mode}
                        className={`flex justify-center items-center flex-col h-auto p-4 gap-3 cursor-pointer transition-colors ${
                          inputMode === mode ? 'border-primary' : ''
                        }`}
                        onClick={() => handleModeChange(mode)}
                      >
                        <Icon size={24} />
                        <div className="text-center">
                          <div className="font-semibold text-sm sm:text-base">
                            {label}
                          </div>
                          <div className="text-sm sm:text-xs opacity-70">
                            {description}
                          </div>
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </div>

              {/* Tipos de estudo */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-3">
                  Tipos de Material
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {studyTypes.map(
                    ({ type, label, icon: Icon, description }) => (
                      <Card
                        key={type}
                        className="flex justify-center items-center flex-col h-auto p-4 gap-3"
                      >
                        <Icon size={24} />
                        <div className="text-center">
                          <div className="font-semibold text-sm sm:text-base">
                            {label}
                          </div>
                          <div className="text-sm sm:text-xs opacity-70">
                            {description}
                          </div>
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-center items-center flex-col gap-4">
              {/* Input de arquivo (apenas se modo = file) */}
              {inputMode === 'file' && (
                <div className="w-full">
                  <Dropzone
                    accept={{
                      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                      'application/pdf': ['.pdf'],
                      'text/*': ['.txt', '.md'],
                    }}
                    maxFiles={1}
                    maxSize={1024 * 1024 * 10}
                    minSize={1024}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={selectedFiles}
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Formatos suportados: {getSupportedFormats()}
                  </p>
                  {selectedFile && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>
                          <p className="text-sm font-semiboldtext-muted-foreground">
                            {selectedFile.name}
                          </p>
                        </CardTitle>
                        <CardDescription>
                          <p className="text-sm text-muted-foreground">
                            Tipo: {detectFileType(selectedFile).type} | Tamanho:{' '}
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </div>
              )}

              {/* Campo de texto (apenas se modo = text) */}
              {inputMode === 'text' && (
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2">
                    Digite seu texto
                  </label>
                  <AIInput>
                    <AIInputTextarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite o texto que você quer usar para gerar quiz, flashcards e resumo..."
                      disabled={isLoading}
                      className="min-h-[120px]"
                    />
                  </AIInput>
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
                  <span className="flex items-center text-primary-foreground dark:text-foreground justify-center gap-2">
                    {processingStep || 'Processando...'}
                  </span>
                ) : (
                  <span className="text-primary-foreground dark:text-foreground">
                    Gerar Material de Estudo
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default UploadPage
