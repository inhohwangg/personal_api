require('dotenv').config({ path : './.env.dev'})
const { Client } = require('pg')

const client = new Client({
    user: process.env.DBUSER,
    host: 'localhost',
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: 5432,
})

client.connect(error => {
  if (error) {
    console.error('Database connection error', error.stack);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = client;