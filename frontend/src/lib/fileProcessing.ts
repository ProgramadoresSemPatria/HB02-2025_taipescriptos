import * as pdfjsLib from 'pdfjs-dist'

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`

/**
 * Tipos de arquivo suportados
 */
export interface FileTypeInfo {
  type: 'image' | 'pdf' | 'docx' | 'text' | 'unsupported'
  mimeType: string
  extension: string
}

/**
 * Resultado do processamento de arquivo
 */
export interface ProcessedFile {
  text: string
  image?: string
  pdfTextChunks?: string[]
  fileInfo: FileTypeInfo
}

/**
 * Detecta o tipo de arquivo baseado no nome e tipo MIME
 */
export function detectFileType(file: File): FileTypeInfo {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const mimeType = file.type.toLowerCase()

  // Imagens
  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)
  ) {
    return {
      type: 'image',
      mimeType,
      extension,
    }
  }

  // PDFs
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return {
      type: 'pdf',
      mimeType,
      extension,
    }
  }

  // Documentos Word
  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ['docx', 'doc'].includes(extension)
  ) {
    return {
      type: 'docx',
      mimeType,
      extension,
    }
  }

  // Arquivos de texto
  if (
    mimeType.startsWith('text/') ||
    ['txt', 'md', 'csv'].includes(extension)
  ) {
    return {
      type: 'text',
      mimeType,
      extension,
    }
  }

  return {
    type: 'unsupported',
    mimeType,
    extension,
  }
}

/**
 * Redimensiona uma imagem para 512x512 e converte para Base64
 */
export function resizeImageToBase64(
  file: File,
  maxSize = 512,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Não foi possível obter contexto do canvas'))
      return
    }

    img.onload = () => {
      // Calcular dimensões mantendo proporção
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Converter para Base64
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      resolve(base64)
    }

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'))
    }

    // Carregar imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Extrai texto de um PDF e divide em chunks
 */
export async function extractTextFromPDF(
  file: File,
  maxChunkSize = 4000,
): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''

    // Extrair texto de todas as páginas
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items.map((item: any) => item.str).join(' ')

      fullText += `\n\n--- Página ${pageNum} ---\n${pageText}`
    }

    // Dividir em chunks
    const chunks = splitTextIntoChunks(fullText.trim(), maxChunkSize)

    // Limitar a 50 chunks para evitar erro de validação
    if (chunks.length > 50) {
      console.warn(
        `PDF gerou ${chunks.length} chunks, limitando a 50 primeiros`,
      )
      return chunks.slice(0, 50)
    }

    return chunks
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error('Não foi possível extrair texto do PDF')
  }
}

/**
 * Lê o conteúdo de um arquivo de texto
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target?.result as string
      resolve(text)
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo de texto'))
    }

    reader.readAsText(file)
  })
}

/**
 * Divide texto em chunks menores
 */
function splitTextIntoChunks(text: string, maxSize: number): string[] {
  if (text.length <= maxSize) {
    return [text]
  }

  const chunks: string[] = []
  let currentPosition = 0

  while (currentPosition < text.length) {
    let endPosition = currentPosition + maxSize

    // Se não é o último chunk, tenta quebrar em uma palavra
    if (endPosition < text.length) {
      const lastSpaceIndex = text.lastIndexOf(' ', endPosition)
      const lastBreakIndex = text.lastIndexOf('\n', endPosition)

      const breakIndex = Math.max(lastSpaceIndex, lastBreakIndex)
      if (breakIndex > currentPosition) {
        endPosition = breakIndex
      }
    }

    const chunk = text.slice(currentPosition, endPosition).trim()
    if (chunk) {
      chunks.push(chunk)
    }

    currentPosition = endPosition + 1
  }

  return chunks
}

/**
 * Processa arquivo completo baseado no tipo detectado
 */
export async function processFile(
  file: File,
  userMessage: string,
): Promise<ProcessedFile> {
  const fileInfo = detectFileType(file)

  const result: ProcessedFile = {
    text: userMessage,
    fileInfo,
  }

  try {
    switch (fileInfo.type) {
      case 'image':
        result.image = await resizeImageToBase64(file)
        break

      case 'pdf':
        result.pdfTextChunks = await extractTextFromPDF(file)
        break

      case 'text':
        const textContent = await readTextFile(file)
        const textChunks = splitTextIntoChunks(textContent, 4000)

        // Limitar a 50 chunks
        if (textChunks.length > 50) {
          console.warn(
            `Arquivo de texto gerou ${textChunks.length} chunks, limitando a 50 primeiros`,
          )
          result.pdfTextChunks = textChunks.slice(0, 50)
        } else {
          result.pdfTextChunks = textChunks
        }
        break

      case 'docx':
        throw new Error(
          'Processamento de arquivos .docx ainda não implementado. Use PDF ou texto simples.',
        )

      case 'unsupported':
        throw new Error(`Tipo de arquivo não suportado: ${fileInfo.extension}`)
    }

    return result
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    throw error
  }
}
