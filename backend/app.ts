import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from './src/env'
import { fileUploadRoutes } from './src/routes/fileUpload.routes'
import { usageHistoryRoutes } from './src/routes/usageHistory.routes'
import { usersRoutes } from './src/routes/user.routes'
import { aiRoutes } from './src/routes/ai.routes'
import { studyMaterialRoutes } from './src/routes/studyMaterial.routes'
import { ZodError } from 'zod'
import { fileUploadSchemaSwagger } from './src/schemas/fileUpload.schema'

export const app = fastify()

app.addSchema({
  $id: 'FileUpload',
  ...fileUploadSchemaSwagger,
})

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Projeto Hackathon API',
      description:
        'API do Studdy Buddy, um projeto desenvolvido para o Hackathon da Base.',
      version: '1.0.0',
    },
    servers: [
      {
        url:
          env.NODE_ENV === 'production'
            ? 'https://api.exemplo.com'
            : `http://localhost:${env.PORT}`,
        description:
          env.NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação',
        },
      },
    },
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
})

app.register(fastifyJwt, { secret: env.JWT_SECRET })

app.register(fastifyMultipart)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
})

app.register(usersRoutes, { prefix: '/api/users' })
app.register(usageHistoryRoutes, { prefix: '/api/usage-history' })
app.register(fileUploadRoutes, { prefix: '/api/uploads' })
app.register(aiRoutes, { prefix: '/api/ai' })
app.register(studyMaterialRoutes, { prefix: '/api/study-materials' })

app.get('/', async () => {
  return {
    message: 'Projeto Hackathon API',
    version: '1.0.0',
    docs: '/docs',
    status: 'running',
  }
})

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }
  return reply.status(500).send({ message: 'Internal server error.' })
})

// Ready hook
app.ready(() => {
  console.log('📚 API Documentation available at: /docs')
  console.log('🔗 Swagger JSON available at: /docs/json')
})
