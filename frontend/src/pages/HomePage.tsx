import { StudyCard } from '@/components/StudyCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const mockStudies = [
  {
    id: '1',
    title: 'Revolução Francesa',
    createdAt: '15 Jan 2024',
  },
  {
    id: '2',
    title: 'Funções Quadráticas',
    createdAt: '12 Jan 2024',
  },
  {
    id: '3',
    title: 'Fotossíntese',
    createdAt: '10 Jan 2024',
  },
  {
    id: '4',
    title: 'Shakespeare e Romantismo',
    createdAt: '08 Jan 2024',
  },
  {
    id: '5',
    title: 'Leis de Newton',
    createdAt: '05 Jan 2024',
  },
  {
    id: '6',
    title: 'Guerra Fria',
    createdAt: '03 Jan 2024',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-br from-background via-background to-muted/30">
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
                onClick={() => navigate('/uploadpage')}
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
              />
            </div>
            <p className="text-foreground rounded-4xl py-2 px-4 text-sm font-medium underline-offset-2 underline">
              {mockStudies.length} estudos criados
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStudies.map((study) => (
              <StudyCard key={study.id} {...study} />
            ))}
          </div>
        </main>
      </div>
    </motion.div>
  )
}
