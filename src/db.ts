import mysql from "mysql2/promise";
import { env } from "./env";

const createDB = async () => {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\``);
    console.log(`Database ${env.DB_NAME} ensured.`);
  } catch (error) {
    console.error("Error ensuring database exists:", error);
  } finally {
    await connection.end();
  }
};

const db_config = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(db_config);

const initialConnection = async () => {
  try {
    await createDB();
    const connection = await pool.getConnection();
    console.log("Connected to the database.");
    connection.release();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

initialConnection();
