import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Router } from './Router'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from 'sonner'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors />
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
