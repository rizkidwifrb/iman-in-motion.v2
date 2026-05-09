# IMAN IN MOTION React Tailwind Revision Fix

Revisi ini membenahi versi React + Tailwind sebelumnya berdasarkan feedback:

## Yang diperbaiki

1. Mobile hamburger menu dibuat ulang agar tidak compang-camping.
2. Landing page sekarang menampilkan 6 mood sekaligus dalam panel hero.
3. Halaman Mood tetap tersedia dan berisi 6 mood final.
4. Dalil dan refleksi mood ditambahkan kembali pada mood card, halaman film, dan detail film.
5. Halaman Info menambahkan kembali Team UIKA-Berani Project:
   - Rizki Dwi Febriansyah — Fullstack Developer
   - Muhammad Fidri Takhrimsyah — Data Engineer
   - Faris All Farizki — Database Administrator
6. Fitur lama tetap dipertahankan: film, artikel, AIMAN, info, backend /api/chat, data lama, dan public fallback.

## Cara jalanin

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

Untuk backend AIMAN:

```bash
npm start
```

Untuk build:

```bash
npm run build
npm start
```

## Catatan

Jangan buka `index.html` langsung. React harus dibuka lewat Vite dev server atau Express setelah build.
