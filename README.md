# SNFI — Website Katalog

Situs statis Astro, dua bahasa (ID/EN), tanpa admin/database/keranjang.
Pertanyaan harga masuk lewat WhatsApp, telepon, atau email.

## Jalankan

```bash
cd web
npm install
npm run dev      # http://localhost:4321
npm run build    # hasil statis di dist/
npm run preview
```

## Ubah isi

| Mau ubah | Edit |
|---|---|
| Daftar produk | `src/data/products.json` (dihasilkan `../prepare.py` dari file Excel) |
| Nomor WA, telepon, alamat, domain | `src/data/site.json` |
| Semua teks antarmuka | `src/i18n/id.json` dan `src/i18n/en.json` |
| Warna, tipografi, grid bento | `public/assets/style.css` |
| Carousel, penghitung angka, filter | `public/assets/app.js` |
| Foto produk | `public/img/produk/<slug>.jpg` |

Daftar produk berubah di Excel? Jalankan `python3 prepare.py` dari folder induk,
salin `data/products.json` ke `web/src/data/`, lalu `npm run build`.

## Rute

```
/                 → alihkan ke /id/
/id/              /en/
/id/katalog/      /en/catalog/
/id/produk/:slug/ /en/products/:slug/
/id/tentang/      /en/about/
/id/kontak/       /en/contact/
```

`sitemap-index.xml` dan `robots.txt` dihasilkan otomatis saat build.

## Deploy

Vercel / Netlify / Cloudflare Pages — build `npm run build`, folder keluaran `dist`.
Ganti `url` di `src/data/site.json` ke domain asli sebelum deploy, kalau tidak
canonical dan hreflang menunjuk domain yang salah.
