# IMAN IN MOTION - React + Tailwind Upgrade

Versi ini mempertahankan backend Node/Express lama, endpoint `/api/chat`, data RAG, file public lama sebagai fallback, dan menambahkan frontend baru berbasis React + Tailwind CSS.

## Yang berubah

- Frontend utama baru memakai Vite + React + Tailwind.
- UI dibuat lebih premium, responsive, cinematic, dan mobile-first.
- Mood final tetap: Sedih, Gelisah, Hidayah, Bahagia, Marah, Rindu.
- Data film dari `public/js/movies.js` dipindahkan ke `src/data/movies.js`.
- Data artikel dari `public/articles-data.js` dipindahkan ke `src/data/articles.js`.
- AIMAN Chat tetap memakai endpoint backend `/api/chat`.
- `app.js` sudah disesuaikan agar serve folder `dist` hasil build React, lalu fallback ke folder `public` lama.

## Cara jalanin local

Install dependency:

```bash
npm install
```

Jalankan backend AIMAN:

```bash
npm start
```

Buka terminal kedua untuk frontend React:

```bash
npm run dev
```

Akses Vite biasanya di:

```text
http://localhost:5173
```

Endpoint `/api/chat` akan diproxy ke backend `http://localhost:8080`.

## Cara build untuk Railway/production

```bash
npm install
npm run build
npm start
```

Setelah `npm run build`, folder `dist/` akan dibuat. `app.js` akan otomatis menampilkan React app dari `dist/index.html`.

## Catatan penting

- File `.env` sengaja tidak dimasukkan ke ZIP hasil upgrade. Buat sendiri `.env` di lokal/Railway dengan:

```env
GROQ_API_KEY=isi_api_key_kamu
GROQ_MODEL=llama-3.1-8b-instant
PORT=8080
```

- Folder `public/` lama tetap ada supaya asset lama, logo, dan file fallback tidak hilang.
- Kalau Railway memakai start command, pakai:

```bash
npm run build && npm start
```

atau set build command `npm run build`, start command `npm start`.

## Struktur baru

```text
src/
├── main.jsx
├── components/
├── data/
├── pages/
├── services/
└── styles/
```

