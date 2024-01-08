import prisma from '../lib/prisma'
import { type NL2SQL } from '@prisma/client'
import fs from 'fs'
import { openai } from '../lib/openai'
import path from 'path'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('process.env.OPENAI_API_KEY is not defined. Please set it.')
}

if (!process.env.POSTGRES_URL) {
  throw new Error('process.env.POSTGRES_URL is not defined. Please set it.')
}

type NL2SQL_with_embedding = NL2SQL & { embedding: number[] }

async function main() {
  let data:NL2SQL_with_embedding[] = [];
  const questions = await prisma.nL2SQL.findMany();

  for (const question of questions) {
    const embedding = await generateEmbedding(question.question);
    data.push({
      ...question,
      embedding,
    })

    await prisma.$executeRaw`
      UPDATE NL2SQL
      SET embedding = ${embedding}::vector
      WHERE id = ${question.id}
    `

    console.log(`Added embedding ${question.question}`)
  }

  // Uncomment the following lines if you want to generate the JSON file
  fs.writeFileSync(
    path.join(__dirname, "./nl2sql-with-embeddings.json"),
    JSON.stringify({ data }, null, 2),
  );

  console.log('embedding added successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

async function generateEmbedding(_input: string) {
  const input = _input.replace(/\n/g, ' ')
  const embeddingData = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  })
  console.log(embeddingData)
  const [{ embedding }] = (embeddingData as any).data
  return embedding
}
