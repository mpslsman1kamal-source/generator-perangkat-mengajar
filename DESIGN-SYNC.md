# DESIGN-SYNC — Sinkronisasi PRD v1.2 ↔ ZIP Google Stitch ↔ Kode

Desain acuan: **Blueprint Brutalist Edu-Workbench** (`blueprint_brutalist_edu_workbench/DESIGN.md`).

## 1. Token desain (css/tokens.css)
| Token | Nilai | Sumber |
|---|---|---|
| Kanvas | #F8F9FF | DESIGN.md |
| Garis/border | 2px solid #000 | DESIGN.md |
| Bayangan keras | offset 4px 4px 0 #000 | DESIGN.md |
| Radius | 2px | DESIGN.md |
| Font | Inter (teks), JetBrains Mono (kode/angka) | DESIGN.md |
| Ikon | Material Symbols Outlined | layar Stitch |
| Sidebar / Topbar | 240px / 64px | dashboard_utama |
| Aksen menu | 1 biru, 2 hijau, 3 kuning, 4 oranye, 5 teal, 6 ungu, 7 indigo, 8 merah, 9 magenta | layar menu_01…09 |
| Badge status | Belum abu-abu, Draf kuning, Final hijau | layar menu |

## 2. Halaman PRD ↔ folder ZIP ↔ rute ↔ status
| Halaman | Folder ZIP | Rute | Status |
|---|---|---|---|
| Dashboard | dashboard_utama_… | `#/` | dari ZIP |
| 1 RPE | menu_01_rpe_rincian…, …pratinjau… | `#/m/1` | dari ZIP |
| 2 CP-TP-ATP | menu_02_… (2 folder) | `#/m/2` | dari ZIP |
| 3 Prota | menu_03_… (2) | `#/m/3` | dari ZIP |
| 4 Promes Ganjil | menu_04_… (2) | `#/m/4` | dari ZIP |
| 5 Promes Genap | menu_05_… (2) | `#/m/5` | dari ZIP |
| 6 KKTP | menu_06_… (2) | `#/m/6` | dari ZIP |
| 7 RPM/RPP | menu_07_… | `#/m/7` | dari ZIP |
| 8 Asesmen | menu_08_… | `#/m/8` | dari ZIP |
| 9 Jurnal | menu_09_… (2) | `#/m/9` | dari ZIP |
| Arsip & ZIP | menu_arsip_… | `#/arsip` | dari ZIP |
| Pengaturan tab 1–3 | menu_pengaturan_… (3) | `#/pengaturan/{gemini,dokumen,akun}` | dari ZIP |
| Profil & Data Induk | — | `#/profil` | **diturunkan dari PRD** |
| Masuk, Daftar, Lupa, Reset sandi | — | `#/masuk` `#/daftar` `#/lupa` `#/reset/:token` | **diturunkan dari PRD** (memakai token & komponen yang sama) |
| WA & CRM | — | `#/wa/:tab` | **tambahan** (modul gas-notifikasi-wa-crm) |
| Template Kustom | — | `#/template` | **tambahan** (modul gas-doc-engine) |
| Impor Data | — | `#/impor` | **tambahan** (modul gas-migrasi-database) |

## 3. Ketidaksesuaian & keputusan
- PRD menyebut HtmlService; dibangun sebagai REST API (GAS) + frontend terpisah sesuai permintaan (gas-pro-api).
- Tailwind CDN pada HTML Stitch diganti CSS sendiri (tanpa dependensi build).
- Promes: JP per pekan disimpan sebagai JSON (`jp_minggu`).
- Tautan reset kata sandi: `{APP_URL}/#/reset/{token}`.

## 4. Komponen bersama
Tombol, field, tabel, badge status, kartu aksen, stepper, toast, modal konfirmasi, panel pemeriksa (`G.validasi`), bilah dokumen (`G.docBar`), pratinjau kertas (`G.renderModel`), editor tabel, kerangka semester (`G.semHal`).
