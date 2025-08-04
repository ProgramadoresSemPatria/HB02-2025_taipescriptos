import { StudyCard } from '@/components/StudyCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStudyMaterials } from '@/hooks/useStudyMaterials'
import { useState } from 'react'

export function HomePage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { materials, loading, error } = useStudyMaterials()

  // Filtrar materiais com base na busca
  const filteredMaterials = materials.filter((material) =>
    material.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Transformar dados para o formato esperado pelo StudyCard
  const studies = filteredMaterials.map((material) => ({
    id: material.id,
    title: material.filename.replace(/\.[^/.]+$/, ''), // Remove extensão do arquivo
    createdAt: new Date(material.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus estudos...</p>
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
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar estudos: {error}</p>
          <Button
            className="text-primary-foreground dark:text-foreground"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
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
      <div className="bg-background">
        <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Meus Estudos
                </h1>
                <p className="text-muted-foreground">
                  Organize e revise seu conhecimento
                </p>
              </div>

              <Button
                variant="default"
                size="lg"
                className="gap-2 shadow-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground hover:scale-[1.03] transition-all cursor-pointer min-w-8 duration-200 ease-linear"
                onClick={() => navigate('/dashboard/uploadpage')}
              >
                <Plus className="w-5 h-5" />
                Novo Estudo
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center flex-col md:flex-row md:justify-between flex-grow">
            <div className="relative max-w-md flex-grow">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar estudos..."
                className="pl-10 bg-transparent border-border/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-foreground rounded-4xl py-2 px-4 text-sm font-medium underline-offset-2 underline">
              {studies.length} estudos criados
            </p>
          </div>

          {studies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                Nenhum estudo encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'Nenhum estudo corresponde à sua busca.'
                  : 'Comece criando seu primeiro material de estudo!'}
              </p>
              <Button
                onClick={() => navigate('/dashboard/uploadpage')}
                className="gap-2 text-primary-foreground dark:text-foreground"
              >
                <Plus className="w-4 h-4" />
                <span className="text-primary-foreground dark:text-foreground">
                  Criar Primeiro Estudo
                </span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studies.map((study) => (
                <StudyCard key={study.id} {...study} />
              ))}
            </div>
          )}
        </main>
      </div>
    </motion.div>
  )
}
