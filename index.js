const express = require('express');
const { Pool } = require('pg');
const { RDS } = require('aws-sdk');

var app = express();

const rds = new RDS();
const region = process.env.DATABASE_REGION;
const hostname = process.env.DATABASE_URL;
const portNumber = 5432;
const username = process.env.DATABASE_USERNAME;
const database = 'postgres';

// Generate an authentication token
const token = rds.generateAuthToken({
  region,
  hostname,
  port: portNumber,
  username,
});

const pool = new Pool({
  user: username,
  host: hostname,
  database: database,
  password: token,
  port: portNumber,
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/database', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.send(`Current time from PostgreSQL: ${rows[0].now}`);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).send('Error executing query');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});