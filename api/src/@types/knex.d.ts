import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description?: string
      date: string
      time: string
      in_diet: boolean
      created_at: string
      session_id?: string
    }
  }
}
