# Nyaris Terkenal

Party game lokal Indonesia: jawaban yang makin dekat ke peringkat #100 memberi poin makin besar.

## Menjalankan lokal

```bash
npm install
npm run dev
```

## Pemeriksaan

```bash
npm run validate:data
npm test
npm run build
```

## Deploy ke Vercel

Import repository ini di Vercel. Framework akan terdeteksi sebagai Next.js; gunakan build command default `npm run build`. Tidak ada environment variable, backend, atau database yang diperlukan.

Data kategori berada di `lib/data.ts`; sebelum menambah jawaban, jalankan `npm run validate:data` untuk memastikan rank dan nama tidak duplikat.
