module.exports = {
    client: 'sqlite3',
    connection: {
        filename: "./data.sqlite"
    },
    useNullAsDefault: true,
    migrations: {
        directory: __dirname + '/migrations',
    }
  };
  