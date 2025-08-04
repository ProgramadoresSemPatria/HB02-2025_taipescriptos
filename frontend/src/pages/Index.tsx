import { ResumoSection } from '@/components/ResumeSection'
import { QuizSection } from '@/components/QuizSection'
import { FlashcardsSection } from '@/components/FlashCardsSection'
import { motion } from 'framer-motion'
import { useStudyMaterials } from '@/hooks/useStudyMaterials'
import { useState, useEffect } from 'react'
import { StudyMaterial } from '@/services/aiServices'

const Index = () => {
  const { materials, loading, error } = useStudyMaterials()
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null)

  // Selecionar o primeiro material quando os dados carregarem
  useEffect(() => {
    if (materials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materials[0])
    }
  }, [materials, selectedMaterial])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Carregando materiais de estudo...
          </p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Erro ao carregar materiais: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </motion.div>
    )
  }

  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            Nenhum material de estudo encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            Faça upload de um arquivo para gerar resumos, quiz e flashcards
            automaticamente.
          </p>
          <a
            href="/dashboard/uploadpage"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Fazer Upload
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen bg-background flex">
        {/* Main Content */}
        <main className="flex-1 ml-72 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Material Selector */}
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">
                Selecionar Material de Estudo
              </h2>
              <div className="space-y-2">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedMaterial?.id === material.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    <div className="font-medium">{material.filename}</div>
                    <div className="text-sm opacity-70">
                      Criado em:{' '}
                      {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            {selectedMaterial && (
              <div className="space-y-16">
                <ResumoSection summary={selectedMaterial.summary} />
                <QuizSection quiz={selectedMaterial.quiz} />
                <FlashcardsSection flashcards={selectedMaterial.flashcards} />
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default Index
