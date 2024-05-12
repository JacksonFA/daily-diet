import { FastifyInstance } from "fastify";
// import { z } from "zod";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    // const createUserSessionBodySchema = z.object({
    //   name: z.string(),
    // })
    const sessionId = req.cookies.sessionId ?? crypto.randomUUID()
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: SESSION_COOKIE_MAX_AGE
      })
    }
    return res.status(200).send({ message: 'Session created' })
  })
}
