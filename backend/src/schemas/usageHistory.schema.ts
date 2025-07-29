import { z } from 'zod'

// Schema para validar UUID
const uuidSchema = z.uuid('ID deve ser um UUID válido')
