import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../db"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

type Metrics = {
  count: number,
  in_diet: number,
  out_diet: number,
  streak: number,
  best_streak: number,
}

type Meal = {
  id: string;
  name: string;
  description?: string | undefined;
  date: string;
  time: string;
  in_diet: boolean;
  created_at: string;
  session_id?: string | undefined;
}

function updateMetrics(acc: Metrics, value: Meal) {
  acc.count++
  if (value.in_diet) {
    acc.in_diet++
    acc.streak++
  } else {
    acc.out_diet++
    acc.streak = 0
  }
  if (acc.streak > acc.best_streak) acc.best_streak = acc.streak
  return acc
}

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies
    const meals = await knex('meals')
      .where('session_id', sessionId)
      .select()
    return { meals }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies
    const getMealParamSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealParamSchema.parse(req.params)
    const meal = await knex('meals')
      .where({
        id,
        session_id: sessionId
      })
      .first()
    return { meal }
  })

  app.get('/metrics', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies
    const meals = await knex('meals')
      .where('session_id', sessionId)
      .select()
    const metrics = meals.reduce((acc: Metrics, value) => updateMetrics(acc, value), {
      count: 0,
      in_diet: 0,
      out_diet: 0,
      streak: 0,
      best_streak: 0,
    })
    const metricsReponse: Omit<Metrics, 'streak'> = {
      count: metrics.count,
      in_diet: metrics.in_diet,
      out_diet: metrics.out_diet,
      best_streak: metrics.best_streak,
    }
    return { metrics: metricsReponse }
  })

  app.post('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      in_diet: z.boolean()
    })
    const { name, description, date, time, in_diet } = createMealBodySchema.parse(req.body)
    const { sessionId } = req.cookies
    await knex('meals')
      .insert({
        id: crypto.randomUUID(),
        name,
        description,
        time,
        date,
        in_diet,
        session_id: sessionId
      })
    return res.status(201).send()
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const getMealParamSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealParamSchema.parse(req.params)
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      in_diet: z.boolean()
    })
    const { name, description, date, time, in_diet } = updateMealBodySchema.parse(req.body)
    const { sessionId } = req.cookies
    await knex('meals')
      .where({ id, session_id: sessionId })
      .update({
        name,
        description,
        time,
        date,
        in_diet
      })
    return res.status(200).send()
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies
    const getMealParamSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealParamSchema.parse(req.params)
    const meal = await knex('meals')
      .where({
        id,
        session_id: sessionId
      })
      .delete()
      return res.status(200).send()
  })
}
