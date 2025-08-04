import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Router } from './Router'
import { AuthProvider } from './hooks/useAuth'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
