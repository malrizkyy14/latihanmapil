import mysql from "mysql2/promise";

let db: mysql.Pool | undefined;

export function getDb() {
  const host = process.env.DB_HOST?.trim();
  const portValue = process.env.DB_PORT?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();
  const sslCa = process.env.DB_SSL_CA?.replace(/\\n/g, "\n").trim();
  const port = Number(portValue);
  const missing = [
    !host && "DB_HOST",
    !portValue && "DB_PORT",
    !user && "DB_USER",
    password === undefined && "DB_PASSWORD",
    !database && "DB_NAME",
    host?.endsWith(".aivencloud.com") && !sslCa && "DB_SSL_CA (CA certificate Aiven)",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Environment variable database belum diatur: ${missing.join(", ")}`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT harus berupa angka antara 1 dan 65535.");
  }

  if (!db) {
    db = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ...(sslCa ? { ssl: { ca: sslCa, rejectUnauthorized: true } } : {}),
    });
  }

  return db;
}
