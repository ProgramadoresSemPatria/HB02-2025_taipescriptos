import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { env } from './src/env'
import fastifyCors from '@fastify/cors'
import { ZodError } from 'zod'
import { userRoutes } from './src/controllers/users/routes'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { usageHistoryRoutes } from './src/routes/usageHistory.routes'


export const app = fastify()

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
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
})

// ===== ROTAS =====
app.get('/', async () => {
  return {
    message: 'Projeto Hackathon API',
    version: '1.0.0',
    docs: '/docs',
    status: 'running',
  }
})
app.register(usageHistoryRoutes, { prefix: '/api/usage-history' })

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})

app.register(userRoutes)

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

// ===== READY HOOK =====
app.ready(() => {
  console.log('📚 API Documentation available at: /docs')
  console.log('🔗 Swagger JSON available at: /docs/json')
})
