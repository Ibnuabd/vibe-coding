# Vibe Coding - User API

Aplikasi ini adalah sebuah RESTful API untuk manajemen pengguna (User Management) yang ringan, cepat, dan modern, dibangun di atas ekosistem **Bun**.

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini mengadaptasi arsitektur berlapis (layered architecture) yang memisahkan antara routing dan business logic:

- **`src/`**: Direktori utama kode sumber.
  - **`db/`**: Berisi konfigurasi koneksi database, skema database (`schema.ts`), dan skrip migrasi.
  - **`routes/`**: Berisi definisi endpoint API (Elysia routing). File dinamakan dengan format `*-route.ts` (contoh: `users-route.ts`).
  - **`services/`**: Berisi *business logic* dan operasi langsung ke database. File dinamakan dengan format `*-services.ts` (contoh: `users-services.ts`).
  - **`index.ts`**: Entry point utama aplikasi yang menginisialisasi server Elysia.
- **`tests/`**: Berisi semua file unit test menggunakan `bun test`. File dinamakan dengan format `*.test.ts`.
- **`drizzle/`**: Folder hasil *generate* migrasi Drizzle.

## 🔌 Endpoint API

Berikut adalah API yang tersedia pada aplikasi ini (semua route memiliki prefix `/api/users`):

1. **`POST /api/users/register`**
   - **Deskripsi**: Registrasi user baru.
   - **Body (JSON)**: `name`, `email`, `password` (Maksimal 255 karakter).
   - **Response**: `201 Created` jika berhasil, atau `400/422` jika gagal/validasi error.
2. **`POST /api/users/login`**
   - **Deskripsi**: Autentikasi user dan menghasilkan token sesi.
   - **Body (JSON)**: `email`, `password`.
   - **Response**: `200 OK` (mengembalikan token UUID) atau `400/422` jika kredensial salah.
3. **`GET /api/users/current`**
   - **Deskripsi**: Mengambil profil user yang sedang login.
   - **Headers**: `Authorization: Bearer <token>`
   - **Response**: `200 OK` (mengembalikan data profil tanpa password) atau `401 Unauthorized`.
4. **`DELETE /api/users/logout`**
   - **Deskripsi**: Mengakhiri sesi user (logout).
   - **Headers**: `Authorization: Bearer <token>`
   - **Response**: `200 OK` jika berhasil, atau `401 Unauthorized` jika token tidak valid.

## 🗄️ Skema Database

Aplikasi menggunakan database MySQL/MariaDB dengan 2 tabel utama:

- **Tabel `users`**:
  - `id` (Serial/Primary Key)
  - `name` (Varchar 255, Not Null)
  - `email` (Varchar 255, Unique, Not Null)
  - `password` (Varchar 255, Not Null - Hashed by bcrypt)
  - `create_at` (Timestamp, Default Now)
- **Tabel `sessions`**:
  - `id` (Serial/Primary Key)
  - `token` (Varchar 255, Not Null - berisi UUID)
  - `user_id` (BigInt, Unsigned, Not Null - *Foreign Key* merujuk ke `users.id`)
  - `create_at` (Timestamp, Default Now)

## 🛠️ Technology Stack & Library

- **Runtime & Package Manager**: [Bun](https://bun.sh/) (Cepat, *all-in-one* toolkit).
- **Bahasa Pemrograman**: TypeScript.
- **Web Framework**: [ElysiaJS](https://elysiajs.com/) (Web framework yang sangat cepat dan teroptimasi untuk Bun).
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (Type-safe ORM).
- **Database Driver**: `mysql2` untuk koneksi ke database MySQL.
- **Testing**: `bun:test` (Test runner bawaan Bun).
- **Password Hashing**: `Bun.password` (Bawaan Bun, algoritma bcrypt).

## 🚀 Cara Setup & Menjalankan Project

1. **Install Dependencies**:
   Jalankan perintah berikut di root folder project:
   ```bash
   bun install
   ```
2. **Setup Environment**:
   Salin `.env.example` menjadi `.env` dan atur URL koneksi database MySQL Anda:
   ```bash
   cp .env.example .env
   ```
   *(Pastikan database MySQL sudah berjalan dan dapat diakses sesuai URL di `.env`)*
3. **Migrasi Database**:
   Untuk mendorong skema Drizzle langsung ke database MySQL:
   ```bash
   bun run db:push
   ```
   *(Atau bisa juga dengan men-generate migration file menggunakan `bun run db:generate` lalu `bun run db:migrate`)*
4. **Menjalankan Aplikasi**:
   Untuk mode pengembangan (dengan *hot-reload* / *watch mode*):
   ```bash
   bun run dev
   ```
   Untuk menjalankan mode production:
   ```bash
   bun run start
   ```

## 🧪 Cara Testing Aplikasi

Aplikasi ini dilengkapi dengan unit test yang komprehensif untuk seluruh endpoint API. Untuk menjalankan pengujian, cukup eksekusi perintah:
```bash
bun test
```
Test ini diisolasi dan akan memvalidasi skema input (422 error), autentikasi kredensial (400 error), perlindungan endpoint menggunakan Authorization (401 error), serta sukses respons (200/201).
