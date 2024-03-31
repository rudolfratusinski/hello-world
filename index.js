const express = require('express');
const { Client } = require('pg');
const { AWS } = require('aws-sdk');
const { Signer } = require ("@aws-sdk/rds-signer");
require('dotenv').config()

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/database', async (req, res) => {
  try {
    const signer = new Signer({
      region: process.env.DATABASE_REGION, // Replace with your region
      hostname: process.env.DATABASE_URL, // Replace with your RDS endpoint
      port: 5432, // Replace if your port is different
      username: process.env.DATABASE_USERNAME, // Replace with your IAM role
    });

    const token = signer.getAuthToken({
      username: process.env.DATABASE_USERNAME, // Replace with your database username
    });

    console.log('debug..')
    console.log(token)

    const client = new Client({
      host: process.env.DATABASE_URL, // Replace with your RDS endpoint
      port: 5432, // Replace if your port is different
      ssl: {
        rejectUnauthorized: false,
        // sslmode: 'require',
        // cert: signer.getCertificate(),
      },
      user: process.env.DATABASE_USERNAME, // Replace with your database username
      password: token,
      database: process.env.DATABASE_NAME, // Replace with your database name
    });

    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();

    res.send(`Database time: ${result.rows[0].now}`);
  } catch (error) {
    console.error('Database connection failed', error);
    res.status(500).send('Failed to connect to the database');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});