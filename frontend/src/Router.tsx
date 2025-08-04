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

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard/" element={<HomePage />} />
        <Route path="/dashboard/account" element={<AccountPage />} />
        <Route path="/dashboard/study" element={<Index />} />
        <Route path="/dashboard/uploadpage" element={<NewUploadPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  )
}
