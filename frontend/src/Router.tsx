import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AccountPage } from './pages/AccountPage'
import Index from './pages/Index'
import UploadPage from './pages/UploadPage'
import NewUploadPage from './pages/NewUploadPage'
import { StudyDetailPage } from './pages/StudyDetailPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/" element={<HomePage />} />
        <Route path="/dashboard/account" element={<AccountPage />} />
        <Route path="/dashboard/study" element={<Index />} />
        <Route path="/dashboard/study/:id" element={<StudyDetailPage />} />
        <Route path="/dashboard/uploadpage" element={<NewUploadPage />} />
      </Route>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
