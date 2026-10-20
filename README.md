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

Vercel tidak dapat mengakses MySQL yang berjalan di komputer lokal. Untuk Aiven, ambil hostname, port, user, password baru, dan CA certificate dari halaman service Aiven. Jangan gunakan `localhost`, dan jangan tempel URI koneksi lengkap ke source code.

Di **Vercel → Project → Settings → Environment Variables**, tambahkan:

- `DB_HOST`: hostname database dari penyedia database, bukan `localhost` atau `127.0.0.1`
- `DB_PORT`: port MySQL
- `DB_USER`: username database
- `DB_PASSWORD`: password database
- `DB_NAME`: nama database
- `DB_SSL_CA`: isi CA certificate Aiven (PEM) agar sertifikat TLS diverifikasi
- `AUTH_SECRET`: rahasia acak minimal 32 karakter untuk sesi login

Di Aiven, gunakan database yang ditampilkan pada halaman service (sering kali `defaultdb`). Pilih database tersebut di MySQL Workbench, lalu jalankan [database-aiven.sql](./database-aiven.sql). Buat akun memakai `npm run create-user` setelah `.env.local` diisi dengan koneksi Aiven, termasuk `DB_SSL_CA`. Masukkan variabel yang sama di Vercel → **Project → Settings → Environment Variables**, dengan password yang baru dirotasi, lalu redeploy. Jangan commit `.env` atau `.env.local`.
