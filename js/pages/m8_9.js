(function () {
  'use strict';
  var G = window.GPM, h = G.h, BENTUK = ['PG', 'PGK', 'BS', 'MJ', 'IS', 'UR'];

  /* ---------- Menu 8: Asesmen ---------- */
  G.pages.m8 = function (c, sub) { return sub ? detail(c, sub) : daftar(c); };
  function daftar(c) {
    c.appendChild(G.pageHead(8, 'Asesmen Sumatif', 'Preset Tengah Semester (30 butir) atau Akhir Bab (32 butir). Jumlah butir dan skor total 100 dihitung kode.'));
    var sem = G.store.get('sem', true) || '1', body = h('div', { class: 'stack' }), tabs = h('div'); c.appendChild(tabs); c.appendChild(body);
    function muat() {
      G.clear(tabs).appendChild(G.semTabs(sem, function (s) { sem = s; G.store.set('sem', s, true); muat(); })); G.clear(body).appendChild(G.skel(4));
      G.api('asesmen.list', { semester: sem }).then(function (r) { if (!r.success) return G.clear(body).appendChild(h('div', { class: 'banner err' }, r.message)); gambar(r.data); });
    }
    function gambar(d) {
      G.clear(body); if (d.terkunci) body.appendChild(G.terkunciBanner(d.terkunci));
      var preset = 'TS', bab = [], jml = Object.assign({}, d.preset.TS), pc = h('div', { class: 'grid g2' }), jb = h('div', { class: 'grid g3' }), babBox = h('div', { class: 'row' }), tot = h('span', { class: 'chip' });
      function gp() { G.clear(pc); ['TS', 'AB'].forEach(function (k) { pc.appendChild(h('button', { type: 'button', class: 'mcard', style: { textAlign: 'left', cursor: 'pointer', borderTopColor: preset === k ? '#B91C1C' : '#94A3B8', background: preset === k ? '#FEF2F2' : '#fff', '--acc': '#B91C1C' }, onclick: function () { preset = k; jml = Object.assign({}, d.preset[k]); gp(); gj(); } }, h('h3', null, d.namaPreset[k]), h('div', { class: 'small muted' }, BENTUK.filter(function (b) { return d.preset[k][b]; }).map(function (b) { return d.bentuk[b] + ' ' + d.preset[k][b]; }).join(' • ')))); }); }
      function gj() { G.clear(jb); BENTUK.forEach(function (b) { jb.appendChild(G.field(d.bentuk[b], G.input(jml[b], { type: 'number', min: 0, max: 40, on: function (v) { jml[b] = Number(v) || 0; ht(); } }))); }); ht(); }
      function ht() { var t = BENTUK.reduce(function (a, b) { return a + (Number(jml[b]) || 0); }, 0); tot.textContent = 'Total ' + t + ' butir'; }
      d.bab.forEach(function (b) { babBox.appendChild(h('label', { class: 'chip pick', style: { gap: '6px' } }, h('input', { type: 'checkbox', onchange: function (e) { var i = bab.indexOf(b.no_bab); if (e.target.checked && i < 0) bab.push(b.no_bab); if (!e.target.checked && i >= 0) bab.splice(i, 1); } }), 'Bab ' + b.no_bab + ' ' + b.nama_bab)); });
      gp(); gj();
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Buat asesmen baru')), h('div', { class: 'bd stack' }, pc, h('div', { class: 'lab' }, 'Distribusi butir (dapat disesuaikan)'), jb, tot, h('div', { class: 'lab' }, 'Bab yang diujikan'), babBox.children.length ? babBox : h('div', { class: 'muted' }, 'Belum ada bab pada semester ini.'),
        h('div', { class: 'row end' }, G.btn('Buat asesmen', { cls: 'pri', ico: 'add' }, function () { return G.tulis('asesmen.buat', { semester: sem, preset: preset, jumlah: jml, bab: bab }).then(function (r) { if (r.success) G.go('#/m/8/' + r.data.id_asesmen); }); })))));
      var tb = h('tbody'); d.rows.forEach(function (a) { tb.appendChild(h('tr', null, h('td', null, a.nama_preset), h('td', null, 'Bab ' + a.bab.join(', ')), h('td', { class: 'c' }, a.total), h('td', { class: 'c' }, a.kisi + ' / ' + a.soal), h('td', null, G.badge(a.status)), h('td', null, G.btn('Buka', { cls: 'sm', ico: 'edit' }, function () { G.go('#/m/8/' + a.id_asesmen); }), ' ', G.btn('', { cls: 'sm ghost', ico: 'delete', title: 'Hapus' }, function () { G.konfirm('Hapus asesmen?', 'Kisi-kisi dan soal akan dihapus.', 'Hapus', function () { return G.tulis('asesmen.hapus', { id_asesmen: a.id_asesmen }).then(function () { muat(); }); }, true); })))); });
      body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Asesmen tersimpan')), h('div', { class: 'bd' }, d.rows.length ? h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Preset', 'Bab', 'Butir', 'Kisi / Soal', 'Status', ''].map(function (t) { return h('th', null, t); }))), tb)) : h('div', { class: 'empty' }, 'Belum ada asesmen.'))));
    }
    muat(); return { stop: function () { } };
  }

  function detail(c, id) {
    var body = h('div', { class: 'stack' }); c.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } }, G.btn('Kembali', { ico: 'arrow_back', cls: 'sm' }, function () { G.go('#/m/8'); }))); c.appendChild(body); body.appendChild(G.skel(5));
    function muat() { G.api('asesmen.get', { id_asesmen: id }).then(function (r) { if (!r.success) { G.clear(body).appendChild(h('div', { class: 'banner err' }, r.message)); return; } gambar(r.data); }); }
    function gambar(d) {
      G.clear(body); var A = d.asesmen, kunci = A.status === 'Final', kisi = d.kisi, soal = d.soal, jml = d.konfigurasi.jumlah || {};
      body.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'num' }, '8'), h('div', { class: 'tx' }, h('h1', null, A.nama_preset), h('p', null, 'Bab ' + A.bab.join(', ') + ' • ' + A.total + ' butir • skor total ' + d.skor.total)), G.badge(A.status)));
      if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Asesmen Final — terkunci.', G.btn('Buka revisi', { cls: 'sm' }, function () { return G.api('arsip.list', { menu: 8 }).then(function (a) { var dk = (a.data.rows || []).filter(function (x) { return x.ref === id; })[0]; if (dk) return G.tulis('dokumen.revisi', { id_dokumen: dk.id_dokumen }).then(function () { muat(); }); }); })));
      // Kisi
      var kb = h('div');
      function gk() { G.clear(kb); if (!kisi.length) { kb.appendChild(h('div', { class: 'empty' }, 'Kisi-kisi belum dibuat.')); return; } kb.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['No', 'Kode TP', 'Materi', 'Indikator soal', 'Level', 'Bentuk', 'Pengalaman'].map(function (t) { return h('th', null, t); }))), h('tbody', null, kisi.map(function (k) { return h('tr', null, h('td', { class: 'c' }, k.no), h('td', { style: { width: '90px' } }, G.input(k.isi.kode_tp, { on: function (v) { k.isi.kode_tp = v; k.u = 1; } })), h('td', null, G.input(k.isi.materi, { on: function (v) { k.isi.materi = v; k.u = 1; } })), h('td', { style: { minWidth: '260px' } }, G.input(k.isi.indikator, { area: true, rows: 2, on: function (v) { k.isi.indikator = v; k.u = 1; } })), h('td', { style: { width: '80px' } }, G.select(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'], k.isi.level, function (v) { k.isi.level = v; k.u = 1; })), h('td', { class: 'c' }, k.bentuk), h('td', { style: { width: '120px' } }, G.input(k.isi.pengalaman, { on: function (v) { k.isi.pengalaman = v; k.u = 1; } }))); }))))); }
      gk();
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, '1. Kisi-kisi'), G.ai(kisi.length ? 'Buat ulang kisi-kisi' : 'Buat kisi-kisi', function () { if (kunci) return; return G.api('asesmen.generate', { id_asesmen: id, tahap: 'kisi' }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); kisi = r.data.kisi; gk(); G.toast(r.message, 'ok'); }); }, 'ink sm'), G.btn('Simpan perubahan', { cls: 'pri sm', ico: 'save' }, function () { var u = kisi.filter(function (k) { return k.u; }); if (!u.length) return G.toast('Tidak ada perubahan.'); return G.tulis('asesmen.simpanButir', { id_asesmen: id, bagian: 'kisi', butir: u }, { boot: false }); })), h('div', { class: 'bd' }, kb)));
      // Soal per bentuk
      var sb = h('div', { class: 'stack' });
      function gs() {
        G.clear(sb);
        BENTUK.filter(function (b) { return Number(jml[b]) > 0; }).forEach(function (bn) {
          var l = soal.filter(function (s) { return s.bentuk === bn; }), kis = kisi.filter(function (k) { return k.bentuk === bn; }), isi = h('div', { class: 'stack s8' });
          l.forEach(function (s) { var k = kisi.filter(function (x) { return x.no === s.no; })[0]; isi.appendChild(h('div', { class: 'card flat' }, h('div', { class: 'hd' }, h('b', null, 'Soal ' + s.no), k ? h('span', { class: 'chip' }, k.isi.level) : null, h('span', { class: 'chip mono' }, 'Skor ' + s.skor), !kunci ? G.btn('Buat ulang', { cls: 'sm ghost', ico: 'refresh' }, function () { return G.api('asesmen.regenerate', { id_asesmen: id, no: s.no }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); s.isi = r.data.isi; gs(); }); }) : null, !kunci ? G.btn('Simpan', { cls: 'sm', ico: 'save' }, function () { return G.tulis('asesmen.simpanButir', { id_asesmen: id, bagian: 'soal', butir: [{ no: s.no, bentuk: s.bentuk, id_butir: s.id_butir, isi: s.isi }] }, { boot: false }); }) : null), h('div', { class: 'bd' }, G.editorJson(s.isi, function () { }, { soal: 'Pertanyaan', pilihan: 'Pilihan jawaban', kunci: 'Kunci jawaban', pedoman: 'Pedoman skor' })))); });
          if (!l.length) isi.appendChild(h('div', { class: 'empty' }, 'Belum dibuat.'));
          sb.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, d.bentuk[bn] + ' (' + jml[bn] + ' butir)'), l.length ? G.badge('Draf') : G.badge('Belum'), !kunci ? G.ai(l.length ? 'Buat ulang semua' : 'Buat soal', function () { if (!kisi.length) return G.toast('Buat kisi-kisi dahulu.', 'err'); return G.api('asesmen.generate', { id_asesmen: id, tahap: 'soal', bentuk: bn }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); soal = soal.filter(function (s) { return s.bentuk !== bn; }).concat(r.data.soal.map(function (x, i) { var sk = d.skor.perButir[bn] || []; return { id_butir: '', no: x.no, bentuk: bn, skor: sk[i] || 0, isi: x.isi }; })).sort(function (a, b) { return a.no - b.no; }); gs(); G.toast(r.message, 'ok'); }); }, 'ink sm') : null), h('div', { class: 'bd' }, isi)));
        });
        if (kunci) sb.querySelectorAll('textarea,input,select').forEach(function (e) { e.disabled = true; });
      }
      gs(); body.appendChild(h('h2', null, '2. Soal per bentuk')); body.appendChild(sb);
      var cek = h('div'); body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, '3. Pemeriksa mutu'), G.btn('Periksa', { cls: 'sm', ico: 'rule' }, function () { return G.api('asesmen.cek', { id_asesmen: id }).then(function (r) { G.clear(cek).appendChild(r.success ? G.validasi(r.data.hasil) : h('div', { class: 'banner err' }, r.message)); }); })), h('div', { class: 'bd stack' }, cek, h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Rentang nilai', 'Predikat', 'Keterangan'].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.norma.map(function (n) { return h('tr', null, h('td', null, n.rentang), h('td', null, n.predikat), h('td', null, n.keterangan)); })))))));
      body.appendChild(G.simpanBar(null, [G.btn('Pratinjau', { ico: 'visibility' }, function () { return G.pratinjau(8, A.semester, id); }), G.btn('Word', { ico: 'download' }, function () { return G.unduhDok(8, A.semester, id, 'docx'); }), G.btn('PDF', { ico: 'picture_as_pdf' }, function () { return G.unduhDok(8, A.semester, id, 'pdf'); }), kunci ? null : G.btn('Finalkan', { cls: 'ok', ico: 'verified' }, function () { return G.tulis('asesmen.final', { id_asesmen: id }).then(function (r) { if (r.success) muat(); }); })]));
    }
    muat(); return { stop: function () { } };
  }

  /* ---------- Menu 9: Jurnal ---------- */
  G.pages.m9 = function (c) {
    return G.semHal(c, { menu: 9, aksi: 'jurnal.get', judul: 'Jurnal Mengajar Harian', desk: 'Jadwal pertemuan disusun kode dari Promes + RPE (melewati hari libur). AI hanya membantu draf refleksi.',
      render: function (body, d, sem, muat) {
        var kunci = d.dokumen && d.dokumen.status === 'Final', rows = d.rows.map(function (r) { return Object.assign({}, r); }), pre = d.terkunci;
        G.clear(body); if (pre) body.appendChild(G.terkunciBanner(pre)); if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci.'));
        var tb = h('tbody'), info = h('div');
        function g() {
          G.clear(tb); rows.forEach(function (r, i) { r.pertemuan_ke = i + 1; tb.appendChild(h('tr', null, h('td', { class: 'c' }, String(i + 1)), h('td', { class: 'nowrap small' }, (r.hari || '') + ', ' + G.tanggalIndo(r.tanggal), r.catatan ? h('div', { class: 'errtxt' }, r.catatan) : null), h('td', { class: 'small' }, (r.mapel || '') + ' / ' + ((G.S.boot.profil || {}).kelas || '')), h('td', { class: 'small' }, r.bab), h('td', { class: 'mono small' }, r.kode_atp), h('td', { class: 'small', style: { minWidth: '200px' } }, r.teks_tp), h('td', { style: { minWidth: '160px' } }, G.input(r.materi_pokok, { on: function (v) { r.materi_pokok = v; } })), h('td', { style: { width: '100px' } }, G.input(r.penilaian, { on: function (v) { r.penilaian = v; } })), h('td', { style: { minWidth: '220px' } }, G.input(r.refleksi, { area: true, rows: 2, max: 600, on: function (v) { r.refleksi = v; } })))); });
          if (!rows.length) tb.appendChild(h('tr', null, h('td', { colspan: 9 }, h('div', { class: 'empty' }, 'Belum ada jurnal. Tekan "Susun jadwal otomatis".'))));
          if (kunci) body.querySelectorAll('textarea,input,.btn.pri,.btn.ink').forEach(function (e) { e.disabled = true; });
        }
        body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Jurnal 9 kolom'), G.ai('Susun jadwal otomatis', function () { return G.api('jurnal.bangun', { semester: sem }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); var lama = {}; rows.forEach(function (x) { if (x.refleksi) lama[x.kode_atp + '|' + x.pertemuan_ke] = x.refleksi; }); rows = r.data.rows.map(function (x) { x.refleksi = lama[x.kode_atp + '|' + x.pertemuan_ke] || ''; return x; }); g(); if (r.data.peringatan) G.toast(r.data.peringatan); else G.toast(r.message, 'ok'); }); }, 'ink sm'),
          G.ai('Draf refleksi (12 pertemuan)', function () { var kosong = rows.filter(function (x) { return !x.refleksi; }).slice(0, 12); if (!kosong.length) return G.toast('Semua refleksi sudah terisi.'); return G.api('jurnal.refleksi', { semester: sem, rows: kosong }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); r.data.refleksi.forEach(function (x) { var t = rows.filter(function (y) { return y.pertemuan_ke === x.pertemuan_ke; })[0]; if (t) t.refleksi = x.refleksi; }); g(); G.toast(r.message, 'ok'); }); }, 'sm')),
          h('div', { class: 'bd stack' }, h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['No', 'Hari / Tanggal', 'Mapel / Kelas', 'Bab', 'Kode ATP', 'Tujuan Pembelajaran', 'Materi Pokok', 'Penilaian', 'Refleksi'].map(function (t) { return h('th', null, t); }))), tb)), info)));
        g();
        body.appendChild(G.simpanBar(null, [G.btn('Simpan jurnal', { cls: 'pri', ico: 'save' }, function () { return G.tulis('jurnal.simpan', { semester: sem, rows: rows }).then(function (r) { if (r.success) muat(); }); })]));
        body.appendChild(G.docBar({ dok: d.dokumen, menu: 9, sem: sem, onChange: muat }));
        if (kunci || pre) body.querySelectorAll('.btn.pri,.btn.ink').forEach(function (b) { b.disabled = true; });
      } });
  };
})();
