import { ArrowLeft } from 'lucide-react'

const ReturnButton = () => {
  return (
    <div>
      <ArrowLeft
        className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={() => window.location.href = "/"}
      />
    </div>
  )
}

export default ReturnButton
