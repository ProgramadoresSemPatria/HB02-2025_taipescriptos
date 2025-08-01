import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Verificar se o usuário já existe
    const email = 'admin@studybuddy.com'
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Se existe, apenas promover para admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      
      console.log('✅ Usuário promovido para admin:', updatedUser)
    } else {
      // Se não existe, criar novo usuário admin
      const bcrypt = require('bcryptjs')
      const passwordHash = await bcrypt.hash('admin123', 12)
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@studybuddy.com',
          passwordHash,
          role: 'ADMIN',
          credits: 1000,
          isPremium: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      
      console.log('✅ Usuário admin criado:', newUser)
      console.log('📧 Email: admin@studybuddy.com')
      console.log('🔑 Senha: admin123')
    }
  } catch (error) {
    console.error('❌ Erro ao criar/promover admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  createAdminUser()
}

export { createAdminUser }