# Rencana update visual & UX

Hasil audit build tanggal 10 Nov 2026 (5 ukuran layar, navigasi keyboard, kontras, berat halaman).
Centang `[x]` saat selesai. Urutan tahap = urutan pengerjaan yang disarankan.

## Tahap 1: Perbaikan cepat

Bug tampilan dan aksesibilitas. Tidak butuh bahan baru.

- [ ] **Label kategori terpotong di HP.** "Information System" terpotong di 360px dan `01 / 04` pecah dua baris. Perkecil font / izinkan dua baris / pendekkan label di layar sempit.
- [ ] **Tulisan "scroll ↓" menimpa kartu** di layar pendek (1366×650, 360×640). Pindahkan atau sembunyikan saat ruang tidak cukup.
- [ ] **Navigasi keyboard melompati isi halaman.** Elemen `.reveal` disembunyikan (`visibility: hidden`) sampai di-scroll, jadi email, tombol salin, dan link sosial tidak terjangkau Tab. Ganti animasi masuk supaya hanya memakai opacity/transform.
- [ ] **Tombol melayang bisa difokus saat tersembunyi.** Beri `inert` / `tabindex="-1"` selama tidak tampil.
- [ ] **Tombol melayang menutupi konten** (judul "About me", kartu grid di mobile). Lihat juga Tahap 2.
- [ ] **Tanpa JavaScript, kartu karya bertumpuk.** Buat kartu tersusun normal secara bawaan; mode tumpukan diaktifkan oleh JS.
- [ ] **Ukuran tombol header** minimal 44×44px (EN/ID sekarang 29×25, tema 32×32).
- [ ] **Kontras mode terang** (standar 4,5 : 1 teks kecil, 3 : 1 teks besar):
  - [ ] teks abu di latar krem 3,9 : 1 → gelapkan `--color-muted`
  - [ ] teks putih di tombol oranye 3,0 : 1 → oranye lebih tua untuk tombol, atau teks gelap
  - [ ] kata oranye miring di judul 2,6 : 1 → oranye lebih tua khusus teks
  - [ ] label kategori hijau/biru/ungu 10px 3,3–4,0 : 1 → varian warna teks yang lebih tua
  - [ ] judul kartu "Coming soon" 2,2 : 1
- [ ] **Cincin fokus yang jelas** (`:focus-visible` oranye, 2px) untuk semua link dan tombol.
- [ ] **Gambar pratinjau link** (`og:image` 1200×630 dengan Zebo + nama), `twitter:card`, dan `<link rel="canonical">`.
- [ ] **Logo header**: buat versi kecil (±72px, ±5 KB) dari `sticker.webp` (sekarang 84 KB untuk tampil 36px).
- [ ] **Struktur judul**: jadikan "Selected work" `<h2>`; beri `aria-label` pada `<nav>`.

## Tahap 2: Navigasi dan alur

- [ ] **Menu mobile.** Work/About/Contact sekarang tersembunyi di HP. Pilihan: bilah navigasi bawah, atau tombol menu yang membuka panel.
- [ ] **Angka `01 / 04` kontekstual.** Tampilkan hanya di bagian karya, atau ganti jadi indikator progres halaman.
- [ ] **Tombol melayang "let's build something"**: munculkan hanya saat tidak menutupi konten penting, perkecil di mobile, atau gabungkan ke menu mobile.
- [ ] **Bagian karya menyesuaikan jumlah project.** Selama project asli < 3: tampilkan kartu asli tanpa kunci scroll, dan pindahkan "Coming soon" ke grid saja. Kunci scroll + tumpukan aktif lagi otomatis saat project ≥ 3.
- [ ] **Layar pendek**: kartu mengecil jadi 76% di 1366×650. Pakai layout kartu yang lebih ringkas (gambar lebih pendek) alih-alih mengecilkan semuanya.
- [ ] **Hero mobile**: naikkan Zebo ke atas lipatan layar (di atas/samping judul) atau ringkas teks pembuka.

## Tahap 3: Halaman studi kasus

Kekurangan terbesar untuk portfolio: kartu project belum bisa dibuka.

- [ ] Rancang halaman/popup studi kasus: masalah → solusi → peran → hasil → galeri → stack.
- [ ] Dukungan dua bahasa (`/work/<slug>/` dan `/id/work/<slug>/`).
- [ ] Kartu dan item grid menaut ke studi kasus.
- [ ] Isi untuk **SIKerTas**.

**Bahan yang dibutuhkan dari pemilik:**
- screenshot SIKerTas (rasio 2:1 untuk kartu, bebas untuk galeri)
- cerita singkat: masalah klien, apa yang dibangun, peran, hasil/dampak
- project lain (profil perusahaan, aplikasi Android, karya media)

## Tahap 4: Polesan visual

- [ ] **Kartu kontak**: isi separuh kanan yang kosong di desktop dengan Zebo (pose menunjuk, atau 3D kedua).
- [ ] **Grid "4 crafts"**: terasa kosong karena 3 dari 4 kartu "Coming soon". Ubah jadi kartu bidang keahlian (ikon + deskripsi layanan) sampai project bertambah.
- [ ] **Toolkit**: hanya 3 chip, daftar 12 skill AI mendominasi. Lengkapi tools, atau kecilkan / lipat daftar skill.
- [ ] **Pose Zebo baru** per konteks (mis. berpikir, membawa laptop) supaya tidak selalu wajah yang sama.
- [ ] **Terminal di kartu & label `whoami`**: putuskan tetap gelap atau ikut tema terang.

## Tahap 5: Konten

Butuh keputusan/isi dari pemilik. Ditandai `TODO` di `src/data/portfolio.ts`.

- [ ] **Headline** yang menyebut bidang kerja (sistem informasi, aplikasi Android, video), bukan kalimat umum.
- [ ] **Bio "About me"** berbeda dari kalimat di hero (sekarang sama persis).
- [ ] **Statistik**: hapus atau ganti "6+ bulan".
- [ ] **Peran** (`Web & Creative Developer` masih pilihan sementara) dan **peran di SIKerTas** (`Developer`).
- [ ] **Perintah terminal SIKerTas** (`go run ./cmd/sikertas` karangan) dan hasil/dampak project.
- [ ] **Toolkit**: isi kelompok Motion, 3D, Desain.
- [ ] **CV** (PDF) untuk tombol unduh.

## Tahap 6: Performa

- [ ] **Zebo 3D di HP**: three.js (632 KB) + model (343 KB) langsung terunduh karena hero di layar pertama. Tunda sampai halaman idle atau sampai Zebo disentuh; tampilkan gambar diam dulu.
- [ ] **Font**: 20 file / 422 KB di build. Batasi ke subset latin + latin-ext.
- [ ] Ukur ulang berat muatan pertama (sekarang 1,5 MB, 14 request).

## Rilis

- [ ] Buat branch `main`, aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions).
- [ ] Cek di perangkat asli (HP Android, iPhone, laptop) terang dan gelap.

## Catatan hasil audit

| Ukuran | Nilai |
|---|---|
| Tinggi halaman (1440×900) | 6.042px, 2.520px di antaranya bagian karya yang terkunci |
| Muatan pertama | 1.538 KB, 14 request |
| Kontras mode gelap | aman (> 6 : 1) |
| Urutan Tab sekarang | logo → Work → About → Contact → EN → ID → tema → 2 tombol hero → tombol melayang → kembali ke atas |
