import { ResumoSection } from '@/components/ResumeSection'
import { QuizSection } from '@/components/QuizSection'
import { FlashcardsSection } from '@/components/FlashCardsSection'
import { motion } from 'framer-motion'

const Index = () => {
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
          <div className="max-w-4xl mx-auto space-y-16">
            <ResumoSection />
            <QuizSection />
            <FlashcardsSection />
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default Index
