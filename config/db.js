require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  max: 10, // equivalent to connectionLimit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
