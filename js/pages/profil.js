(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  G.route('/profil', function () {
    var c = G.layout('Profil & Data Induk', 'profil');
    var b = G.S.boot; if (!b) { c.appendChild(G.skel(6)); return G.segarBoot().then(function () { G.render(); }); }
    var p = Object.assign({}, b.profil), bab = (b.bab || []).map(function (x) { return Object.assign({}, x); });
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'Profil & Data Induk'), h('p', null, 'Data ini dipakai otomatis oleh seluruh dokumen. Isi sekali, dipakai semua menu.'))));
    var f = {}; function fld(k, label, o) { f[k] = G.input(p[k] || '', Object.assign({ on: function (v) { p[k] = v; } }, o || {})); return G.field(label, f[k], (o && o.hint) || null); }
    var kelasSel = G.select([['', '— pilih —'], 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', '1', '2', '3', '4', '5', '6'], p.kelas, function (v) { p.kelas = v; }), faseSel = G.select([['', '— pilih —'], 'A', 'B', 'C', 'D', 'E', 'F'], String(p.fase || '').replace(/^fase\s*/i, ''), function (v) { p.fase = v; }), jjg = G.select(['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA'], p.jenjang || 'SMA', function (v) { p.jenjang = v; });
    var kartu = h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Identitas')), h('div', { class: 'bd grid g2' },
      fld('nama_sekolah', 'Nama satuan pendidikan'), fld('kota', 'Kota / kabupaten (untuk tanda tangan)'), fld('nama_guru', 'Nama guru (dengan gelar)'), fld('nip_guru', 'NIP guru', { mode: 'numeric' }), fld('nama_ks', 'Nama kepala sekolah'), fld('nip_ks', 'NIP kepala sekolah', { mode: 'numeric' }),
      fld('mapel', 'Mata pelajaran'), G.field('Kelas', kelasSel), G.field('Fase', faseSel), G.field('Jenjang', jjg), fld('tahun_pelajaran', 'Tahun pelajaran', { ph: '2026/2027' }), fld('no_wa', 'Nomor WhatsApp (untuk notifikasi)', { mode: 'tel', ph: '08xxxxxxxxxx' })));
    c.appendChild(kartu);
    // Bab
    var tb = h('tbody'), tw = h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Semester', 'No. Bab', 'Nama bab / materi', 'Bobot', ''].map(function (t) { return h('th', null, t); }))), tb));
    function gambarBab() {
      G.clear(tb); bab.forEach(function (x, i) {
        tb.appendChild(h('tr', null, h('td', { style: { width: '120px' } }, G.select([['1', 'Ganjil'], ['2', 'Genap']], x.semester, function (v) { x.semester = v; })), h('td', { style: { width: '90px' } }, G.input(x.no_bab, { mode: 'numeric', on: function (v) { x.no_bab = v; } })), h('td', null, G.input(x.nama_bab, { max: 200, on: function (v) { x.nama_bab = v; } })), h('td', { style: { width: '90px' } }, G.input(x.bobot || 1, { type: 'number', min: 1, step: 1, on: function (v) { x.bobot = v; } })), h('td', { style: { width: '50px' } }, G.btn('', { ico: 'delete', cls: 'sm ghost', title: 'Hapus bab' }, function () { bab.splice(i, 1); gambarBab(); }))));
      });
      if (!bab.length) tb.appendChild(h('tr', null, h('td', { colspan: 5 }, h('div', { class: 'empty' }, 'Belum ada bab. Tambahkan bab untuk tiap semester.'))));
    }
    gambarBab();
    c.appendChild(h('div', { class: 'card', style: { marginTop: '16px' } }, h('div', { class: 'hd' }, h('h2', null, 'Daftar bab'), G.btn('Tambah bab', { ico: 'add', cls: 'sm' }, function () { var mx = bab.reduce(function (a, x) { return Math.max(a, Number(x.no_bab) || 0); }, 0); bab.push({ semester: bab.length && bab[bab.length - 1].semester || '1', no_bab: String(mx + 1), nama_bab: '', bobot: 1 }); gambarBab(); })),
      h('div', { class: 'bd stack' }, h('div', { class: 'hint' }, 'Bobot menentukan porsi jumlah TP dan JP tiap bab (bab lebih luas = bobot lebih besar).'), tw)));
    c.appendChild(h('div', { class: 'row end', style: { marginTop: '16px' } }, G.btn('Simpan semua', { cls: 'pri', ico: 'save' }, function () {
      return G.tulis('profil.simpan', p, { toast: false }).then(function (r) { if (!r.success) return; return G.tulis('bab.simpan', { bab: bab }, { toast: false }).then(function (r2) { if (r2.success) { G.toast('Profil dan daftar bab tersimpan.', 'ok'); G.go('#/'); } }); });
    })));
  });

  /* ---------- Pengaturan ---------- */
  G.route('/pengaturan/:tab', function (tab) {
    var c = G.layout('Pengaturan', 'set'); tab = ['gemini', 'dokumen', 'akun'].indexOf(tab) >= 0 ? tab : 'gemini';
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'Pengaturan'))));
    var tabs = h('div', { class: 'tabs', role: 'tablist' }); [['gemini', 'Gemini API'], ['dokumen', 'Preferensi Dokumen'], ['akun', 'Akun & Keamanan']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', class: tab === t[0] ? 'on' : '', onclick: function () { G.go('#/pengaturan/' + t[0]); } }, t[1])); });
    c.appendChild(tabs); var isi = h('div', { class: 'stack' }, G.skel(5)); c.appendChild(isi);
    (tab === 'gemini' ? tabGemini : (tab === 'dokumen' ? tabDokumen : tabAkun))(isi);
  });

  function tabGemini(isi) {
    G.api('pengaturan.get', {}).then(function (r) {
      G.clear(isi); var p = r.data || {}, st = p.key_status || 'Belum diatur';
      var key = G.input('', { type: 'password', ac: 'off', ph: p.key_petunjuk ? '••••••••' + p.key_petunjuk + ' (tersimpan)' : 'Tempel API key dari Google AI Studio', max: 200 });
      var hasil = h('div', { class: 'stack s8' });
      var kartuKey = h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'API key Gemini'), G.badge(st === 'Terhubung' ? 'Terhubung' : (st === 'Bermasalah' ? 'Bermasalah' : 'Belum'))),
        h('div', { class: 'bd stack' }, h('p', { class: 'muted', style: { margin: 0 } }, 'Kunci Anda disimpan terenkripsi di server (Script Properties), tidak pernah dikirim kembali ke browser. Dapatkan kunci gratis di ', h('a', { href: 'https://aistudio.google.com/apikey', target: '_blank', rel: 'noopener' }, 'Google AI Studio'), '.'),
          G.field('API key', key), h('div', { class: 'row' },
            G.btn('Simpan kunci', { cls: 'pri', ico: 'key' }, function () { if (!key.value.trim()) return G.toast('Tempel API key dulu.', 'err'); return G.tulis('api.simpanKey', { key: key.value.trim() }).then(function (x) { if (x.success) { key.value = ''; G.render(); } }); }),
            G.btn('Uji koneksi', { ico: 'wifi_tethering' }, function () { G.clear(hasil).appendChild(G.skel(2)); return G.api('api.uji', {}).then(function (x) { G.clear(hasil); if (!x.success) return hasil.appendChild(h('div', { class: 'banner err' }, x.message)); var d = x.data; hasil.appendChild(G.validasi([{ level: d.tahap1.ok ? 'ok' : 'err', pesan: 'Tahap 1 — kunci: ' + (d.tahap1.pesan || '') + (d.tahap1.saran ? ' ' + d.tahap1.saran : '') }].concat(d.tahap2 ? [{ level: d.tahap2.ok ? 'ok' : 'err', pesan: 'Tahap 2 — permintaan uji: ' + (d.tahap2.pesan || '') + (d.latensi ? ' (' + d.latensi + ' ms)' : '') }] : []))); G.segarBoot(); }); }),
            p.key_petunjuk ? G.btn('Hapus kunci', { cls: 'dng', ico: 'delete' }, function () { G.konfirm('Hapus API key?', 'Fitur AI berhenti sampai Anda memasang kunci lagi.', 'Hapus', function () { return G.tulis('api.hapusKey', {}).then(function () { G.render(); }); }, true); }) : null), hasil));
      isi.appendChild(kartuKey);
      // Model
      var mdl = h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Model')), h('div', { class: 'bd stack' }, G.skel(2)));
      isi.appendChild(mdl);
      function gambarModel() {
        var bd = mdl.querySelector('.bd'); if (!p.key_petunjuk) { G.clear(bd).appendChild(h('div', { class: 'muted' }, 'Simpan API key lebih dulu.')); return; }
        G.api('api.models', {}).then(function (x) {
          G.clear(bd); if (!x.success) { bd.appendChild(h('div', { class: 'banner warn' }, x.message)); return; }
          var list = x.data.models; var u = G.select(list, p.model_utama || x.data.flash), k = G.select(list, p.model_cerdas || x.data.pro || x.data.flash);
          bd.appendChild(h('div', { class: 'grid g2' }, G.field('Model utama (cepat, terstruktur)', u), G.field('Model cerdas (tugas berat: kalender, langkah RPM, kisi-kisi)', k)));
          bd.appendChild(h('div', { class: 'row' }, G.btn('Simpan model', { cls: 'pri sm' }, function () { return G.tulis('api.pengaturan', { model_utama: u.value, model_cerdas: k.value }); }), G.btn('Pilih otomatis', { cls: 'sm', ico: 'auto_awesome' }, function () { return G.tulis('api.otomatis', {}).then(function () { G.render(); }); })));
        });
      }
      gambarModel();
      // Lanjutan
      var su = G.input(p.suhu_terstruktur, { type: 'number', step: .1, min: 0, max: 1 }), sk = G.input(p.suhu_kreatif, { type: 'number', step: .1, min: 0, max: 1 }), rt = G.select(['0', '1', '2', '3'], p.retry), mt = G.input(p.maks_token, {}), hm = G.select([['tidak', 'Tidak'], ['ya', 'Ya']], p.mode_hemat);
      isi.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Parameter lanjutan')), h('div', { class: 'bd stack' }, h('div', { class: 'grid g3' }, G.field('Suhu terstruktur (0–1)', su, 'Rendah = konsisten'), G.field('Suhu kreatif (0–1)', sk, 'Untuk judul/ice breaking'), G.field('Percobaan ulang', rt)), h('div', { class: 'grid g2' }, G.field('Maks token keluaran', mt, '"otomatis" atau angka 512–65536'), G.field('Mode hemat kuota', hm)),
        h('div', { class: 'row' }, G.btn('Simpan', { cls: 'pri sm' }, function () { return G.tulis('api.pengaturan', { suhu_terstruktur: su.value, suhu_kreatif: sk.value, retry: rt.value, maks_token: mt.value, mode_hemat: hm.value }); }), G.btn('Kembalikan bawaan', { cls: 'sm' }, function () { return G.tulis('api.pengaturan', { reset: true }).then(function () { G.render(); }); })))));
      // Riwayat
      var rw = h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Riwayat pemakaian')), h('div', { class: 'bd' }, G.skel(3))); isi.appendChild(rw);
      G.api('api.riwayat', {}).then(function (x) { var bd = G.clear(rw.querySelector('.bd')); if (!x.success) return bd.appendChild(h('div', { class: 'muted' }, x.message)); var d = x.data;
        bd.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } }, h('span', { class: 'chip' }, d.hariIni + ' panggilan hari ini'), h('span', { class: 'chip' }, d.tujuhHari + ' dalam 7 hari'), h('span', { class: 'chip' }, 'Token 7 hari: ' + d.tokenTotal)));
        bd.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Waktu', 'Tugas', 'Model', 'Status', 'Token'].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.terakhir.map(function (r) { return h('tr', null, h('td', { class: 'small' }, (r.waktu || '').replace('T', ' ').slice(0, 16)), h('td', null, r.menu), h('td', { class: 'small' }, r.model), h('td', null, String(r.status)), h('td', { class: 'n' }, String((Number(r.masuk) || 0) + (Number(r.keluar) || 0)))); })))));
      });
      // Prompt
      var pm = h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Template prompt per tugas'), G.btn('Lihat & ubah', { cls: 'sm', ico: 'edit' }, function () { editorPrompt(); }))); isi.appendChild(pm);
    });
  }
  function editorPrompt() {
    var bd = h('div', { class: 'stack' }, G.skel(4)); G.modal('Template prompt', bd, { wide: true });
    G.api('prompt.list', {}).then(function (r) { G.clear(bd); if (!r.success) return bd.appendChild(h('div', { class: 'banner err' }, r.message));
      bd.appendChild(h('div', { class: 'hint' }, 'Variabel ditulis {{nama}}. Sistem tetap memaksa keluaran JSON dan 8 Dimensi Profil Lulusan resmi.'));
      r.data.forEach(function (p) { var ta = G.input(p.template, { area: true, rows: 6 }); bd.appendChild(h('div', { class: 'card flat' }, h('div', { class: 'hd' }, h('b', { class: 'mono' }, p.kunci), p.diubah ? G.badge('Draf') : null, G.btn('Simpan', { cls: 'sm' }, function () { return G.tulis('prompt.simpan', { kunci: p.kunci, template: ta.value }); }), G.btn('Reset', { cls: 'sm ghost' }, function () { return G.tulis('prompt.reset', { kunci: p.kunci }).then(function () { ta.value = p.bawaan; }); })), h('div', { class: 'bd' }, ta))); });
    });
  }

  function tabDokumen(isi) {
    G.api('pengaturan.get', {}).then(function (r) {
      G.clear(isi); var p = r.data || {}, pr = (G.S.boot || {}).profil || {}, v = {};
      function S(k, label, opts, hint) { v[k] = G.select(opts, p[k]); return G.field(label, v[k], hint); }
      v.ambang_ketuntasan = G.input(p.ambang_ketuntasan, { type: 'number', min: 41, max: 100 }); v.jp_per_pekan = G.input(p.jp_per_pekan, { type: 'number', min: 1, max: 40 }); v.tatap_muka = G.input(p.tatap_muka, { type: 'number', min: 1, max: 10 }); v.hari_mengajar = G.input(p.hari_mengajar, { ph: '2,4' });
      var kertas = G.select(['A4', 'Letter'], pr.kertas || 'A4'), menit = G.input(pr.menit_per_jp || 45, { type: 'number', min: 20, max: 90 }), ttd = G.select([['ya', 'Tampilkan'], ['tidak', 'Sembunyikan']], pr.tanda_tangan_aktif || 'ya');
      isi.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Preferensi dokumen & kurikulum')), h('div', { class: 'bd stack' },
        h('div', { class: 'grid g3' }, G.field('Ambang ketuntasan (KKTP)', v.ambang_ketuntasan, 'Bawaan 61'), S('mode_pekan', 'Mode hitung pekan efektif', [['1', 'Mode 1 — pekan dengan ≥1 hari efektif = 1'], ['2', 'Mode 2 — efektif bila hari libur ≤ setengah'], ['3', 'Mode 3 — pecahan (hari efektif ÷ hari sekolah)']]), S('hari_sekolah', 'Hari sekolah per pekan', [['5', '5 hari'], ['6', '6 hari']])),
        h('div', { class: 'grid g3' }, G.field('JP per pekan', v.jp_per_pekan), G.field('Tatap muka per pekan', v.tatap_muka), S('pola', 'Pola pertemuan', [['2x2', '2 + 2 JP'], ['3+2', '3 + 2 JP']])),
        h('div', { class: 'grid g3' }, G.field('Hari mengajar (1=Senin)', v.hari_mengajar, 'Pisahkan koma, mis. 2,4'), G.field('Ukuran kertas', kertas), G.field('Menit per JP', menit)),
        G.field('Blok tanda tangan', ttd),
        h('div', { class: 'row end' }, G.btn('Simpan preferensi', { cls: 'pri', ico: 'save' }, function () {
          var d = {}; Object.keys(v).forEach(function (k) { d[k] = v[k].value; }); d.kertas = kertas.value;
          return G.tulis('pengaturan.simpan', d, { toast: false }).then(function (x) { if (!x.success) return; return G.tulis('profil.simpan', Object.assign({}, pr, { menit_per_jp: menit.value, tanda_tangan_aktif: ttd.value, kertas: kertas.value }), { toast: false }).then(function (y) { if (y.success) G.toast('Preferensi tersimpan.', 'ok'); }); }); })))));
    });
  }

  function tabAkun(isi) {
    var lama = G.input('', { type: 'password', ac: 'current-password' }), baru = G.input('', { type: 'password', ac: 'new-password' }), kon = G.input('', { type: 'password', ac: 'new-password' }), err = h('div', { class: 'errtxt', role: 'alert' });
    G.clear(isi).appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Ubah kata sandi')), h('div', { class: 'bd stack' }, h('div', { class: 'grid g3' }, G.field('Kata sandi lama', lama), G.field('Kata sandi baru', baru), G.field('Ulangi', kon)), err,
      h('div', { class: 'row' }, G.btn('Ubah kata sandi', { cls: 'pri' }, function () { err.textContent = ''; if (!G.sandiKuat(baru.value)) { err.textContent = 'Minimal 8 karakter, huruf besar, kecil, dan angka.'; return; } return G.api('auth.ubahSandi', { lama: lama.value, baru: baru.value, konfirmasi: kon.value, rememberToken: G.store.get('rem') }).then(function (r) { if (!r.success) { err.textContent = r.message; return; } if (r.data && r.data.token) { G.S.token = r.data.token; G.store.set('tok', r.data.token, true); } G.toast(r.message, 'ok'); lama.value = baru.value = kon.value = ''; }); })))));
    var sb = h('div', { class: 'bd' }, G.skel(3)); isi.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Perangkat yang diingat'), G.btn('Keluar dari semua perangkat', { cls: 'sm dng', ico: 'logout' }, function () { G.konfirm('Keluar dari semua perangkat?', 'Semua sesi "Ingat saya" dicabut, termasuk perangkat ini.', 'Keluar semua', function () { return G.api('auth.cabutSemua', {}).then(function () { G.store.del('rem'); G.keluarLokal(); G.go('#/masuk'); }); }, true); })), sb));
    function muat() { G.api('auth.sesi', { rememberToken: G.store.get('rem') }).then(function (r) { G.clear(sb); if (!r.success) return sb.appendChild(h('div', { class: 'muted' }, r.message)); var d = r.data; sb.appendChild(h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'Maksimal ' + d.maks + ' perangkat; masa ingat ' + d.hari + ' hari.')); if (!d.sesi.length) return sb.appendChild(h('div', { class: 'empty' }, 'Tidak ada perangkat yang diingat.'));
      sb.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Perangkat', 'Dibuat', 'Terakhir dipakai', 'Berakhir', ''].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.sesi.map(function (s) { return h('tr', null, h('td', null, (s.perangkat || '-').slice(0, 60), s.ini ? h('span', { class: 'chip', style: { marginLeft: '6px' } }, 'Perangkat ini') : null), h('td', { class: 'small' }, G.tanggalIndo((s.dibuat_pada || '').slice(0, 10))), h('td', { class: 'small' }, G.tanggalIndo((s.terakhir_dipakai || '').slice(0, 10))), h('td', { class: 'small' }, G.tanggalIndo((s.kedaluwarsa_pada || '').slice(0, 10))), h('td', null, G.btn('Cabut', { cls: 'sm', ico: 'block' }, function () { return G.tulis('auth.cabutSesi', { id_sesi: s.id_sesi }, { boot: false }).then(muat); }))); })))));
    }); }
    muat();
  }
})();
