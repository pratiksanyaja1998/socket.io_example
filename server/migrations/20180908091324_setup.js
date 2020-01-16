
exports.up = function(knex, Promise) {
  


    return Promise.all([

        knex.schema.createTable('user', function (table) {
            table.increments('id').primary();
            table.string('username').unique().notNullable();
            table.string("fristname");
            table.string("lastname");
            table.string("token");
        }),

    ]);

};

exports.down = function(knex, Promise) {
  
};
