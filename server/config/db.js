const prisma = require("../lib/prisma");

const connectDB = async () => {
  try {
    // Test the connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Supabase (PostgreSQL) connected successfully`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;