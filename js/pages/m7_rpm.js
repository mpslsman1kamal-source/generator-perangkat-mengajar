(function () {
  'use strict';
  var G = window.GPM, h = G.h;
  var BAG = [['identifikasi', 'A–B. Identifikasi & Desain'], ['langkah', 'C. Pengalaman Belajar'], ['asesmen', 'D. Asesmen'], ['lampiran', 'Lampiran (LKM, rubrik, refleksi)'], ['tindak', 'E. Tindak Lanjut']];

  G.pages.m7 = function (c, sub) { return sub ? detail(c, sub) : daftar(c); };

  function daftar(c) {
    c.appendChild(G.pageHead(7, 'RPM / RPP — Rencana Pembelajaran Mendalam', 'Satu RPM per pertemuan. Menit pendahuluan+inti+penutup selalu sama dengan alokasi waktu (dihitung kode).'));
    var sem = G.store.get('sem', true) || '1', body = h('div', { class: 'stack' }), tabs = h('div'); c.appendChild(tabs); c.appendChild(body); var ctl, pustaka = null;
    function muat() {
      G.clear(tabs).appendChild(G.semTabs(sem, function (s) { sem = s; G.store.set('sem', s, true); muat(); }));
      G.clear(body).appendChild(G.skel(5));
      Promise.all([pustaka ? { success: true, data: pustaka } : G.api('rpm.pustaka', {}), G.api('rpm.list', { semester: sem })]).then(function (rs) {
        if (!rs[0].success || !rs[1].success) return G.clear(body).appendChild(h('div', { class: 'banner err' }, (rs[1].message || rs[0].message))); pustaka = rs[0].data; gambar(rs[1].data);
      });
    }
    function gambar(d) {
      G.clear(body); if (d.terkunci) body.appendChild(G.terkunciBanner(d.terkunci));
      var model = Object.keys(pustaka.model), jpPer = 2, rc = d.saran.map(function (s) { var ada = d.rows.filter(function (r) { return r.id_tp === s.id_tp; }), p = ada[0]; return { id_tp: s.id_tp, kode: s.kode_atp, teks: s.teks_tp, jumlah: p ? p.total_pertemuan : s.jumlah, model: p ? p.model : model[0], dpl: p ? p.dpl.slice() : ['DPL3', 'DPL5'], jp: s.jp }; });
      var tb = h('tbody');
      rc.forEach(function (r) {
        var dp = h('div', { class: 'row', style: { gap: '4px' } }); function gd() { G.clear(dp); pustaka.dpl.forEach(function (x) { var on = r.dpl.indexOf(x.kode) >= 0; dp.appendChild(h('span', { class: 'chip pick' + (on ? ' sel' : ''), title: x.nama, role: 'button', tabindex: 0, onclick: function () { var i = r.dpl.indexOf(x.kode); if (i >= 0) r.dpl.splice(i, 1); else r.dpl.push(x.kode); gd(); }, onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } } }, x.kode.replace('DPL', 'D'))); }); } gd();
        tb.appendChild(h('tr', null, h('td', { class: 'mono small nowrap' }, r.kode), h('td', { class: 'small', style: { minWidth: '220px' } }, r.teks, h('div', { class: 'muted' }, r.jp + ' JP')), h('td', { style: { width: '80px' } }, G.input(r.jumlah, { type: 'number', min: 1, max: 12, on: function (v) { r.jumlah = Number(v) || 1; } })), h('td', { style: { minWidth: '190px' } }, G.select(model, r.model, function (v) { r.model = v; })), h('td', { style: { minWidth: '210px' } }, dp)));
      });
      var jpIn = G.input(jpPer, { type: 'number', min: 1, max: 6, on: function (v) { jpPer = Number(v) || 2; } });
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Perencanaan pertemuan'), h('div', { style: { width: '150px' } }, G.field('JP / pertemuan', jpIn)), G.btn('Buat / perbarui rangka', { cls: 'pri sm', ico: 'playlist_add' }, function () { return G.tulis('rpm.rencana', { semester: sem, jpPerPertemuan: jpPer, rencana: rc.map(function (r) { return { id_tp: r.id_tp, jumlah: r.jumlah, model: r.model, dpl: r.dpl }; }) }).then(function (r) { if (r.success) muat(); }); })),
        h('div', { class: 'bd stack' }, h('div', { class: 'hint' }, 'Jumlah pertemuan disarankan dari JP Promes. Pilih model dan Dimensi Profil Lulusan (D1–D8, arahkan kursor untuk nama lengkap).'), rc.length ? h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode', 'Tujuan Pembelajaran', 'Pertemuan', 'Model', 'DPL'].map(function (t) { return h('th', null, t); }))), tb)) : h('div', { class: 'empty' }, 'Belum ada TP/ATP pada semester ini.'))));
      // daftar RPM
      var lt = h('tbody'); d.rows.forEach(function (r) { lt.appendChild(h('tr', null, h('td', { class: 'mono small' }, r.kode_atp), h('td', { class: 'c' }, r.pertemuan_ke + '/' + r.total_pertemuan), h('td', null, r.judul || h('span', { class: 'muted' }, '(belum ada judul)')), h('td', { class: 'small' }, r.model), h('td', { class: 'c' }, r.lengkap + '/5'), h('td', null, G.badge(r.status === 'Belum' ? 'Belum' : r.status)), h('td', null, G.btn('Buka', { cls: 'sm', ico: 'edit' }, function () { G.go('#/m/7/' + r.id_rpm); })))); });
      body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Daftar RPM'), h('span', { class: 'chip' }, d.rows.filter(function (r) { return r.status === 'Final'; }).length + ' / ' + d.rows.length + ' Final')), h('div', { class: 'bd' }, d.rows.length ? h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode ATP', 'Ke', 'Judul', 'Model', 'Bagian', 'Status', ''].map(function (t) { return h('th', null, t); }))), lt)) : h('div', { class: 'empty' }, 'Belum ada RPM. Buat rangka di atas.'))));
    }
    muat(); return { stop: function () { } };
  }

  function detail(c, id) {
    var body = h('div', { class: 'stack' }); c.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } }, G.btn('Kembali ke daftar', { ico: 'arrow_back', cls: 'sm' }, function () { G.go('#/m/7'); }))); c.appendChild(body); body.appendChild(G.skel(6));
    G.api('rpm.get', { id_rpm: id }).then(function (r) { if (!r.success) { G.clear(body).appendChild(h('div', { class: 'banner err' }, r.message)); return; } gambar(r.data); });
    function gambar(d) {
      G.clear(body); var R = d.rpm, B = d.bagian, kunci = R.status === 'Final', cfg = Object.assign({ kemitraan: false, digital: true, lkm: true, refleksi: true, materi_ajar: false, ice_breaking: 1, jumlah_soal: 3, bentuk_soal: 'Pilihan Ganda', konteks: '' }, R.konfigurasi);
      body.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'num' }, '7'), h('div', { class: 'tx' }, h('h1', null, 'RPM ' + R.kode_atp + ' • Pertemuan ' + R.pertemuan_ke + '/' + R.total_pertemuan), h('p', null, (R.judul || '(judul dibuat saat bagian Identifikasi)') + ' • ' + R.alokasi_menit + ' menit • ' + R.model)), G.badge(R.status === 'Belum' ? 'Belum' : R.status)));
      if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'RPM Final — terkunci.', G.btn('Buka revisi', { cls: 'sm' }, function () { return G.api('arsip.list', { menu: 7 }).then(function (a) { var dk = (a.data.rows || []).filter(function (x) { return x.ref === id; })[0]; if (!dk) return; return G.tulis('dokumen.revisi', { id_dokumen: dk.id_dokumen }).then(function () { G.render(); }); }); })));
      // Konfigurasi
      var ck = function (k, l) { return h('label', { class: 'row', style: { gap: '6px' } }, h('input', { type: 'checkbox', checked: cfg[k] ? true : null, onchange: function (e) { cfg[k] = e.target.checked; } }), l); };
      var ice = G.input(cfg.ice_breaking, { type: 'number', min: 0, max: 3, on: function (v) { cfg.ice_breaking = Number(v) || 0; } }), js = G.input(cfg.jumlah_soal, { type: 'number', min: 1, max: 10, on: function (v) { cfg.jumlah_soal = Number(v) || 3; } }), bs = G.select(['Pilihan Ganda', 'Isian Singkat', 'Uraian', 'Benar-Salah'], cfg.bentuk_soal, function (v) { cfg.bentuk_soal = v; }), kn = G.input(cfg.konteks, { area: true, rows: 2, max: 300, on: function (v) { cfg.konteks = v; } });
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Opsi pertemuan')), h('div', { class: 'bd stack' }, h('div', { class: 'row', style: { gap: '18px' } }, ck('kemitraan', 'Kemitraan pembelajaran'), ck('digital', 'Pemanfaatan digital'), ck('lkm', 'Lembar Kerja Murid'), ck('refleksi', 'Lembar refleksi siswa'), ck('materi_ajar', 'Materi ajar')), h('div', { class: 'grid g4' }, G.field('Ice breaking (min.)', ice), G.field('Soal formatif akhir', js), G.field('Bentuk soal', bs), G.field('Konteks kelas (opsional)', kn)),
        h('div', { class: 'row end' }, G.btn('Simpan opsi', { cls: 'sm pri', ico: 'save' }, function () { return G.tulis('rpm.simpanBagian', { id_rpm: id, konfigurasi: cfg }, { boot: false }); })))));
      // Progress generate semua
      var prog = h('div'); var bagianEl = {};
      body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Pembuatan dengan AI'), G.ai('Buat semua bagian', function () {
        if (kunci) return; var i = 0, gagal = false; G.clear(prog).appendChild(h('div', { class: 'progress' }, h('i', { style: { width: '0%' } })));
        return G.api('rpm.simpanBagian', { id_rpm: id, konfigurasi: cfg }).then(function () { return BAG.reduce(function (p, b) { return p.then(function () { if (gagal) return; return G.api('rpm.generate', { id_rpm: id, bagian: b[0] }).then(function (r) { if (!r.success) { gagal = true; G.toast(b[1] + ': ' + r.message, 'err'); return; } B[b[0]] = r.data.isi; if (r.data.judul) R.judul = r.data.judul; i++; prog.firstChild.firstChild.style.width = (i * 20) + '%'; }); }); }, Promise.resolve()); }).then(function () { G.clear(prog); if (!gagal) G.toast('Semua bagian selesai. Periksa dan sunting bila perlu.', 'ok'); G.invalidate(); G.api('rpm.get', { id_rpm: id }).then(function (r) { if (r.success) gambar(r.data); }); });
      })), h('div', { class: 'bd' }, prog, h('div', { class: 'hint' }, 'Urutan: Identifikasi → Langkah → Asesmen → Lampiran → Tindak lanjut (± 1–2 menit).'))));
      // Bagian
      BAG.forEach(function (b) {
        var isi = B[b[0]], box = h('div', { class: 'bd stack' }), sunting = G.input('', { ph: 'Instruksi perbaikan, mis. "buat lebih kontekstual dengan kehidupan sehari-hari"', max: 400 });
        function g() { G.clear(box); if (!isi) { box.appendChild(h('div', { class: 'empty' }, 'Belum dibuat.')); return; } box.appendChild(G.editorJson(isi, function () { }, { l4: 'Level 4', l3: 'Level 3', l2: 'Level 2', l1: 'Level 1', dpl: 'Dimensi Profil Lulusan', menit: 'Menit', lkm: 'Lembar Kerja Murid' }));
          if (!kunci) box.appendChild(h('div', { class: 'row' }, h('div', { style: { flex: 1, minWidth: '220px' } }, sunting), G.ai('Sunting AI', function () { if (!sunting.value.trim()) return G.toast('Tulis instruksi perbaikan.', 'err'); return G.api('rpm.sunting', { id_rpm: id, bagian: b[0], instruksi: sunting.value }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); isi = r.data.isi; B[b[0]] = isi; g(); G.toast(r.message, 'ok'); }); }, 'ink sm'), G.btn('Simpan bagian', { cls: 'pri sm', ico: 'save' }, function () { return G.tulis('rpm.simpanBagian', { id_rpm: id, bagian: b[0], isi: isi, judul: b[0] === 'identifikasi' ? isi.judul : undefined }, { boot: false }); })));
        }
        g(); body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, b[1]), isi ? G.badge('Draf') : G.badge('Belum'), !kunci ? G.ai(isi ? 'Buat ulang' : 'Buat', function () { return G.api('rpm.generate', { id_rpm: id, bagian: b[0] }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); isi = B[b[0]] = r.data.isi; if (r.data.judul) R.judul = r.data.judul; g(); G.toast(r.message, 'ok'); }); }, 'ink sm') : null), box));
      });
      var cek = h('div'); body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Pemeriksa mutu'), G.btn('Periksa', { cls: 'sm', ico: 'rule' }, function () { return G.api('rpm.cek', { id_rpm: id }).then(function (r) { G.clear(cek).appendChild(r.success ? G.validasi(r.data.hasil) : h('div', { class: 'banner err' }, r.message)); }); })), h('div', { class: 'bd' }, cek)));
      body.appendChild(G.simpanBar(null, [G.btn('Pratinjau', { ico: 'visibility' }, function () { return G.pratinjau(7, R.semester, id); }), G.btn('Word', { ico: 'download' }, function () { return G.unduhDok(7, R.semester, id, 'docx'); }), G.btn('PDF', { ico: 'picture_as_pdf' }, function () { return G.unduhDok(7, R.semester, id, 'pdf'); }), kunci ? null : G.btn('Finalkan RPM', { cls: 'ok', ico: 'verified' }, function () { return G.tulis('rpm.final', { id_rpm: id }).then(function (r) { if (r.success) G.render(); }); })]));
    }
    return { stop: function () { } };
  }
})();
