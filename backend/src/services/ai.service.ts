import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage } from '@langchain/core/messages'
import { env } from '../env'
import {
  SendMessageBody,
  SendMultimodalBody,
  AIResponse,
  QuizResponse,
  FlashcardsResponse,
  SumarioResponse,
  quizResponseSchema,
  flashcardsResponseSchema,
  sumarioResponseSchema,
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
      model: 'gemini-2.5-flash',
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
    return 'gemini-2.5-flash (Google GenAI)'
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

  // ===== MÉTODOS PARA GERAÇÃO ESTRUTURADA =====

  /**
   * Gera quiz estruturado baseado em conteúdo multimodal
   */
  async generateQuiz(data: {
    text: string
    image?: string
    pdfTextChunks?: string[]
    quantidadeQuestoes?: number
    temperatura?: number
  }): Promise<QuizResponse> {
    try {
      const {
        text,
        image,
        pdfTextChunks,
        quantidadeQuestoes = 5,
        temperatura = 0.3,
      } = data

      // Prompt especializado para gerar quiz
      const quizPrompt = this.createQuizPrompt(text, quantidadeQuestoes)

      // Configura temperatura para mais consistência
      this.model.temperature = temperatura

      // Constrói o prompt multimodal
      let fullPrompt = quizPrompt

      // Adiciona contexto de PDFs se fornecido
      if (pdfTextChunks && pdfTextChunks.length > 0) {
        fullPrompt += '\n\n📄 **Conteúdo do documento:**\n'
        pdfTextChunks.forEach((chunk, index) => {
          fullPrompt += `\n**Seção ${index + 1}:**\n${chunk}\n`
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
        messageContent.push({
          type: 'image_url',
          image_url: image,
        })
      }

      // Cria a mensagem Human com conteúdo multimodal
      const humanMessage = new HumanMessage({
        content: messageContent,
      })

      // Faz a chamada para a IA
      const response = await this.model.invoke([humanMessage])
      const aiResponse = response.content as string

      // Processa a resposta JSON
      const quizData = this.parseJsonResponse(aiResponse)

      // Valida e retorna a resposta estruturada
      const validatedQuiz = quizResponseSchema.parse({
        ...quizData,
        modelo: this.getModelName(),
        timestamp: new Date().toISOString(),
        fonte: this.determineFonte(!!image, !!pdfTextChunks),
      })

      return validatedQuiz
    } catch (error) {
      console.error('Erro ao gerar quiz:', error)
      throw new Error(
        `Erro na geração do quiz: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  /**
   * Gera flashcards estruturados baseado em conteúdo multimodal
   */
  async generateFlashcards(data: {
    text: string
    image?: string
    pdfTextChunks?: string[]
    quantidadeFlashcards?: number
    temperatura?: number
  }): Promise<FlashcardsResponse> {
    try {
      const {
        text,
        image,
        pdfTextChunks,
        quantidadeFlashcards = 10,
        temperatura = 0.3,
      } = data

      // Prompt especializado para gerar flashcards
      const flashcardsPrompt = this.createFlashcardsPrompt(
        text,
        quantidadeFlashcards,
      )

      // Configura temperatura
      this.model.temperature = temperatura

      // Constrói o prompt multimodal
      let fullPrompt = flashcardsPrompt

      // Adiciona contexto de PDFs se fornecido
      if (pdfTextChunks && pdfTextChunks.length > 0) {
        fullPrompt += '\n\n📄 **Conteúdo do documento:**\n'
        pdfTextChunks.forEach((chunk, index) => {
          fullPrompt += `\n**Seção ${index + 1}:**\n${chunk}\n`
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
        messageContent.push({
          type: 'image_url',
          image_url: image,
        })
      }

      // Cria a mensagem Human com conteúdo multimodal
      const humanMessage = new HumanMessage({
        content: messageContent,
      })

      // Faz a chamada para a IA
      const response = await this.model.invoke([humanMessage])
      const aiResponse = response.content as string

      // Processa a resposta JSON
      const flashcardsData = this.parseJsonResponse(aiResponse)

      // Valida e retorna a resposta estruturada
      const validatedFlashcards = flashcardsResponseSchema.parse({
        ...flashcardsData,
        modelo: this.getModelName(),
        timestamp: new Date().toISOString(),
        fonte: this.determineFonte(!!image, !!pdfTextChunks),
      })

      return validatedFlashcards
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error)
      throw new Error(
        `Erro na geração de flashcards: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  /**
   * Gera sumário estruturado baseado em conteúdo multimodal
   */
  async generateSumario(data: {
    text: string
    image?: string
    pdfTextChunks?: string[]
    detalhamento?: 'basico' | 'intermediario' | 'detalhado'
    temperatura?: number
  }): Promise<SumarioResponse> {
    try {
      const {
        text,
        image,
        pdfTextChunks,
        detalhamento = 'intermediario',
        temperatura = 0.3,
      } = data

      // Prompt especializado para gerar sumário
      const sumarioPrompt = this.createSumarioPrompt(text, detalhamento)

      // Configura temperatura
      this.model.temperature = temperatura

      // Constrói o prompt multimodal
      let fullPrompt = sumarioPrompt

      // Adiciona contexto de PDFs se fornecido
      if (pdfTextChunks && pdfTextChunks.length > 0) {
        fullPrompt += '\n\n📄 **Conteúdo do documento:**\n'
        pdfTextChunks.forEach((chunk, index) => {
          fullPrompt += `\n**Seção ${index + 1}:**\n${chunk}\n`
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
        messageContent.push({
          type: 'image_url',
          image_url: image,
        })
      }

      // Cria a mensagem Human com conteúdo multimodal
      const humanMessage = new HumanMessage({
        content: messageContent,
      })

      // Faz a chamada para a IA
      const response = await this.model.invoke([humanMessage])
      const aiResponse = response.content as string

      // Processa a resposta JSON
      const sumarioData = this.parseJsonResponse(aiResponse)

      // Valida e retorna a resposta estruturada
      const validatedSumario = sumarioResponseSchema.parse({
        ...sumarioData,
        modelo: this.getModelName(),
        timestamp: new Date().toISOString(),
        fonte: this.determineFonte(!!image, !!pdfTextChunks),
      })

      return validatedSumario
    } catch (error) {
      console.error('Erro ao gerar sumário:', error)
      throw new Error(
        `Erro na geração do sumário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Cria prompt especializado para geração de quiz
   */
  private createQuizPrompt(userInput: string, quantidade: number): string {
    return `Você é um especialista em educação e criação de quizzes. Sua tarefa é criar um quiz estruturado baseado no conteúdo fornecido.

**INSTRUÇÕES IMPORTANTES:**
- Crie exatamente ${quantidade} questões de múltipla escolha
- Cada questão deve ter entre 2 e 5 alternativas
- Forneça explicações claras para as respostas corretas
- O quiz deve ser educativo e testar compreensão real do conteúdo
- Responda APENAS com JSON válido, sem texto adicional

**SOLICITAÇÃO DO USUÁRIO:**
${userInput}

**FORMATO DE RESPOSTA (JSON):**
{
  "titulo": "Título do quiz baseado no conteúdo",
  "descricao": "Breve descrição do que o quiz aborda",
  "questoes": [
    {
      "pergunta": "Pergunta clara e objetiva",
      "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "respostaCorreta": 0,
      "explicacao": "Explicação detalhada da resposta correta"
    }
  ]
}`
  }

  /**
   * Cria prompt especializado para geração de flashcards
   */
  private createFlashcardsPrompt(
    userInput: string,
    quantidade: number,
  ): string {
    return `Você é um especialista em técnicas de estudo e memorização. Sua tarefa é criar flashcards educativos baseados no conteúdo fornecido.

**INSTRUÇÕES IMPORTANTES:**
- Crie exatamente ${quantidade} flashcards
- Na "frente" coloque uma pergunta, conceito ou termo (MÍNIMO 5 CARACTERES)
- No "verso" coloque a resposta, definição ou explicação (MÍNIMO 5 CARACTERES)
- Use linguagem clara e concisa, mas sempre com conteúdo substancial
- Categorize por temas quando possível
- Responda APENAS com JSON válido, sem texto adicional
- Certifique-se de que tanto a frente quanto o verso tenham pelo menos 5 caracteres cada

**SOLICITAÇÃO DO USUÁRIO:**
${userInput}

**FORMATO DE RESPOSTA (JSON):**
{
  "titulo": "Título dos flashcards baseado no conteúdo",
  "descricao": "Breve descrição do conjunto de flashcards",
  "flashcards": [
    {
      "frente": "Pergunta ou termo a ser memorizado (mínimo 5 caracteres)",
      "verso": "Resposta ou definição clara (mínimo 5 caracteres)",
      "categoria": "Categoria temática (opcional)",
      "dificuldade": "facil"
    }
  ]
}`
  }

  /**
   * Cria prompt especializado para geração de sumário
   */
  private createSumarioPrompt(
    userInput: string,
    detalhamento: 'basico' | 'intermediario' | 'detalhado',
  ): string {
    const nivelDetalhes: Record<
      'basico' | 'intermediario' | 'detalhado',
      string
    > = {
      basico: 'resumo conciso com pontos principais',
      intermediario:
        'resumo balanceado com tópicos importantes e alguns detalhes',
      detalhado: 'resumo abrangente com análise profunda e exemplos',
    }

    return `Você é um especialista em análise de conteúdo e criação de resumos acadêmicos. Sua tarefa é criar um sumário estruturado baseado no conteúdo fornecido.

**INSTRUÇÕES IMPORTANTES:**
- Crie um ${nivelDetalhes[detalhamento]}
- Identifique os tópicos-chave mais relevantes
- Organize os pontos principais de forma lógica
- Forneça uma conclusão quando apropriado
- Responda APENAS com JSON válido, sem texto adicional

**SOLICITAÇÃO DO USUÁRIO:**
${userInput}

**FORMATO DE RESPOSTA (JSON):**
{
  "titulo": "Título do sumário baseado no conteúdo",
  "resumoExecutivo": "Resumo geral em 2-3 parágrafos",
  "topicosChave": ["Tópico 1", "Tópico 2", "Tópico 3"],
  "pontosPrincipais": [
    {
      "topico": "Nome do tópico principal",
      "descricao": "Descrição detalhada do ponto"
    }
  ],
  "conclusao": "Síntese final e principais takeaways"
}`
  }

  /**
   * Processa resposta JSON da IA
   */
  private parseJsonResponse(response: string): any {
    try {
      // Remove possíveis marcadores de código ou texto adicional
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Nenhum JSON válido encontrado na resposta')
      }

      const jsonString = jsonMatch[0]
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Erro ao fazer parse da resposta JSON:', error)
      console.error('Resposta original:', response)
      throw new Error('Resposta da IA não está em formato JSON válido')
    }
  }

  /**
   * Determina a fonte do conteúdo
   */
  private determineFonte(hasImage: boolean, hasPdf: boolean): string {
    if (hasImage && hasPdf) return 'Imagem + PDF'
    if (hasImage) return 'Imagem'
    if (hasPdf) return 'PDF'
    return 'Texto'
  }
}

export const aiService = new AIService()
