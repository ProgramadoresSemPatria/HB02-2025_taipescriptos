import { app } from './app'
import { env } from './src/env/index'

const PORT = env.PORT

app
  .listen({
    host: '0.0.0.0',
    port: PORT,
  })
  .then(() => {
    console.log(`Server is running at ${PORT} 🚀`)
  })
