import { PrismaPg } from '@prisma/adapter-pg'
import { MediaType, PrismaClient, Role, TaxonomyKind } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'

loadEnv({ path: path.join(__dirname, '..', '.env') })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@impuls.local').trim().toLowerCase()
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production'
  const resetPassword = process.env.SEED_RESET_ADMIN_PASSWORD === '1'
  const password = process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin123')

  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    if (!password) {
      throw new Error('ADMIN_PASSWORD обязателен для создания первого админа')
    }
    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD должен быть не короче 8 символов')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: { email, passwordHash, role: Role.SUPERADMIN },
    })
    console.log(`Superadmin created: ${email}`)
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('Using default ADMIN_PASSWORD=admin123 — смените перед деплоем')
    }
  } else if (resetPassword) {
    if (!password) {
      throw new Error('ADMIN_PASSWORD обязателен при SEED_RESET_ADMIN_PASSWORD=1')
    }
    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD должен быть не короче 8 символов')
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: Role.SUPERADMIN },
    })
    await prisma.refreshToken.deleteMany({ where: { userId: existing.id } })
    console.log(`Superadmin password reset: ${email}`)
  } else {
    if (existing.role !== Role.SUPERADMIN) {
      const superCount = await prisma.user.count({ where: { role: Role.SUPERADMIN } })
      if (superCount === 0) {
        await prisma.user.update({
          where: { email },
          data: { role: Role.SUPERADMIN },
        })
        console.log(`Promoted to superadmin: ${email}`)
      } else {
        console.log(`Admin exists: ${email} (password unchanged)`)
      }
    } else {
      console.log(`Superadmin exists: ${email} (password unchanged)`)
    }
  }

  for (const key of [MediaType.CATALOG, MediaType.NEWS, MediaType.REVIEW, MediaType.GALLERY]) {
    await prisma.siteSection.upsert({
      where: { key },
      create: { key, enabled: true },
      update: {},
    })
  }

  const newsTopics = ['События', 'Турниры', 'Школа', 'Анонсы']
  for (const [index, name] of newsTopics.entries()) {
    await prisma.taxonomy.upsert({
      where: { kind_name: { kind: TaxonomyKind.NEWS_TOPIC, name } },
      create: { kind: TaxonomyKind.NEWS_TOPIC, name, sortOrder: index },
      update: {},
    })
  }

  const catalogCategories = ['Форма', 'Экипировка', 'Аксессуары']
  for (const [index, name] of catalogCategories.entries()) {
    await prisma.taxonomy.upsert({
      where: { kind_name: { kind: TaxonomyKind.CATALOG_CATEGORY, name } },
      create: { kind: TaxonomyKind.CATALOG_CATEGORY, name, sortOrder: index },
      update: {},
    })
  }

  const coachSpecialties = [
    'Техника',
    'Младшие группы',
    'РФС C',
    'Малыши',
    'Игровая методика',
    'Девочки',
    'Соревнования',
    'Тактика',
    'РФС B',
    'Методика',
    'Обучение тренеров',
    'Вратари',
    'Спецподготовка',
  ]
  for (const [index, name] of coachSpecialties.entries()) {
    await prisma.taxonomy.upsert({
      where: { kind_name: { kind: TaxonomyKind.COACH_SPECIALTY, name } },
      create: { kind: TaxonomyKind.COACH_SPECIALTY, name, sortOrder: index },
      update: {},
    })
  }

  const homeBlocks = [
    ['hero', true],
    ['stats', true],
    ['programs', true],
    ['painPoints', true],
    ['audience', true],
    ['childBenefits', true],
    ['steps', true],
    ['progression', true],
    ['trainingQuality', true],
    ['conditions', true],
    ['ecosystem', true],
    ['advantages', false],
    ['video', true],
    ['locations', true],
    ['gallery', true],
    ['catalog', true],
    ['news', true],
    ['reviews', true],
    ['faq', true],
    ['coaches', true],
    ['cta', true],
  ] as const

  for (const [index, [key, enabled]] of homeBlocks.entries()) {
    await prisma.homeBlock.upsert({
      where: { key },
      create: { key, enabled, sortOrder: index },
      update: {},
    })
  }

  const coachCount = await prisma.coach.count()
  if (coachCount === 0) {
    const coaches = [
      {
        name: 'Алексей Морозов',
        role: 'Главный тренер · U10–U12',
        experience: '12 лет',
        bio: 'Лицензия РФС «C». Специализация — техника и координация младших возрастов. Ведёт представительскую команду школы.',
        specialties: ['Техника', 'Младшие группы', 'РФС C'],
        imageAlt: 'Тренер Алексей Морозов',
      },
      {
        name: 'Дмитрий Волков',
        role: 'Тренер · U7–U9',
        experience: '8 лет',
        bio: 'Педагог по работе с детьми 4–9 лет. Умеет вовлечь даже тех, кто впервые держит мяч. Акцент на игру и радость от занятий.',
        specialties: ['Малыши', 'Игровая методика'],
        imageAlt: 'Тренер Дмитрий Волков',
      },
      {
        name: 'Ирина Соколова',
        role: 'Тренер · девочки U8–U14',
        experience: '9 лет',
        bio: 'Ведёт группы для девочек и смешанные команды. Создаёт поддерживающую атмосферу, при этом требовательна к технике и дисциплине.',
        specialties: ['Девочки', 'Техника', 'РФС C'],
        imageAlt: 'Тренер Ирина Соколова',
      },
      {
        name: 'Максим Орлов',
        role: 'Тренер · U13–U16',
        experience: '10 лет',
        bio: 'Подготовка к турнирам и просмотрам. Тактика, физическая подготовка, работа с амбициозными игроками.',
        specialties: ['Соревнования', 'Тактика', 'РФС B'],
        imageAlt: 'Тренер Максим Орлов',
      },
      {
        name: 'Елена Кузнецова',
        role: 'Тренер-методист',
        experience: '14 лет',
        bio: 'Курирует программы и стандарты тренировок. Проводит обучение тренерского состава и контроль качества занятий.',
        specialties: ['Методика', 'Обучение тренеров'],
        imageAlt: 'Тренер-методист Елена Кузнецова',
      },
      {
        name: 'Артём Лебедев',
        role: 'Тренер вратарей',
        experience: '7 лет',
        bio: 'Отдельная программа для вратарей всех возрастов: работа на реакцию, игру ногами и уверенность в воротах.',
        specialties: ['Вратари', 'Спецподготовка'],
        imageAlt: 'Тренер вратарей Артём Лебедев',
      },
    ] as const

    await prisma.coach.createMany({
      data: coaches.map((coach, index) => ({
        ...coach,
        specialties: [...coach.specialties],
        sortOrder: index,
        published: true,
      })),
    })
    console.log(`Seeded ${coaches.length} coaches`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
