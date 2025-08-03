import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import FeaturesSection from '@/components/FeaturesSection'
import Footer from '@/components/Footer'
import { FloatingThemeToggle } from '@/components/FloatingThemeToggle'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
      </main>
      <Footer />
      <FloatingThemeToggle />
    </div>
  )
}
