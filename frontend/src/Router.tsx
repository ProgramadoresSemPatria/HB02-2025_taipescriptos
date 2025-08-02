import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AccountPage } from './pages/AccountPage'
import Index from './pages/Index'
import UploadPage from './pages/UploadPage'
import NewUploadPage from './pages/NewUploadPage'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/study" element={<Index />} />
        <Route path="/uploadpage" element={<NewUploadPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  )
}
