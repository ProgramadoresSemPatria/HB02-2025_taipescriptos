import ReturnButton from '@/components/ui/ReturnButton'
import RegisterForm from '@/components/auth/RegisterForm'

const RegisterPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
      <div className="absolute top-4 left-4">
        {' '}
        <ReturnButton />
      </div>
    </div>
  )
}

export default RegisterPage
