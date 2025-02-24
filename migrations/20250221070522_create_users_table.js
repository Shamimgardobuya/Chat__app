/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table)=> {
        table.increments('id').primary();
        table.string('username').unique().notNullable;
        table.string('email').unique().notNullable();
        table.string('password').unique().notNullable;


    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
  
};
