# Panduan Instalasi — Generator Perangkat Mengajar

Ada dua bagian: **A. Backend (Google Apps Script)** lalu **B. Frontend (GitHub Pages)**.

## A. Backend
1. Buka https://script.google.com → **Proyek baru**. Beri nama "GPM API".
2. Buat satu berkas skrip untuk **setiap** berkas `.gs` yang Anda terima (Kalkulator, Kode, Rahasia, Db, Setup, Auth, Gemini, Prompt, Notif, Rpe, Cp, Prota, Rpm, Asesmen, Export, DocEngine, Migrasi). Tempel isinya persis. Hapus `Code.gs` bawaan.
3. Di Pengaturan Proyek (ikon roda gigi) centang **Show "appsscript.json"**, lalu ganti seluruh isinya dengan berkas `appsscript.json` yang Anda terima.
4. Pilih fungsi **`setupAppEnvironment`** → **Jalankan**. Setujui izin (Spreadsheet, Drive, UrlFetch, Mail, Trigger, Dokumen). Ini membuat spreadsheet database, folder Drive, dan rahasia acak otomatis (di Script Properties).
5. **Deploy → Deployment baru → Web app**: Execute as **Me**, Who has access **Anyone**. Salin URL yang berakhir `/exec`.
6. Pengaturan Proyek → **Script Properties** → tambah:
   - `APP_URL` = alamat GitHub Pages Anda, diakhiri `/` (mis. `https://username.github.io/gpm/`) — dipakai tautan reset sandi.
   - Opsional: `GEMINI_KEY_DEFAULT` (kunci cadangan bersama) dan `BATAS_HARIAN_DEFAULT`.
7. Setiap kali kode `.gs` diubah: **Deploy → Kelola deployment → Edit → Versi baru**.

Rahasia **terisi otomatis** (jangan diisi tangan): kunci tanda tangan sesi, ID spreadsheet/folder. Rahasia **diisi guru di aplikasi**: kunci Gemini dan token Fonnte (Pengaturan → Gemini API / WA & CRM). Tidak ada rahasia di frontend, sheet, atau repositori.

Trigger `workerTick` (1 menit) dibuat otomatis oleh setup untuk memproses antrean notifikasi. Kuota email Gmail gratis ±100/hari.

## B. Frontend (GitHub Pages)
1. Ekstrak `gpm-frontend.zip`. Folder hasil ekstraksi (berisi `index.html`) **adalah** folder yang di-`git init` — jangan masuk lebih dalam atau naik satu level.
2. Buka `js/config.js`, ganti `GANTI_DENGAN_URL_EXEC_WEB_APP_ANDA` dengan URL `/exec` dari langkah A5. Simpan.
3. Install Git (https://git-scm.com), lalu atur identitas sekali saja:
   ```
   git config --global user.name "Nama Anda"
   git config --global user.email "email@akun-github.com"
   ```
4. Di github.com buat repository **Public** baru (jangan centang README).
5. Buka terminal **di folder hasil ekstraksi**, cek `dir` (Windows) / `ls` (Mac/Linux): harus tampak `index.html`, `css`, `js`. Lalu:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Password = **Personal Access Token** (github.com/settings/tokens → classic → centang `repo`). Saat paste token layar tampak kosong; itu normal.
6. Repo → **Settings → Pages** → Deploy from a branch → `main` / root → Save; centang **Enforce HTTPS**. Tunggu 1–2 menit.
7. Pastikan `APP_URL` (langkah A6) sama dengan alamat Pages ini.
8. Update berikutnya: `git add .` → `git commit -m "pesan"` → `git push`, lalu Ctrl+Shift+R.

## C. Pemakaian pertama
Daftar akun → lengkapi **Profil & Data Induk** (sekolah, mapel, kelas, daftar bab) → **Pengaturan → Gemini API**: tempel kunci (aistudio.google.com), Uji koneksi, Pilih otomatis → ikuti alur Menu 1–9.

## D. Migrasi data lama
Menu **Impor Data**: unggah CSV (bab / CP / TP), jalankan *dry-run* dulu, lalu impor. Aman diulang (tidak menggandakan data).

## E. Masalah umum
- Halaman login muncul tetapi "gagal terhubung": `GAS_URL` belum diisi / deployment belum "Anyone".
- Setelah mengubah `.gs` tidak berubah: buat **versi baru** deployment.
- Ikon tampil sebagai teks: koneksi internet ke Google Fonts terblokir.
