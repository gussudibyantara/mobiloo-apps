# TravelOS authentication

Halaman: `/signup`, `/login`, `/forgot-password`, `/reset-password`, dan `/welcome`. Login Google dan email/password memakai Supabase Auth via SDK resmi `@supabase/ssr`. Password tidak disimpan di JSON aplikasi. Semua operasi autentikasi berjalan melalui route server; cookie sesi dan PKCE memakai HttpOnly, SameSite=Lax, serta Secure untuk production HTTPS.

## Konfigurasi

1. Buat proyek Supabase. Salin Project URL dan publishable key dari pengaturan proyek ke `.env.local`, mengikuti `.env.example`. Jangan gunakan service_role/secret key di `NEXT_PUBLIC_*`.
2. Di Authentication → Providers, aktifkan email/password dan Google. Untuk Google, buat OAuth client Web di Google Cloud lalu masukkan client ID dan secret ke pengaturan Google provider di Supabase. Client secret tidak ditaruh di aplikasi.
3. Authorized redirect URI Google adalah `https://PROJECT_REF.supabase.co/auth/v1/callback`, sesuai callback yang ditampilkan Supabase; bukan URL aplikasi Next.js.
4. Supabase Auth URL Configuration: Site URL sesuai domain aplikasi. Tambahkan URL aplikasi `/auth/callback` dan `/auth/callback?next=/reset-password` ke redirect allowlist. Untuk development, gunakan host yang konsisten, misalnya `http://localhost:3002`; jika memakai `127.0.0.1`, tambahkan URL host itu juga dan mulai/akhiri login pada host yang sama.
5. Aktifkan konfirmasi email. Default email template dengan ConfirmationURL mendukung callback PKCE. Untuk tautan yang dapat diverifikasi langsung melalui aplikasi, template signup dapat memakai `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`, dan recovery memakai `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`.
6. Konfigurasikan custom SMTP untuk pengiriman email production; layanan default Supabase dibatasi dan tidak untuk diandalkan sebagai pengiriman production.
7. Restart development server atau build ulang setelah mengubah konfigurasi. URL dan publishable key menggunakan konvensi `NEXT_PUBLIC_*`.

## Akses workspace saat ini

Pendaftaran membuat akun Auth, bukan workspace baru. Aplikasi masih memakai satu file JSON lokal; tenancy, database PostgreSQL per tabel dan provisioning bisnis belum dibangun. Pengguna baru masuk ke `/welcome` dan tidak mendapat akses data rental yang sudah ada.

Untuk memberi akun akses ke workspace lokal yang sama, salin UUID pengguna dari Supabase Authentication → Users ke `TRAVELOS_WORKSPACE_USER_IDS` (pisahkan koma untuk beberapa akun). Daftar ini hanya di server. Pemilik aplikasi harus memilih akun tersebut secara eksplisit. Ini bukan pembatasan data SaaS antarbisnis: semua akun dalam daftar melihat workspace yang sama. Jangan memasukkan pengguna bisnis berbeda ke daftar ini.

Proxy memverifikasi claims sesi serta izin workspace untuk halaman dan API, termasuk download lampiran/PDF. Persistence boundary memeriksa user terbaru melalui Auth server sebelum membaca/menulis data. Respons autentikasi tidak boleh di-cache. `/welcome` memverifikasi user sebelum menampilkan identitas; `/reset-password` memerlukan sesi terverifikasi untuk mengaktifkan form.

Tanpa konfigurasi Supabase, halaman tetap dapat ditinjau; tombol pengiriman/Google tidak aktif dan status layanan ditampilkan. Dashboard lokal masih bekerja di `pnpm dev` pada loopback. Build production tanpa Auth menolak akses data (503/redirect login). Untuk preview production **hanya di loopback**, jalankan `TRAVELOS_LOCAL_PREVIEW=1 pnpm start`; jangan pasang flag ini di layanan publik. Jika Auth sudah dikonfigurasi, flag preview tidak melewati pemeriksaan login/izin.

## Alur dan pengujian

- Signup email → verifikasi → `/welcome` → workspace jika UUID diizinkan.
- Google → consent screen → callback PKCE → `/welcome`.
- Lupa password → respons netral tanpa membocorkan email terdaftar → email recovery → callback → kata sandi baru → sesi keluar → login kembali.
- Akun Google menggunakan pemulihan Google jika belum memiliki password aplikasi.
- Logout mengakhiri sesi perangkat ini. Reset password meminta sign-out setelah penyimpanan.
- Callback gagal/kedaluwarsa dan cancel OAuth kembali ke login dengan pesan yang bisa ditindaklanjuti; redirect tujuan dibatasi pada `/welcome` dan `/reset-password`.
- Belum ada pengiriman email nyata atau consent Google nyata sebelum kredensial dikonfigurasi. Tes memakai provider tiruan dan akun uji, bukan data pelanggan.

Referensi: https://supabase.com/docs/guides/auth/server-side/creating-a-client, https://supabase.com/docs/guides/auth/social-sign-in/auth-google, https://supabase.com/docs/guides/auth/passwords.

## Kontak WhatsApp saat daftar

Signup email dan form pelengkap profil memakai awalan +62 tetap. Pengguna mengetik nomor nasional mulai dari 8; paste 08… atau +62… juga dirapikan. Payload dan metadata tetap memakai nomor lengkap +62…. Ini kontak profil yang dinyatakan pengguna, bukan nomor login SMS/OTP atau nomor WhatsApp yang sudah diverifikasi kepemilikannya.

Nomor disimpan di Supabase Auth user_metadata sebagai `whatsapp_number`. Checkbox kabar fitur baru telah dihapus dari form. Pengumpulan nomor tidak otomatis mengubah preferensi pemasaran menjadi true. API mempertahankan field preferensi untuk kompatibilitas dan default false jika tidak diberikan. Nilai ini tidak dipakai untuk otorisasi workspace. Untuk pengiriman pengumuman nanti, hanya pilih akun yang secara eksplisit memiliki opt-in true; halaman ini belum mengirim pesan atau menghubungkan WhatsApp Business API.

Signup Google menuju `/complete-profile` setelah OAuth jika kontak belum diisi. Endpoint `/api/auth/contact` memverifikasi sesi lalu menyimpan kontak ke profil pengguna tersebut. Tidak ada kontak yang dikirim lewat query string OAuth atau diberikan ke akun lain. Metadata nomor/opt-in tetap perlu dipindahkan ke tabel profil bisnis dan riwayat preferensi saat membangun pengelolaan pelanggan SaaS.
