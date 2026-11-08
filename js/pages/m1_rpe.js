(function () {
  'use strict';
  var G = window.GPM, h = G.h;
  var KAT = ['libur nasional', 'libur keagamaan', 'cuti bersama', 'libur semester', 'asesmen', 'kegiatan sekolah', 'lainnya'];

  G.pages.m1 = function (c) {
    return G.semHal(c, { menu: 1, aksi: 'rpe.get', judul: 'Rincian Pekan Efektif', desk: 'Unggah kalender pendidikan → AI membaca kegiatan → kode menghitung pekan efektif tiap bulan.',
      render: function (body, d, sem, muat) {
        var pr = G.S.boot.profil || {}, kunci = d.dokumen && d.dokumen.status === 'Final';
        var P = { mode: Number(d.param.mode) || 1, hari: Number(d.param.hariSekolah) || 5, jp: Number(d.param.jpPerPekan) || 4 };
        var keg = d.kegiatan.map(function (k) { return { id: k.id, nama_kegiatan: k.nama_kegiatan, mulai: k.mulai, selesai: k.selesai, kategori: k.kategori, mengurangi_efektif: k.mengurangi_efektif === 'ya' }; });
        var catatan = '', tahun = tahunMulai_(pr.tahun_pelajaran);
        G.clear(body);
        if (d.perlu) body.appendChild(h('div', { class: 'banner warn' }, G.icon('info'), d.perlu, G.btn('Buka Profil', { cls: 'sm' }, function () { G.go('#/profil'); })));
        if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci. Buka revisi untuk mengubah.'));
        var mode = G.select([['1', 'Mode 1 — pekan ber-hari efektif ≥ 1 dihitung penuh'], ['2', 'Mode 2 — efektif bila libur ≤ setengah pekan'], ['3', 'Mode 3 — pecahan (hari efektif ÷ hari sekolah)']], P.mode, function (v) { P.mode = Number(v); hitung(); }), hari = G.select([['5', '5 hari'], ['6', '6 hari']], P.hari, function (v) { P.hari = Number(v); hitung(); }), jp = G.input(P.jp, { type: 'number', min: 1, max: 40, on: function (v) { P.jp = Number(v) || 0; hitung(); } });
        body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Parameter')), h('div', { class: 'bd grid g3' }, G.field('Mode pekan', mode), G.field('Hari sekolah', hari), G.field('JP per pekan', jp))));
        // Kalender
        var pilih = G.select([['', '— pilih berkas kalender —']].concat(d.kalender.map(function (b) { return [b.id_berkas, b.nama_berkas]; })), d.kalender.length ? d.kalender[d.kalender.length - 1].id_berkas : '');
        var tb = h('tbody');
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Kalender pendidikan'), G.unggahBerkas('kalender', 'Unggah kalender', function () { muat(); })),
          h('div', { class: 'bd row' }, h('div', { style: { flex: 1, minWidth: '220px' } }, pilih), G.ai('Baca dengan AI', function () {
            if (!pilih.value) return G.toast('Unggah / pilih berkas kalender dulu.', 'err');
            return G.api('rpe.baca', { semester: sem, id_berkas: pilih.value }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); keg = keg.concat(r.data.kegiatan.map(function (k) { return Object.assign({}, k, { mengurangi_efektif: k.mengurangi_efektif === 'ya' }); })); gambarKeg(); hitung(); G.toast(r.message, 'ok'); });
          }))));
        // Kegiatan
        function gambarKeg() {
          G.clear(tb);
          keg.forEach(function (k, i) {
            tb.appendChild(h('tr', null,
              h('td', { style: { minWidth: '200px' } }, G.input(k.nama_kegiatan, { on: function (v) { k.nama_kegiatan = v; } })),
              h('td', null, G.input(k.mulai, { type: 'date', on: function (v) { k.mulai = v; if (!k.selesai || k.selesai < v) k.selesai = v; hitung(); } })),
              h('td', null, G.input(k.selesai, { type: 'date', on: function (v) { k.selesai = v; hitung(); } })),
              h('td', { style: { minWidth: '150px' } }, G.select(KAT.concat(KAT.indexOf(k.kategori) < 0 && k.kategori ? [k.kategori] : []), k.kategori || 'lainnya', function (v) { k.kategori = v; })),
              h('td', { class: 'c' }, h('input', { type: 'checkbox', 'aria-label': 'Mengurangi hari efektif', checked: k.mengurangi_efektif ? true : null, onchange: function (e) { k.mengurangi_efektif = e.target.checked; hitung(); } })),
              h('td', null, G.btn('', { ico: 'delete', cls: 'sm ghost', title: 'Hapus' }, function () { keg.splice(i, 1); gambarKeg(); hitung(); }))));
          });
          if (!keg.length) tb.appendChild(h('tr', null, h('td', { colspan: 6 }, h('div', { class: 'empty' }, 'Belum ada kegiatan. Baca dari kalender atau tambah manual.'))));
          if (kunci) body.querySelectorAll('.kegcard input,.kegcard select,.kegcard button').forEach(function (e) { e.disabled = true; });
        }
        body.appendChild(h('div', { class: 'card kegcard' }, h('div', { class: 'hd' }, h('h2', null, 'Kegiatan & libur'), G.btn('Tambah', { ico: 'add', cls: 'sm' }, function () { keg.push({ nama_kegiatan: '', mulai: '', selesai: '', kategori: 'libur nasional', mengurangi_efektif: true }); gambarKeg(); })),
          h('div', { class: 'bd' }, h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kegiatan', 'Mulai', 'Selesai', 'Kategori', 'Kurangi efektif', ''].map(function (t) { return h('th', { class: t === 'Kurangi efektif' ? 'c' : '' }, t); }))), tb)), h('div', { class: 'hint', style: { marginTop: '6px' } }, 'Asesmen (PTS/PAS) umumnya tidak mengurangi hari efektif; libur mengurangi.'))));
        // Hasil
        var hasilBox = h('div', { class: 'stack' }), catBox = G.input('', { area: true, rows: 3, max: 900, on: function (v) { catatan = v; } });
        function hitung() {
          G.clear(hasilBox); if (!tahun) return;
          var h2 = hitungRpe_({ tahunMulai: tahun, semester: Number(sem), hariSekolah: P.hari, mode: P.mode, jpPerPekan: P.jp, kegiatan: keg.filter(function (k) { return k.mulai; }) });
          var rows = h2.rekap.map(function (r, i) { return h('tr', null, h('td', { class: 'c' }, String(i + 1)), h('td', null, r.nama_bulan), h('td', { class: 'n' }, r.jumlah_pekan), h('td', { class: 'n' }, r.pekan_efektif), h('td', { class: 'n' }, r.pekan_tidak_efektif), h('td', { class: 'n' }, r.hari_efektif), h('td', { class: 'n' }, r.jp_per_pekan), h('td', { class: 'n' }, r.jam_efektif), h('td', { class: 'small' }, r.keterangan)); });
          var t = h2.total; rows.push(h('tr', { class: 'tot' }, h('td'), h('td', null, 'JUMLAH'), h('td', { class: 'n' }, t.jumlah_pekan), h('td', { class: 'n' }, t.pekan_efektif), h('td', { class: 'n' }, t.pekan_tidak_efektif), h('td', { class: 'n' }, t.hari_efektif), h('td', { class: 'n' }, t.jp_per_pekan), h('td', { class: 'n' }, t.jam_efektif), h('td')));
          hasilBox.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['No', 'Bulan', 'Jml Pekan', 'Pekan Efektif', 'Tidak Efektif', 'Hari Efektif', 'JP/Pekan', 'Jam Efektif', 'Keterangan'].map(function (x) { return h('th', null, x); }))), h('tbody', null, rows))));
          hasilBox.appendChild(G.validasi(h2.validasi));
          hasilBox._hasil = h2;
        }
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Hasil perhitungan (otomatis)')), h('div', { class: 'bd stack' }, hasilBox,
          h('div', { class: 'row' }, G.field('Catatan analisis (opsional)', catBox), G.ai('Buat catatan dengan AI', function () { return G.api('rpe.analisis', { semester: sem, kegiatan: keg, mode: P.mode, hariSekolah: P.hari, jpPerPekan: P.jp }).then(function (r) { if (r.success) { catBox.value = catatan = r.data.catatan; } else G.toast(r.message, 'err'); }); })))));
        try { var cj = JSON.parse((d.dokumen && d.dokumen.konfigurasi_json) || '{}'); catBox.value = catatan = cj.catatan || ''; } catch (e) { /* abaikan */ }
        gambarKeg(); hitung();
        body.appendChild(G.simpanBar(null, [G.btn('Simpan RPE', { cls: 'pri', ico: 'save' }, function () {
          return G.tulis('rpe.simpan', { semester: sem, kegiatan: keg.map(function (k) { return Object.assign({}, k, { mengurangi_efektif: k.mengurangi_efektif ? 'ya' : 'tidak' }); }), mode: P.mode, hariSekolah: P.hari, jpPerPekan: P.jp, catatan: catatan }).then(function (r) { if (r.success) muat(); });
        })]));
        if (kunci) body.querySelectorAll('.btn.pri').forEach(function (b) { b.disabled = true; });
        body.appendChild(G.docBar({ dok: d.dokumen, menu: 1, sem: sem, onChange: muat }));
      } });
  };
})();
