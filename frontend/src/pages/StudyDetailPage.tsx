import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Brain, Zap } from 'lucide-react'
import {
  getStudyMaterialById,
  StudyMaterialDetailed,
} from '@/services/aiServices'
import { QuizSection } from '@/components/QuizSection'
import { ResumoSection } from '@/components/ResumeSection'
import { FlashcardsSection } from '@/components/FlashCardsSection'

export function StudyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [material, setMaterial] = useState<StudyMaterialDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards'>(
    'summary',
  )

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }

    const fetchMaterial = async () => {
      try {
        setLoading(true)
        const data = await getStudyMaterialById(id)
        setMaterial(data)
      } catch (err) {
        console.error('Erro ao carregar material:', err)
        setError('Erro ao carregar o material de estudo')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()
  }, [id, navigate])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Carregando material de estudo...
          </p>
        </div>
      </motion.div>
    )
  }

  if (error || !material) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || 'Material não encontrado'}
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </motion.div>
    )
  }

  const title = material.filename.replace(/\.[^/.]+$/, '') // Remove extensão

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30"
    >
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">
                Criado em{' '}
                {new Date(material.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          <Button
            variant={activeTab === 'summary' ? 'default' : 'outline'}
            onClick={() => setActiveTab('summary')}
            className="gap-2 justify-start"
          >
            <BookOpen className="w-4 h-4" />
            Resumo
          </Button>
          <Button
            variant={activeTab === 'quiz' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quiz')}
            className="gap-2 justify-start"
          >
            <Brain className="w-4 h-4" />
            Quiz
          </Button>
          <Button
            variant={activeTab === 'flashcards' ? 'default' : 'outline'}
            onClick={() => setActiveTab('flashcards')}
            className="gap-2 justify-start"
          >
            <Zap className="w-4 h-4" />
            Flashcards
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'summary' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResumoSection summary={material.summary} />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizSection quiz={material.quiz} />
            </motion.div>
          )}

          {activeTab === 'flashcards' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FlashcardsSection flashcards={material.flashcards} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
