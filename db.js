require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.LOCALHOST,
  user: process.env.ROOT,
  password: process.env.APR_2023107177, // Replace with your MySQL root password
  database: process.env.EXPLOREMOREPH,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

module.exports = db;
