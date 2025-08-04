import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestStudies() {
  try {
    console.log('🔍 Buscando usuário admin...')

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    })

    if (!adminUser) {
      console.error('❌ Usuário admin não encontrado.')
      return
    }

    console.log(`✅ Usuário encontrado: ${adminUser.name}`)

    // Criar upload e estudo de Revolução Francesa
    const upload1 = await prisma.fileUpload.create({
      data: {
        userId: adminUser.id,
        filename: 'Revolução Francesa - História.pdf',
        contentText: `A Revolução Francesa foi um período de intensa agitação política e social na França, que teve profundo impacto não apenas no país, mas em toda a Europa e mundo. Iniciada em 1789, a revolução marcou o fim do Antigo Regime e estabeleceu as bases para a França moderna. Os principais causas incluíam a crise financeira, desigualdade social extrema, influência do Iluminismo e fraqueza do sistema político.`,
        type: 'pdf',
      },
    })

    await prisma.studyMaterial.create({
      data: {
        uploadId: upload1.id,
        userId: adminUser.id,
        summary: JSON.stringify({
          titulo: 'Revolução Francesa - Resumo Histórico',
          resumoExecutivo:
            'A Revolução Francesa (1789-1799) foi um movimento político e social que transformou a França.',
          topicosChave: ['Causas', 'Fases', 'Eventos', 'Consequências'],
          pontosPrincipais: [
            {
              topico: 'Causas',
              descricao: 'Crise financeira e desigualdade social',
            },
            {
              topico: 'Queda da Bastilha',
              descricao: 'Marco inicial em 14 de julho de 1789',
            },
          ],
          conclusao: 'Estabeleceu princípios democráticos modernos.',
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de História',
        }),
        quizJson: {
          titulo: 'Quiz: Revolução Francesa',
          questoes: [
            {
              pergunta: 'Em que ano começou a Revolução Francesa?',
              opcoes: ['1788', '1789', '1790', '1791'],
              respostaCorreta: 1,
              explicacao: 'A Revolução começou em 1789.',
            },
            {
              pergunta: 'Qual evento marcou o início da Revolução?',
              opcoes: [
                'Execução do Rei',
                'Queda da Bastilha',
                'Declaração',
                'Terror',
              ],
              respostaCorreta: 1,
              explicacao: 'A Queda da Bastilha em 14 de julho.',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de História',
        },
        flashcardsJson: {
          titulo: 'Flashcards: Revolução Francesa',
          flashcards: [
            {
              frente: 'Quando começou a Revolução Francesa?',
              verso: '1789 - com a convocação dos Estados Gerais',
              categoria: 'Datas',
              dificuldade: 'facil',
            },
            {
              frente: 'Queda da Bastilha',
              verso: '14 de julho de 1789 - marco inicial da revolução',
              categoria: 'Eventos',
              dificuldade: 'medio',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de História',
        },
        language: 'pt-BR',
        mode: 'review',
      },
    })

    // Criar upload e estudo de Funções Quadráticas
    const upload2 = await prisma.fileUpload.create({
      data: {
        userId: adminUser.id,
        filename: 'Funções Quadráticas - Matemática.pdf',
        contentText: `As funções quadráticas são definidas por f(x) = ax² + bx + c, onde a ≠ 0. Elas possuem características únicas como gráfico em forma de parábola, vértice como ponto extremo, eixo de simetria e discriminante que determina o número de raízes reais. O vértice tem coordenadas (-b/2a, -Δ/4a), onde Δ = b² - 4ac é o discriminante.`,
        type: 'pdf',
      },
    })

    await prisma.studyMaterial.create({
      data: {
        uploadId: upload2.id,
        userId: adminUser.id,
        summary: JSON.stringify({
          titulo: 'Funções Quadráticas - Conceitos Fundamentais',
          resumoExecutivo:
            'Funções quadráticas são funções polinomiais de segundo grau.',
          topicosChave: ['Definição', 'Gráfico', 'Vértice', 'Discriminante'],
          pontosPrincipais: [
            {
              topico: 'Forma Geral',
              descricao: 'f(x) = ax² + bx + c, onde a ≠ 0',
            },
            { topico: 'Vértice', descricao: 'Coordenadas (-b/2a, -Δ/4a)' },
          ],
          conclusao: 'Essenciais para modelar fenômenos físicos e matemáticos.',
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Matemática',
        }),
        quizJson: {
          titulo: 'Quiz: Funções Quadráticas',
          questoes: [
            {
              pergunta: 'Qual é a forma geral de uma função quadrática?',
              opcoes: [
                'f(x) = ax + b',
                'f(x) = ax² + bx + c',
                'f(x) = ax³',
                'f(x) = a/x',
              ],
              respostaCorreta: 1,
              explicacao: 'A forma geral é f(x) = ax² + bx + c.',
            },
            {
              pergunta: 'Se a > 0, qual é a concavidade da parábola?',
              opcoes: ['Para baixo', 'Para cima', 'Horizontal', 'Nenhuma'],
              respostaCorreta: 1,
              explicacao: 'Quando a > 0, a concavidade é para cima.',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Matemática',
        },
        flashcardsJson: {
          titulo: 'Flashcards: Funções Quadráticas',
          flashcards: [
            {
              frente: 'Forma geral da função quadrática',
              verso: 'f(x) = ax² + bx + c, onde a ≠ 0',
              categoria: 'Definições',
              dificuldade: 'facil',
            },
            {
              frente: 'Fórmula do vértice',
              verso: 'V = (-b/2a, -Δ/4a), onde Δ = b² - 4ac',
              categoria: 'Fórmulas',
              dificuldade: 'medio',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Matemática',
        },
        language: 'pt-BR',
        mode: 'review',
      },
    })

    // Criar upload e estudo de Sistema Solar
    const upload3 = await prisma.fileUpload.create({
      data: {
        userId: adminUser.id,
        filename: 'Sistema Solar - Astronomia.txt',
        contentText: `O Sistema Solar é formado pelo Sol e todos os corpos celestes que orbitam ao seu redor, incluindo oito planetas, luas, asteroides, cometas e poeira cósmica. Os planetas são divididos em dois grupos: planetas rochosos (Mercúrio, Vênus, Terra e Marte) e planetas gasosos (Júpiter, Saturno, Urano e Netuno). O Sol contém 99,86% da massa total do sistema solar.`,
        type: 'txt',
      },
    })

    await prisma.studyMaterial.create({
      data: {
        uploadId: upload3.id,
        userId: adminUser.id,
        summary: JSON.stringify({
          titulo: 'Sistema Solar - Estrutura e Componentes',
          resumoExecutivo:
            'O Sistema Solar é um sistema gravitacional com o Sol no centro.',
          topicosChave: ['Estrutura', 'Planetas', 'Sol', 'Características'],
          pontosPrincipais: [
            {
              topico: 'Composição',
              descricao: 'Sol, 8 planetas, luas, asteroides',
            },
            {
              topico: 'Planetas Rochosos',
              descricao: 'Mercúrio, Vênus, Terra e Marte',
            },
          ],
          conclusao: 'Sistema complexo com 4,6 bilhões de anos.',
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Astronomia',
        }),
        quizJson: {
          titulo: 'Quiz: Sistema Solar',
          questoes: [
            {
              pergunta: 'Quantos planetas existem no Sistema Solar?',
              opcoes: ['7', '8', '9', '10'],
              respostaCorreta: 1,
              explicacao: 'O Sistema Solar possui 8 planetas.',
            },
            {
              pergunta: 'Onde se localiza o Cinturão de Asteroides?',
              opcoes: [
                'Entre Mercúrio e Vênus',
                'Entre Terra e Marte',
                'Entre Marte e Júpiter',
                'Após Netuno',
              ],
              respostaCorreta: 2,
              explicacao: 'Entre as órbitas de Marte e Júpiter.',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Astronomia',
        },
        flashcardsJson: {
          titulo: 'Flashcards: Sistema Solar',
          flashcards: [
            {
              frente: 'Quantos planetas no Sistema Solar?',
              verso:
                '8 planetas: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno',
              categoria: 'Números',
              dificuldade: 'facil',
            },
            {
              frente: 'Planetas Rochosos',
              verso: 'Mercúrio, Vênus, Terra e Marte',
              categoria: 'Classificação',
              dificuldade: 'medio',
            },
          ],
          modelo: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          fonte: 'Material de Astronomia',
        },
        language: 'pt-BR',
        mode: 'review',
      },
    })

    console.log('✅ Criado: Revolução Francesa - História.pdf')
    console.log('✅ Criado: Funções Quadráticas - Matemática.pdf')
    console.log('✅ Criado: Sistema Solar - Astronomia.txt')
    console.log('🎉 Todos os materiais de estudo foram criados!')
  } catch (error) {
    console.error('❌ Erro ao criar materiais:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestStudies()
