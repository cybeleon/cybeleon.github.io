# Menambah gambar / algoritma ke bagian "Others"

Gambar muncul sebagai kartu di grup **Others — algorithms, charts & references**, bisa dicari lewat judul, kata kunci,
keterangan (caption) dan teks alt, dan bisa di-klik untuk memperbesar.

## 1. Siapkan file gambar
* Format: `.png`, `.jpg`, `.webp` atau `.svg` (SVG paling tajam untuk bagan).
* Nama file: huruf kecil, tanpa spasi, mis. `algoritma-tuli-kongenital.png`.
* Ukuran: lebar 1200–2000 px cukup; usahakan < 500 KB agar halaman ringan (kompres di squoosh.app / tinypng.com).
* Pastikan Anda berhak memakai gambar tersebut (buat sendiri, atau cantumkan sumber/izin di `credit`).

## 2. Taruh di folder
Salin file ke folder `assets/img/` di repo GitHub Pages Anda (Add file → Upload files, atau lewat git).

## 3. Tambahkan satu blok di `assets/calc/gallery.js`
Tempel blok ini sebelum baris `})();` terakhir, lalu ubah isinya:

```js
Calc.ref({
  id: 'nama-unik-tanpa-spasi',          // juga jadi tautan: calculators.html#nama-unik-tanpa-spasi
  group: OTH,                            // biarkan; ini grup "Others"
  title: 'Judul kartu',
  subtitle: 'Keterangan singkat',
  keywords: ['kata kunci', 'sinonim', 'istilah Inggris', 'singkatan'],   // agar mudah dicari
  blocks: [
    { type: 'image', src: 'assets/img/nama-file.png',
      alt: 'Deskripsi isi gambar (ikut dicari)',
      caption: 'Keterangan di bawah gambar (ikut dicari)',
      credit: 'Sumber: …' },            // credit opsional
    // boleh menambah beberapa gambar, daftar, atau tabel:
    { type: 'list',  items: ['poin 1', 'poin 2'] },
    { type: 'table', head: ['Kolom A', 'Kolom B'], rows: [['a1', 'b1'], ['a2', 'b2']] },
    { type: 'note',  text: 'Catatan kecil.' },
  ],
  refs: [{ text: 'Penulis. Judul. Jurnal/Buku tahun;vol:hal.' }],
});
```

* Satu kartu boleh berisi banyak gambar: tambahkan beberapa blok `{ type: 'image', … }`.
* Teks di tabel dan daftar juga ikut pencarian, jadi tulis istilah penting di sana.
* Jika file gambar belum ada, kartu menampilkan "Gambar belum ditambahkan — taruh file di …" (tidak error).

## 4. Pindah grup (opsional)
Ganti `group: OTH` dengan nama grup lain, mis. `group: 'Otolaryngology, Head & Neck, Hearing & Speech'`,
agar kartu muncul di bidang tersebut.

## 5. Gambar yang sudah disiapkan slotnya
| Kartu | File yang diharapkan |
|---|---|
| Speech banana | `assets/img/speech-banana.svg` (sudah ada — ilustrasi skematik buatan sendiri; boleh diganti) |
| Algoritma tatalaksana tuli sensorineural kongenital | `assets/img/algoritma-snhl-kongenital.png` |
| Refleks fisiologis & patologis dan jalurnya | `assets/img/refleks-jalur.png` |

Cukup taruh file dengan nama tersebut di `assets/img/` — kartu otomatis menampilkannya.

## Tes lokal
Buka folder dengan server sederhana (`python3 -m http.server`) lalu buka `http://localhost:8000/calculators.html#nama-unik`.
