import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { env } from '../env'
import { SendMessageBody, AIResponse } from '../schemas/ai.schema'

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