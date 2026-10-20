import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import mysql from "mysql2/promise";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const scrypt = promisify(scryptCallback);
const terminal = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => terminal.question(question, resolve));
}

function askHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error("Jalankan perintah ini di terminal interaktif agar password tidak terlihat."));
      return;
    }

    let value = "";
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onKeypress = (_character, key) => {
      if (key.ctrl && key.name === "c") {
        process.stdin.setRawMode(false);
        process.stdin.off("keypress", onKeypress);
        process.stdout.write("\n");
        reject(new Error("Pembuatan akun dibatalkan."));
      } else if (key.name === "return" || key.name === "enter") {
        process.stdin.setRawMode(false);
        process.stdin.off("keypress", onKeypress);
        process.stdout.write("\n");
        resolve(value);
      } else if (key.name === "backspace") {
        value = value.slice(0, -1);
      } else if (!key.ctrl && !key.meta && _character) {
        value += _character;
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

let connection;
try {
  const username = (await ask("Username: ")).trim();
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
    throw new Error("Username harus 3-50 karakter dan hanya boleh berisi huruf, angka, titik, _ atau -.");
  }

  const password = await askHidden("Password (minimal 8 karakter): ");
  if (password.length < 8) throw new Error("Password minimal harus 8 karakter.");

  const host = process.env.DB_HOST?.trim();
  const portValue = process.env.DB_PORT?.trim();
  const user = process.env.DB_USER?.trim();
  const database = process.env.DB_NAME?.trim();
  const sslCa = process.env.DB_SSL_CA?.replace(/\\n/g, "\n").trim();
  const port = Number(portValue);
  if (!host || !portValue || !user || process.env.DB_PASSWORD === undefined || !database) {
    throw new Error("Atur DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, dan DB_NAME terlebih dahulu.");
  }
  if (host.endsWith(".aivencloud.com") && !sslCa) {
    throw new Error("Atur DB_SSL_CA dengan CA certificate Aiven agar koneksi TLS dapat diverifikasi.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT harus berupa angka antara 1 dan 65535.");
  }

  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  const passwordHash = `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;

  connection = await mysql.createConnection({
    host,
    port,
    user,
    password: process.env.DB_PASSWORD,
    database,
    ...(sslCa ? { ssl: { ca: sslCa, rejectUnauthorized: true } } : {}),
  });
  await connection.execute(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash]
  );
  console.log(`Akun "${username}" berhasil dibuat.`);
} finally {
  terminal.close();
  await connection?.end();
}
