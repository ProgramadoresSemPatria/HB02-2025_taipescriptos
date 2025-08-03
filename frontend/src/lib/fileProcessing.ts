import * as pdfjsLib from 'pdfjs-dist'

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`

export interface FileTypeInfo {
  type: 'image' | 'pdf' | 'docx' | 'text' | 'unsupported'
  mimeType: string
  extension: string
}

export interface ProcessedFile {
  text: string
  image?: string
  pdfTextChunks?: string[]
  fileInfo: FileTypeInfo
}

export function detectFileType(file: File): FileTypeInfo {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const mimeType = file.type.toLowerCase()

  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)
  ) {
    return { type: 'image', mimeType, extension }
  }
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return { type: 'pdf', mimeType, extension }
  }
  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ['docx', 'doc'].includes(extension)
  ) {
    return { type: 'docx', mimeType, extension }
  }
  if (
    mimeType.startsWith('text/') ||
    ['txt', 'md', 'csv'].includes(extension)
  ) {
    return { type: 'text', mimeType, extension }
  }
  return { type: 'unsupported', mimeType, extension }
}

/**
 * Mapeia o tipo detectado para o tipo do banco de dados
 */
export function mapFileTypeForDatabase(
  detectedType: string,
): 'pdf' | 'docx' | 'txt' | 'raw' | 'image' {
  switch (detectedType) {
    case 'image':
      return 'image'
    case 'pdf':
      return 'pdf'
    case 'docx':
      return 'docx'
    case 'text':
      return 'txt' // Mapeia 'text' para 'txt'
    default:
      return 'raw'
  }
}

export function resizeImageToBase64(
  file: File,
  maxSize = 512,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return reject(new Error('Não foi possível obter contexto do canvas'))

    img.onload = () => {
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
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export async function extractTextFromPDF(
  file: File,
  maxChunkSize = 4000,
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += `\n\n--- Página ${pageNum} ---\n${pageText}`
  }
  const chunks = splitTextIntoChunks(fullText.trim(), maxChunkSize)
  return chunks.length > 50 ? chunks.slice(0, 50) : chunks
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de texto'))
    reader.readAsText(file)
  })
}

function splitTextIntoChunks(text: string, maxSize: number): string[] {
  if (text.length <= maxSize) return [text]
  const chunks: string[] = []
  let currentPosition = 0
  while (currentPosition < text.length) {
    let endPosition = currentPosition + maxSize
    if (endPosition < text.length) {
      const lastSpaceIndex = text.lastIndexOf(' ', endPosition)
      const lastBreakIndex = text.lastIndexOf('\n', endPosition)
      const breakIndex = Math.max(lastSpaceIndex, lastBreakIndex)
      if (breakIndex > currentPosition) endPosition = breakIndex
    }
    const chunk = text.slice(currentPosition, endPosition).trim()
    if (chunk) chunks.push(chunk)
    currentPosition = endPosition + 1
  }
  return chunks
}

export async function processFile(
  file: File,
  userMessage: string,
): Promise<ProcessedFile> {
  const fileInfo = detectFileType(file)
  const result: ProcessedFile = { text: userMessage, fileInfo }
  switch (fileInfo.type) {
    case 'image':
      result.image = await resizeImageToBase64(file)
      break
    case 'pdf':
      result.pdfTextChunks = await extractTextFromPDF(file)
      break
    case 'text': {
      const textContent = await readTextFile(file)
      const textChunks = splitTextIntoChunks(textContent, 4000)
      result.pdfTextChunks =
        textChunks.length > 50 ? textChunks.slice(0, 50) : textChunks
      break
    }
    case 'docx':
      throw new Error(
        'Processamento de arquivos .docx ainda não implementado. Use PDF ou texto simples.',
      )
    case 'unsupported':
      throw new Error(`Tipo de arquivo não suportado: ${fileInfo.extension}`)
  }
  return result
}
