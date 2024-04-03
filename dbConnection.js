require('dotenv').config({ path : './.env.dev'})
const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.HOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: 5432,
})

pool.connect(error => {
  if (error) {
    console.error('Database connection error', error);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;