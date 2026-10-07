import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

loadEnv({ path: path.join(__dirname, '.env') })

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
