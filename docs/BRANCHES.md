# Cabang operasional

Route `/branches` menggunakan shell dan komponen drawer/form TravelOS. Registry cabang tersimpan di data lokal workspace; ini bukan pemisahan tenant atau pembatasan hak akses akun.

## Perilaku

- Tambah cabang: nama, kode unik opsional, kota, alamat, telepon, email, PIC karyawan, dan catatan.
- Nama merupakan key kompatibilitas yang tetap setelah dibuat. Profil, kode, kontak, PIC dan catatan dapat diedit. Perubahan nama memerlukan migrasi sumber serta kebijakan dokumen tersendiri.
- PIC harus karyawan aktif pada cabang yang sama. Pindah cabang/nonaktifnya karyawan mengosongkan PIC terkait dan menaikkan revisi cabang.
- Nonaktifkan/aktifkan kembali, tanpa penghapusan riwayat. Nonaktifkan ditolak bila masih ada kendaraan/karyawan aktif atau booking/maintenance terbuka.
- Filter historis memuat cabang nonaktif. Form baru hanya menawarkan cabang aktif; form edit mempertahankan nilai cabang sebelumnya.
- Pilihan cabang dashboard, bookings, kalender, armada, inspeksi, maintenance, karyawan, pengeluaran, laporan, invoice, dan rekap memakai `branches-shared.ts`.
- Registry lama dibuat dari nama cabang yang direferensikan data, bukan menambahkan cabang contoh. Ringkasan booking mengikuti cabang kendaraan saat ini. Invoice dan rekap final tetap menggunakan snapshot sumber masing-masing.
- Belum ada migrasi ke PostgreSQL, isolasi antarperusahaan, pembatasan akun per cabang, atau workflow mutasi kendaraan dengan riwayat lokasi terpisah.

## Validasi implementasi

- TypeScript: lulus.
- Seluruh 12 suite / 138 tes: lulus, termasuk 7 tes aturan registry cabang.
- Production build: lulus, route `/branches` dan API tersedia.
- Integrasi HTTP dengan file data QA terpisah: tambah, retry idempotent, muat ulang persisten, edit, konflik revisi, nonaktifkan, aktifkan kembali, dan HTTP halaman 200: lulus.
- Form cabang ditambahkan ke skrip `check-responsive.cjs` untuk pengujian berikutnya.
- Browser host tidak tersedia dalam sesi implementasi ini. Belum ada verifikasi visual, screenshot, keyboard, atau pengukuran overflow pada breakpoint; jangan menganggap ukuran viewport apa pun telah diuji melalui browser.
