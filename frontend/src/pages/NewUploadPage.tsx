import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { PlusIcon } from 'lucide-react'
import { type FormEventHandler } from 'react'

const NewUploadPage = () => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    console.log(event)
  }
  return (
    <div className="flex min-h-full justify-center items-center">
      <div className="flex flex-col gap-6 p-6 max-w-xl w-full justify-between">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Gere um novo estudo
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie imagens, PDFs ou documentos com sua pergunta
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea />
            <AIInputToolbar className="flex items-end">
              <AIInputTools>
                <AIInputButton>
                  <PlusIcon size={16} />
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit />
            </AIInputToolbar>
          </AIInput>
        </div>
      </div>
    </div>
  )
}
export default NewUploadPage
