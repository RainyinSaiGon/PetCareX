const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runDatabaseInit() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'database', 'init.sql');
    console.log(`Reading SQL file: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL
    console.log('Executing database initialization...');
    await client.query(sql);
    console.log('Database initialized successfully!');

  } catch (error) {
    console.error('Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to the database. Please check your .env configuration.');
    } else if (error.code === '42P07') {
      console.log('Tables already exist. Database is already initialized.');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

runDatabaseInit();
