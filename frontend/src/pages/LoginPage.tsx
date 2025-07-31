import ReturnButton from '@/components/ui/ReturnButton'
import LoginForm from '@/components/auth/LoginForm'

const LoginPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
      <div className="absolute top-4 left-4">
        {' '}
        <ReturnButton />
      </div>
    </div>
  )
}

export default LoginPage
