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

Import repository ini di Vercel. Framework akan terdeteksi sebagai Next.js; gunakan build command default `npm run build`.

## Analytics PostHog

Salin `.env.example` ke `.env.local`, lalu isi `NEXT_PUBLIC_POSTHOG_KEY` dengan Project API Key dari proyek PostHog Cloud US. Tambahkan kedua environment variable tersebut di Vercel untuk production. Tanpa key, aplikasi tetap berjalan tetapi tidak mengirim analytics.

PostHog menangkap pageview, Web Vitals, error browser, dan event permainan agregat. Autocapture dan session replay dinonaktifkan agar nama pemain, isi jawaban, serta kata pencarian tidak terkirim.

Data kategori berada di `lib/data.ts`; sebelum menambah jawaban, jalankan `npm run validate:data` untuk memastikan rank dan nama tidak duplikat.
