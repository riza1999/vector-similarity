'use server'

import prisma from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { type NL2SQL } from '@prisma/client'
import { ratelimit } from '@/lib/utils'

export async function searchNL2SQL(query: string): Promise<Array<NL2SQL & {similarity: number}>>{
  try {
    if (query.trim().length === 0) return []

    const {success} = await ratelimit.limit('generations')
    if (!success) throw new Error('Rate limit exceeded')

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(',')}]`
    const nl2sql = await prisma.$queryRaw`
      SELECT
        id,
        "question",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM nl2sql
      where 1 - (embedding <=> ${vectorQuery}::vector) > .5
      ORDER BY  similarity DESC
      LIMIT 8;
    `
    return nl2sql as Array<NL2SQL & {similarity: number}>
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function searchNL2SQLNoEmbed(query: string): Promise<Array<NL2SQL & {similarity: number}>>{
  try {
    if (query.trim().length === 0) return []

    const {success} = await ratelimit.limit('generations')
    if (!success) throw new Error('Rate limit exceeded')

    const nl2sql = await prisma.$queryRaw`
      SELECT
          id,
          question,
          similarity(question,${query}) AS similarity
      FROM nl2sql
      WHERE question % ${query}
      ORDER BY similarity DESC
      LIMIT 8;
    `
    return nl2sql as Array<NL2SQL & {similarity: number}>
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function searchAutoNormal(query: string): Promise<Array<NL2SQL>>{
  try {
    if (query.trim().length === 0) return []

    const {success} = await ratelimit.limit('generations')
    if (!success) throw new Error('Rate limit exceeded')

    const result = await prisma.nL2SQL.findMany({
      select:{
        id: true,
        question: true
      },
      where:{
        question: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 8
    })

    return result as Array<NL2SQL>
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function generateEmbedding(raw: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, ' ')
  const embeddingData = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  })
  const [{ embedding }] = (embeddingData as any).data
  return embedding
}
