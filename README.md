# CRUD Daftar Siswa (Next.js + MySQL)

## Menjalankan secara lokal

1. Import `database.sql` ke MySQL (phpMyAdmin / terminal).
2. Salin `.env.example` menjadi `.env.local`, lalu sesuaikan nilainya dengan MySQL lokal.
3. Jalankan `npm install`, lalu `npm run dev`.
4. Buka http://localhost:3000.

## Deploy ke Vercel

Vercel tidak dapat mengakses MySQL yang berjalan di komputer lokal. Siapkan database MySQL yang dapat diakses dari internet atau dari jaringan Vercel, lalu impor `database.sql` ke database tersebut.

Di **Vercel → Project → Settings → Environment Variables**, tambahkan:

- `DB_HOST`: hostname database dari penyedia database, bukan `localhost` atau `127.0.0.1`
- `DB_PORT`: port MySQL
- `DB_USER`: username database
- `DB_PASSWORD`: password database
- `DB_NAME`: nama database

Atur variabel tersebut untuk environment yang digunakan, kemudian deploy ulang project. Jangan commit `.env` atau `.env.local`; gunakan Environment Variables Vercel untuk kredensial produksi.
