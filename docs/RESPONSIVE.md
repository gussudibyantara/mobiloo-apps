# Responsive layout contract

Berlaku untuk Dashboard, Bookings, Kalender, Kendaraan, Maintenance, Inspeksi, dan setiap halaman TravelOS berikutnya.

## Layout bersama

- Gunakan shell aplikasi yang sama dari `src/components/dashboard.tsx`, dengan route dan status navigasi aktif yang benar. Perubahan sidebar, topbar, footer, dialog dan navigasi HP harus diterapkan melalui komponen bersama.
- Gunakan `minmax(0, 1fr)` untuk kolom fleksibel, `min-width: 0` untuk anak grid/flex, dan lebar konten maksimal yang tidak memaksa viewport melebar.
- Breakpoint dasar: HP sampai 760 px; tablet 761–1024 px; desktop mulai 1025 px. Layout tabel dapat berpindah lebih awal, saat ruang kontennya tidak cukup. Uji juga batas 760/761 dan 1024/1025 px.
- Tidak boleh ada horizontal overflow pada dokumen. Jadwal lebar boleh bergeser di region berlabel yang mendapat fokus keyboard. HP tetap mendapat agenda yang dapat dibaca tanpa menggeser tabel desktop.

## Konten dan interaksi

- Statistik empat kolom di desktop menjadi dua kolom pada layar sempit. Filter dan tombol harus membungkus tanpa bertumpuk atau terpotong.
- Daftar Bookings memakai tabel desktop dan kartu pada ruang lebih sempit. Tabel ringkasan Dashboard menjadi baris bertumpuk pada HP; seluruh informasi penting tetap tersedia.
- Kalender Minggu memakai timeline per kendaraan pada desktop/tablet dan agenda per tanggal pada HP. Bulan memakai sel ringkas dengan jumlah rental dan agenda tanggal terpilih. Hari memakai agenda serta daftar kendaraan tersedia.
- Drawer memenuhi tinggi viewport dinamis (`100dvh`), punya area konten yang dapat digulir dan footer tindakan yang tetap dapat dijangkau. Form tanggal menjadi satu kolom pada HP kecil. Input 16 px pada HP menghindari zoom otomatis iOS.
- Target navigasi dan tindakan utama HP minimal sekitar 40–44 px. Label, kontras, fokus keyboard, Escape, perangkap fokus dialog, dan reduced motion harus tetap berfungsi.
- Nama panjang, angka rupiah besar, data kosong, kegagalan jaringan, pesan validasi, dan daftar dengan banyak data harus diuji. Jangan menyembunyikan data penting sekadar agar halaman terlihat pas.

## Pemeriksaan sebelum selesai

Uji paling sedikit lebar 320, 360, 390, 430, 768, 820, 1024, 1280, 1440, dan 1920 px serta batas breakpoint. Periksa portrait dan landscape representatif, navigasi antarhalaman, filter terbuka, drawer detail/tambah/edit, dan tampilan kosong/error. Pastikan `document.documentElement.scrollWidth <= innerWidth` dan ambil screenshot untuk inspeksi visual. Ukuran yang diuji adalah cakupan pengujian, bukan klaim bahwa seluruh perangkat fisik telah diuji.

Pemeriksaan otomatis: jalankan server lalu `pnpm check:responsive`. Route sidebar baru ikut ditemukan otomatis. Gunakan `TRAVELOS_TEST_ROUTES` untuk menambahkan route lain. Hasil ada di `output/responsive/results.json`; review screenshot tetap diperlukan.

Modul armada memakai kartu kendaraan yang turun dari tiga kolom ke dua/satu kolom. Maintenance dan Inspeksi memakai tabel desktop serta kartu pada layar sempit. Semua form baru diperiksa pada HP; editor inspeksi juga diperiksa pada lebar 320, 390, 820 dan 1280 px, termasuk checklist, unggah foto, diagram kerusakan dan persetujuan.

Pelanggan, Pengeluaran dan Laporan menggunakan baris grid yang menjadi kartu pada layar sempit. Filter periode/cabang/kategori menjadi dua kolom di HP; semua select/input tetap berlabel dan dapat dioperasikan dengan keyboard. Pemeriksaan otomatis mencakup drawer Tambah pelanggan dan Tambah pengeluaran. Laporan mendukung gaya cetak tanpa navigasi/sidebar; PDF disimpan melalui dialog cetak browser.

Form Booking Baru dan Ubah Booking memakai popup kalender rentang melalui native Popover API (top layer), tanpa mendorong tinggi form. Jam diantar/kembali berada dalam popup yang sama (WITA, 24 jam). Posisi popup mengikuti pemicu dan batas viewport; viewport pendek menggulir isi popup. Selesai menerapkan tanggal dan jam sekaligus; Escape, klik di luar atau tombol tutup membatalkan draft. Fokus keyboard tetap di popup hingga ditutup. Pilihan rentang/fokus memakai aksen oranye dari design.md dan tombol utama gelap.

Semua form memakai label di atas kontrol, jarak label 8px dan gap grid 16px. Label checkbox/upload tetap memakai layout masing-masing. Dropdown native memakai satu chevron 16px yang sama dengan pemicu tanggal booking, inset kanan 14px dengan ruang khusus agar teks tidak menempel pada ikon. Tetap verifikasi label panjang, dua kolom form, checkbox dan pilihan dropdown pada HP.

Kalender bersama: `DatePicker` menangani tanggal tunggal, tanggal+jam dan rentang+jam; `DateField` menjadi adapter field formulir/filter dan `BookingDatePicker` hanya konfigurasi rental. Semua tanggal di Dashboard, Bookings, Kalender, Pelanggan, Kendaraan, Maintenance, Inspeksi, Pengeluaran, Pembayaran pengeluaran dan Laporan memakai popup yang sama. Field opsional bisa dikosongkan dengan Reset lalu Selesai; field wajib tetap mengikuti validasi form. Tambahkan pemilih tanggal berikutnya lewat komponen ini.

Invoice memakai daftar grid yang menjadi kartu di layar sempit, filter kalender bersama, form rincian tambahan dan preview dokumen yang membungkus teks panjang. Uji draft/terbit/pembayaran, drawer konfirmasi, preview/PDF serta bukti. Jangan memaksa preview HTML selebar kertas A4 di ponsel; PDF ekspor tetap berukuran A4 dengan pagination.

Rekanan dan Rekap memakai shell, select-chevron dan kalender bersama. Form profil/skema/rekonsiliasi/finalisasi/pembayaran/kredit/koreksi memakai drawer; kartu keuntungan menjadi dua kolom metrik pada HP. PDF pemilik A4 berpaginasi, preview HTML membungkus teks panjang tanpa lebar kertas tetap. Tambahkan rute dan drawer baru ke skrip pemeriksaan responsif.

Rekap rekanan sekarang mengelompokkan kendaraan menurut identitas pemilik. Ringkasan menampilkan nama rekanan, total hari tagihan, pendapatan bersih dan keuntungan operasional. Tombol pembuka rincian memakai aria-expanded/aria-controls; kendaraan, booking, hak bersih, potongan, biaya dan sumber transaksi tersedia di panel rincian. Kolom ringkasan mengalir ulang pada 1200px dan 760px; tombol invoice terpisah dari tombol pembuka rincian dan tetap dapat dijangkau di ponsel.

Buat invoice rekanan membuka form dengan pemilik dan periode yang dipilih. Periode berjalan tidak diganti otomatis dan tidak dapat difinalisasi; invoice final yang sudah ada dibuka kembali, bukan dibuat duplikat. Filter cabang hanya membatasi ringkasan; dokumen final tetap meliputi seluruh cabang pemilik, dengan penjelasan pada form. PDF pemilik tetap memakai whitelist bidang dan tidak memuat margin internal.

Validasi perubahan ini: 147 tes, typecheck, production build, serta HTTP halaman/aset untuk periode berjalan dan periode selesai lulus. Browser host tidak tersedia pada sesi ini; interaksi visual, keyboard, dan overflow belum diverifikasi pada ukuran viewport apa pun. Dua pengujian render server memeriksa pemilik terpilih, periode berjalan, dan pencegahan finalisasi/duplikasi; ini bukan pengganti pemeriksaan browser.
