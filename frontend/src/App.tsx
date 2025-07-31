import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Router } from './Router'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ThemeProvider>
  )
}
