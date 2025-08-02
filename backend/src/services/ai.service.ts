import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage } from '@langchain/core/messages'
import { env } from '../env'
import {
  SendMessageBody,
  SendMultimodalBody,
  AIResponse,
} from '../schemas/ai.schema'

class AIService {
  private model: ChatGoogleGenerativeAI

  constructor() {
    this.model = this.initializeModel()
  }

  private initializeModel(): ChatGoogleGenerativeAI {
    if (!env.GOOGLE_API_KEY) {
      throw new Error(
        'GOOGLE_API_KEY é obrigatória para usar o Google Generative AI',
      )
    }

    console.log(
      '🚀 Inicializando Google Generative AI com modelo Gemini 2.5 Flash',
    )
    return new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      apiKey: env.GOOGLE_API_KEY,
    })
  }

  /**
   * Envia mensagem para a IA e retorna a resposta
   */
  async sendMessage(data: SendMessageBody): Promise<AIResponse> {
    try {
      const { message, temperature = 0.7 } = data

      // Atualiza a temperatura do modelo
      this.model.temperature = temperature

      // Faz a chamada para a IA
      const response = await this.model.invoke(message)

      // Extrai o conteúdo da resposta
      const aiResponse = response.content as string

      // Determina o modelo usado
      const modelName = this.getModelName()

      return {
        response: aiResponse,
        model: modelName,
        timestamp: new Date().toISOString(),
        inputMessage: message,
      }
    } catch (error) {
      console.error('Erro ao comunicar com a IA:', error)
      throw new Error(
        `Erro na comunicação com a IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  /**
   * Envia conteúdo multimodal (texto + imagem + PDF chunks) para a IA
   */
  async sendMultimodal(data: SendMultimodalBody): Promise<AIResponse> {
    try {
      const { text, image, pdfTextChunks, temperature = 0.7 } = data

      // Atualiza a temperatura do modelo
      this.model.temperature = temperature

      // Constrói o prompt multimodal
      let fullPrompt = text

      // Adiciona contexto de PDFs se fornecido
      if (pdfTextChunks && pdfTextChunks.length > 0) {
        fullPrompt += '\n\n📄 **Contexto do PDF:**\n'
        pdfTextChunks.forEach((chunk, index) => {
          fullPrompt += `\n**Chunk ${index + 1}:**\n${chunk}\n`
        })
        fullPrompt += '\n---\n'
      }

      // Cria a mensagem multimodal
      const messageContent: any[] = [
        {
          type: 'text',
          text: fullPrompt,
        },
      ]

      // Adiciona imagem se fornecida
      if (image) {
        // Remove o prefixo data:image/type;base64, para obter apenas o base64
        const base64Data = image.split(',')[1]
        const mimeType = image.split(';')[0].split(':')[1]

        if (base64Data && mimeType) {
          messageContent.push({
            type: 'image_url',
            image_url: image, // LangChain Google GenAI aceita data URL diretamente
          })
        }
      }

      // Cria a mensagem Human com conteúdo multimodal
      const humanMessage = new HumanMessage({
        content: messageContent,
      })

      // Faz a chamada para a IA
      const response = await this.model.invoke([humanMessage])

      // Extrai o conteúdo da resposta
      const aiResponse = response.content as string

      // Determina o modelo usado
      const modelName = this.getModelName()

      return {
        response: aiResponse,
        model: modelName,
        timestamp: new Date().toISOString(),
        inputMessage: text,
      }
    } catch (error) {
      console.error('Erro ao comunicar com a IA (multimodal):', error)
      throw new Error(
        `Erro na comunicação multimodal com a IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  /**
   * Retorna o nome do modelo atualmente em uso
   */
  private getModelName(): string {
    return 'gemini-2.0-flash-exp (Google GenAI)'
  }

  /**
   * Verifica o status da conexão com a IA
   */
  async checkStatus(): Promise<{
    status: 'connected' | 'disconnected'
    model: string
    timestamp: string
  }> {
    const modelName = this.getModelName()

    try {
      // Tenta fazer uma chamada simples para verificar a conexão
      await this.model.invoke('teste')

      return {
        status: 'connected',
        model: modelName,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Erro na verificação de status da IA:', error)
      return {
        status: 'disconnected',
        model: modelName,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

export const aiService = new AIService()
