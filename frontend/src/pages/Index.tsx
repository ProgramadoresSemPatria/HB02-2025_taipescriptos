import { ResumoSection } from '@/components/ResumeSection'
import { QuizSection } from '@/components/QuizSection'
import { FlashcardsSection } from '@/components/FlashCardsSection'

const Index = () => {
  return (
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
  )
}

export default Index
