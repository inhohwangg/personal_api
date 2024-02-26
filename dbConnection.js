require('dotenv').config({ path : './.env.dev'})
const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.DBUSER,
    host: 'localhost',
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: 5432,
})

pool.connect(error => {
  if (error) {
    console.error('Database connection error', error.stack);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;