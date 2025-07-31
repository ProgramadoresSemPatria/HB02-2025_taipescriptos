import { ArrowLeft } from 'lucide-react'

const ReturnButton = () => {
  return (
    <div>
      <ArrowLeft
        className="h-6 w-6 cursor-pointer text-white hover:text-gray-300"
        onClick={() => window.location.href = "/"}
      />
    </div>
  )
}

export default ReturnButton
