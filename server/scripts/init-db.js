const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    await client.connect();
    console.log('Connected to database');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/0_init/migration.sql');
    console.log('Migration path:', migrationPath);
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    console.log('SQL file read, length:', sql.length);

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    console.log('Total statements:', statements.length);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        try {
          await client.query(statement);
          console.log('✓ Statement executed');
        } catch (err) {
          console.error('✗ Statement error:', err.message);
          throw err;
        }
      }
    }

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
