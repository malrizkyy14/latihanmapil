# CRUD Daftar Siswa (Next.js + MySQL)

## Menjalankan secara lokal

1. Import `database.sql` ke MySQL (phpMyAdmin / terminal).
2. Salin `.env.example` menjadi `.env.local`, lalu sesuaikan nilainya dengan MySQL lokal. Isi `AUTH_SECRET` dengan nilai acak rahasia minimal 32 karakter.
3. Jalankan `npm install`.
4. Buat akun dengan `npm run create-user`, lalu ikuti prompt terminal.
5. Jalankan `npm run dev` dan buka http://localhost:3000.

Halaman daftar siswa dan aksi tambah, edit, serta hapus hanya dapat digunakan setelah login. Tidak ada registrasi publik. Jika database sudah terisi data dan Anda tidak ingin menjalankan ulang seluruh `database.sql`, buat tabel akun dengan:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Deploy ke Vercel

Vercel tidak dapat mengakses MySQL yang berjalan di komputer lokal. Siapkan database MySQL yang dapat diakses dari internet atau dari jaringan Vercel, lalu impor `database.sql` ke database tersebut.

Di **Vercel → Project → Settings → Environment Variables**, tambahkan:

- `DB_HOST`: hostname database dari penyedia database, bukan `localhost` atau `127.0.0.1`
- `DB_PORT`: port MySQL
- `DB_USER`: username database
- `DB_PASSWORD`: password database
- `DB_NAME`: nama database
- `AUTH_SECRET`: rahasia acak minimal 32 karakter untuk sesi login

Pastikan tabel `users` dari `database.sql` sudah dibuat di database production. Buat akun pengguna dengan `npm run create-user` memakai `.env.local` yang terhubung ke database production. Jangan commit `.env` atau `.env.local`; gunakan Environment Variables Vercel untuk kredensial produksi. Atur variabel tersebut untuk environment yang digunakan, kemudian deploy ulang project.
