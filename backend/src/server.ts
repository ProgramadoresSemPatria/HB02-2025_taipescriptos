import { app } from '../app'
import { env } from './env'

// Define a porta usando a variável de ambiente ou valor padrão 3000
const PORT = env.PORT || 3000

app
  .listen({
    host: '0.0.0.0', // necessário para o Render acessar o serviço
    port: PORT,
  })
  .then(() => {
    console.log(`Server is running at http://localhost:${PORT} 🚀`)
  })
  .catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
  })
