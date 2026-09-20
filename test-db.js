require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("Database connected!");
    console.log(result);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  }
}

testConnection();