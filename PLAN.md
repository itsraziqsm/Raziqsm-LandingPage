# Rencana update visual & UX

Hasil audit build tanggal 10 Nov 2026 (5 ukuran layar, navigasi keyboard, kontras, berat halaman).
Centang `[x]` saat selesai. Urutan tahap = urutan pengerjaan yang disarankan.

## Tahap 1: Perbaikan cepat

Bug tampilan dan aksesibilitas. Tidak butuh bahan baru. **Selesai 10 Nov 2026.**

- [x] **Label kategori terpotong di HP.** "Information System" terpotong di 360px dan `01 / 04` pecah dua baris. Perkecil font / izinkan dua baris / pendekkan label di layar sempit.
- [x] **Tulisan "scroll ↓" menimpa kartu** di layar pendek (1366×650, 360×640). Pindahkan atau sembunyikan saat ruang tidak cukup.
- [x] **Navigasi keyboard melompati isi halaman.** Elemen `.reveal` disembunyikan (`visibility: hidden`) sampai di-scroll, jadi email, tombol salin, dan link sosial tidak terjangkau Tab. Ganti animasi masuk supaya hanya memakai opacity/transform.
- [x] **Tombol melayang bisa difokus saat tersembunyi.** Beri `inert` / `tabindex="-1"` selama tidak tampil.
- [x] **Tombol melayang menutupi konten**: di desktop jadi pill ringkas di kanan bawah, di mobile lebih tipis. Penyelesaian penuh (kapan muncul, gabung menu mobile) ada di Tahap 2.
- [x] **Tanpa JavaScript, kartu karya bertumpuk.** Buat kartu tersusun normal secara bawaan; mode tumpukan diaktifkan oleh JS.
- [x] **Ukuran tombol header** minimal 44×44px (EN/ID sekarang 29×25, tema 32×32).
- [x] **Kontras mode terang** (standar 4,5 : 1 teks kecil, 3 : 1 teks besar):
  - [x] teks abu di latar krem 3,9 : 1 → gelapkan `--color-muted`
  - [x] teks putih di tombol oranye 3,0 : 1 → oranye lebih tua untuk tombol, atau teks gelap
  - [x] kata oranye miring di judul 2,6 : 1 → oranye lebih tua khusus teks
  - [x] label kategori hijau/biru/ungu 10px 3,3–4,0 : 1 → varian warna teks yang lebih tua
  - [x] judul kartu "Coming soon" 2,2 : 1
- [x] **Cincin fokus yang jelas** (`:focus-visible` oranye, 2px) untuk semua link dan tombol.
- [x] **Gambar pratinjau link** (`og:image` 1200×630 dengan Zeebo + nama), `twitter:card`, dan `<link rel="canonical">`.
- [x] **Logo header**: buat versi kecil (±72px, ±5 KB) dari `sticker.webp` (sekarang 84 KB untuk tampil 36px).
- [x] **Struktur judul**: jadikan "Selected work" `<h2>`; beri `aria-label` pada `<nav>`.

## Tahap 2: Navigasi dan alur

**Selesai 10 Nov 2026.**

- [x] **Menu mobile.** Tombol menu di header membuka panel berisi Karya / Tentang / Kontak dan pilihan bahasa. Tutup dengan klik link, klik di luar, atau Escape. Bagian yang sedang dilihat ditandai (juga di menu desktop).
- [x] **Angka `01 / 04` kontekstual.** Hanya muncul selama tumpukan kartu ada di layar; tidak dirender sama sekali di mode daftar.
- [x] **Tombol melayang "let's build something"**: hanya di desktop (pill ringkas kanan bawah). Di HP perannya digantikan link Kontak di menu.
- [x] **Bagian karya menyesuaikan jumlah project.** Diatur lewat `WORK_LAYOUT` di `src/data/portfolio.ts`: `"stack"` (tumpukan GSAP, dipakai sekarang atas permintaan pemilik, 10 Nov 2026), `"list"`, atau `"auto"` (daftar di bawah 3 project asli, tumpukan mulai 3).
- [x] **Layar pendek**: di mode tumpukan gambar kartu dibuat lebih pipih (16:6, lalu 16:5) sehingga kartu tidak perlu banyak dikecilkan (1366×650: 76% → 89%).
- [x] **Hero mobile**: kartu Zeebo pindah ke atas judul dengan bingkai lebih lebar dan pendek, sehingga Zeebo dan tombol utama terlihat tanpa scroll.

## Tahap 3: Halaman studi kasus

Kekurangan terbesar untuk portfolio: kartu project belum bisa dibuka.

- [ ] Rancang halaman/popup studi kasus: masalah → solusi → peran → hasil → galeri → stack.
- [ ] Dukungan dua bahasa (`/work/<slug>/` untuk Indonesia, `/en/work/<slug>/` untuk Inggris).
- [ ] Kartu dan item grid menaut ke studi kasus.
- [ ] Isi untuk **SIKerTas**.

**Bahan yang dibutuhkan dari pemilik:**
- screenshot SIKerTas (rasio 2:1 untuk kartu, bebas untuk galeri)
- cerita singkat: masalah klien, apa yang dibangun, peran, hasil/dampak
- project lain (profil perusahaan, aplikasi Android, karya media)

## Tahap 4: Polesan visual

**Selesai 10 Nov 2026.**

- [x] **Kartu kontak**: Zeebo (pose menunjuk, dicerminkan supaya menunjuk ke teks) mengisi sisi kanan di desktop, dan tampil kecil di pojok kanan bawah di HP.
- [x] **Grid "4 bidang"**: sekarang kartu bidang keahlian (ilustrasi, nomor, nama, satu kalimat layanan, daftar project di bidang itu atau "studi kasus pertama segera hadir"). Kalimat layanan ada di `blurb` tiap kategori di `src/data/portfolio.ts` dan masih draf.
- [x] **Toolkit**: judul di kiri, tools di kanan; daftar 12 skill AI jadi panel lipat yang tertutup secara bawaan. Mengisi kelompok Motion / 3D / Desain tetap di Tahap 5.
- [x] **Pose Zeebo baru**: `think` (berpikir, dipakai di kartu profil) dan `laptop` (bekerja dengan laptop, dipakai di bidang Sistem Informasi). Total 7 pose.
- [x] **Terminal di kartu & label `whoami`**: diputuskan tetap gelap di kedua tema, karena memang meniru jendela terminal dan jadi ciri khas desainnya.

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

**Selesai 10 Nov 2026.**

- [x] **Zeebo 3D di HP**: di layar sentuh, mode hemat data, atau 2G, versi 3D tidak lagi dimuat otomatis. Gambar diam tampil, dan 3D dimuat saat Zeebo atau tombol "Lihat versi 3D" disentuh. Di desktop, 3D baru dimuat setelah halaman selesai dan browser senggang.
- [x] **Font**: build dibatasi ke subset latin + latin-ext (20 → 12 file). Font judul (Instrument Serif) di-preload. Urutan deklarasi mengikuti paket aslinya; urutan terbalik membuat browser mengunduh 2 file latin-ext tambahan (+23 KB).
- [x] Ukur ulang berat muatan pertama.

| Muatan pertama | Sebelum | Sesudah |
|---|---|---|
| HP (Pixel 7) | 849 KB, 15 request | 345 KB, 13 request (−59%) |
| Desktop | 877 KB, 16 request | 874 KB, 16 request; 3D kini dimuat setelah halaman selesai |
| Font terunduh | 127 KB | 127 KB (sudah hanya latin) |

Belum dikerjakan (manfaat kecil): versi kecil gambar pose Zeebo (±28 KB per gambar, dimuat lazy).

## Rilis

- [x] Buat branch `main` dari `claude/zealous-bell-807lwb` (workflow diperbarui: `withastro/action@v6` dengan Node 24, `deploy-pages@v5`).
- [ ] Aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions), lalu jalankan ulang workflow "Deploy to GitHub Pages".
- [ ] Jadikan `main` sebagai default branch (Settings → General → Default branch).
- [ ] Cek di perangkat asli (HP Android, iPhone, laptop) terang dan gelap.

## Catatan hasil audit

| Ukuran | Nilai |
|---|---|
| Tinggi halaman (1440×900) | 6.042px, 2.520px di antaranya bagian karya yang terkunci |
| Muatan pertama | 1.538 KB, 14 request |
| Kontras mode gelap | aman (> 6 : 1) |
| Urutan Tab sekarang | logo → Work → About → Contact → EN → ID → tema → 2 tombol hero → tombol melayang → kembali ke atas |
