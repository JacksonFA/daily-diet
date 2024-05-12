import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').index()
    table.text('name').notNullable()
    table.text('description').defaultTo('').notNullable()
    table.text('date').notNullable()
    table.text('time').notNullable()
    table.boolean('in_diet').defaultTo(true).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

