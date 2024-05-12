import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

let cookies: string[] | undefined

async function getCookies() {
  if (!cookies) {
    const createUserSessionResponse = await request(app.server)
    .post('/users')
    .send({ name: 'Unit Test' })
    cookies = createUserSessionResponse.get('Set-Cookie')
  }
  return cookies as string[]
}

describe('Meals Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: false
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    
    await request(app.server)
      .get('/meals')
      .set('Cookie', await getCookies())
      .expect(200)
  })

  it('should be able to get a meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', await getCookies())
    const { id } = listMealsResponse.body.meals[0]
    
    await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', await getCookies())
      .expect(200)
  })

  it('should be able to update a meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', await getCookies())
    const { id } = listMealsResponse.body.meals[0]

    await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: false
      })
      .expect(200)
  })

  it('should be able to delete a meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', await getCookies())
    const { id } = listMealsResponse.body.meals[0]
    
    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', await getCookies())
      .expect(200)
  })

  it('should be able to get metrics of all meals', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "Salada",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "BK",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: false
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', await getCookies())
      .send({
        name: "Salada",
        description: "",
        date: "12/05/24",
        time: "12:00",
        in_diet: true
      })
    
    await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', await getCookies())
      .expect(200)
  })

  afterAll(async () => {
    await app.close()
  })
})

