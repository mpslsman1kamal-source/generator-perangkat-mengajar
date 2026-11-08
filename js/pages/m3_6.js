(function () {
  'use strict';
  var G = window.GPM, h = G.h, NB = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  /* ---------- Menu 3: Prota ---------- */
  G.pages.m3 = function (c) {
    c.appendChild(G.pageHead(3, 'Program Tahunan', 'Alokasi JP per bab dihitung dari jam efektif RPE, jumlah TP, JP sumatif, dan cadangan.'));
    var body = h('div', { class: 'stack' }); c.appendChild(body); var ctl;
    function muat() {
      G.clear(body).appendChild(G.skel(5));
      ctl = G.swr('prota.get', {}, function (d, dc, r) { if (!d) { G.clear(body).appendChild(h('div', { class: 'banner err' }, (r && r.message) || 'Gagal.')); return; } gambar(d); });
    }
    function gambar(d) {
      G.clear(body); var kunci = d.dokumen && d.dokumen.status === 'Final', pre = G.prasyaratTeks(G.S.boot, 3);
      if (pre) body.appendChild(G.terkunciBanner(pre)); if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci.'));
      var cfg = {}; try { cfg = JSON.parse((d.dokumen && d.dokumen.konfigurasi_json) || '{}'); } catch (e) { /* abaikan */ }
      var P = { sum: cfg.jpSumatif !== undefined ? Number(cfg.jpSumatif) : 2, cad1: Number(cfg.jpCadangan1) || 0, cad2: Number(cfg.jpCadangan2) || 0, t1: d.target['1'], t2: d.target['2'] };
      var rows = d.rows.length ? d.rows.map(function (r) { return { semester: r.semester, jenis: r.jenis, no_bab: r.no_bab, materi: r.materi, jp: Number(r.jp) }; }) : d.saran.s1.rows.concat(d.saran.s2.rows).map(function (r) { return { semester: r.semester, jenis: r.jenis, no_bab: r.no_bab, materi: r.materi, jp: r.jp }; });
      var tot = h('div', { class: 'row' }), tabel = h('div', { class: 'stack' });
      function hitungUlang() {
        return G.api('prota.hitung', { jpSumatif: P.sum, jpCadangan: P.cad1, total1: P.t1, total2: P.t2 }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); var a = r.data.s1, b = r.data.s2; var s2r = P.cad2 !== P.cad1 ? null : b.rows; rows = a.rows.concat(b.rows).map(function (x) { return { semester: x.semester, jenis: x.jenis, no_bab: x.no_bab, materi: x.materi, jp: x.jp }; }); if (P.cad2 !== P.cad1) G.toast('Catatan: JP cadangan semester Genap mengikuti isian Ganjil saat dihitung ulang; ubah manual bila berbeda.'); g(); });
      }
      function g() {
        G.clear(tabel); G.clear(tot);
        ['1', '2'].forEach(function (s) {
          var r = rows.filter(function (x) { return x.semester === s; }), jumlah = r.reduce(function (a, x) { return a + (Number(x.jp) || 0); }, 0), target = s === '1' ? P.t1 : P.t2, sama = jumlah === target;
          tot.appendChild(h('span', { class: 'chip', style: { background: sama ? '#DCFCE7' : '#FEE2E2' } }, G.icon(sama ? 'check_circle' : 'error'), 'Semester ' + (s === '1' ? 'Ganjil' : 'Genap') + ': ' + jumlah + ' / ' + target + ' JP'));
          tabel.appendChild(h('div', { class: 'card flat' }, h('div', { class: 'hd' }, h('h3', null, 'Semester ' + (s === '1' ? 'Ganjil' : 'Genap')), G.badge(sama ? 'Final' : 'Perbaikan')), h('div', { class: 'bd' }, h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['No', 'Materi / Kegiatan', 'JP'].map(function (t) { return h('th', null, t); }))), h('tbody', null, r.map(function (x, i) { return h('tr', { class: x.jenis === 'materi' ? '' : 'tot' }, h('td', { class: 'c', style: { width: '50px' } }, String(i + 1)), h('td', null, x.jenis === 'materi' ? G.input(x.materi, { on: function (v) { x.materi = v; } }) : x.materi), h('td', { style: { width: '90px' } }, G.input(x.jp, { type: 'number', min: 0, on: function (v) { x.jp = Number(v) || 0; refreshTot(); } }))); }))))), !r.length ? h('div', { class: 'empty' }, 'Belum ada bab/TP pada semester ini.') : null));
        });
        if (kunci) body.querySelectorAll('input,select,button.pri').forEach(function (e) { e.disabled = true; });
      }
      function refreshTot() { G.clear(tot); ['1', '2'].forEach(function (s) { var j = rows.filter(function (x) { return x.semester === s; }).reduce(function (a, x) { return a + (Number(x.jp) || 0); }, 0), t = s === '1' ? P.t1 : P.t2; tot.appendChild(h('span', { class: 'chip', style: { background: j === t ? '#DCFCE7' : '#FEE2E2' } }, G.icon(j === t ? 'check_circle' : 'error'), 'Semester ' + (s === '1' ? 'Ganjil' : 'Genap') + ': ' + j + ' / ' + t + ' JP')); }); }
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Parameter alokasi')), h('div', { class: 'bd stack' }, h('div', { class: 'grid g4' },
        G.field('JP sumatif per bab', G.input(P.sum, { type: 'number', min: 0, on: function (v) { P.sum = Number(v) || 0; } })), G.field('JP cadangan / semester', G.input(P.cad1, { type: 'number', min: 0, on: function (v) { P.cad1 = Number(v) || 0; P.cad2 = P.cad1; } })),
        G.field('Jam efektif Ganjil (JP)', G.input(P.t1, { type: 'number', min: 0, on: function (v) { P.t1 = Number(v) || 0; } }), 'Dari RPE; dapat disesuaikan'), G.field('Jam efektif Genap (JP)', G.input(P.t2, { type: 'number', min: 0, on: function (v) { P.t2 = Number(v) || 0; } }))),
        h('div', { class: 'row' }, G.btn('Hitung ulang alokasi', { ico: 'calculate', cls: 'pri sm' }, hitungUlang), h('span', { class: 'hint' }, 'Menimpa isian JP di bawah.')), tot)));
      body.appendChild(tabel); g();
      body.appendChild(G.simpanBar(null, [G.btn('Simpan Prota', { cls: 'pri', ico: 'save' }, function () { return G.tulis('prota.simpan', { rows: rows, jpSumatif: P.sum, jpCadangan1: P.cad1, jpCadangan2: P.cad2 }).then(function (r) { if (r.success) muat(); }); })]));
      body.appendChild(G.docBar({ dok: d.dokumen, menu: 3, sem: '0', onChange: muat }));
      if (kunci) body.querySelectorAll('.btn.pri').forEach(function (b) { b.disabled = true; });
    }
    muat(); return { stop: function () { if (ctl && ctl.stop) ctl.stop(); } };
  };

  /* ---------- Menu 4 & 5: Promes ---------- */
  function promes(c, sem, menu) {
    c.appendChild(G.pageHead(menu, 'Program Semester ' + (sem === '1' ? 'Ganjil' : 'Genap'), 'Kolom hanya pekan efektif (dikelompokkan per bulan); pekan tidak efektif ditandai arsir. Total JP tiap pekan tidak boleh melebihi alokasi.'));
    var body = h('div', { class: 'stack' }); c.appendChild(body); var ctl;
    function muat() { G.clear(body).appendChild(G.skel(6)); ctl = G.swr('promes.get', { semester: sem }, function (d, dc, r) { if (!d) { G.clear(body).appendChild(h('div', { class: 'banner err' }, (r && r.message) || 'Gagal.')); return; } gambar(d); }); }
    function gambar(d) {
      G.clear(body); var kunci = d.dokumen && d.dokumen.status === 'Final';
      if (d.terkunci) { body.appendChild(G.terkunciBanner(d.terkunci)); }
      if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci.'));
      var rows = d.rows.map(function (r) { return { id: r.id, kode_tp: r.kode_tp, label: r.label, id_tp: r.id_tp, no_bab: r.no_bab, jp_total: r.jp_total, jp_minggu: r.jp_minggu.slice(), pola: r.pola }; });
      var kap = d.kapasitas, nEf = kap.length, valBox = h('div'), foot = [];
      if (!nEf) { body.appendChild(h('div', { class: 'banner warn' }, G.icon('info'), 'Belum ada pekan efektif. Simpan RPE semester ini dulu.', G.btn('Ke RPE', { cls: 'sm' }, function () { G.go('#/m/1'); }))); return; }
      // peta pekan penuh → indeks efektif
      var semua = d.semuaPekan, ef = 0, kol = semua.map(function (p) { return { p: p, e: p.nilai > 0 ? ef++ : -1 }; });
      var thB = h('tr'), thW = h('tr'), prev = null;
      thB.appendChild(h('th', { rowspan: 2, class: 'c' }, 'No')); thB.appendChild(h('th', { rowspan: 2 }, 'Kode')); thB.appendChild(h('th', { rowspan: 2, style: { minWidth: '260px' } }, 'Tujuan Pembelajaran / Materi')); thB.appendChild(h('th', { rowspan: 2, class: 'c' }, 'JP'));
      var gr = []; kol.forEach(function (k) { if (gr.length && gr[gr.length - 1].b === k.p.bulan) gr[gr.length - 1].n++; else gr.push({ b: k.p.bulan, n: 1 }); });
      gr.forEach(function (x) { thB.appendChild(h('th', { colspan: x.n, class: 'c' }, NB[x.b - 1])); });
      kol.forEach(function (k) { thW.appendChild(h('th', { class: 'c' + (k.e < 0 ? ' hatch' : ''), title: k.p.keterangan || ('Pekan ' + k.p.no_pekan), style: { padding: '4px 2px', minWidth: '34px' } }, String(k.p.no_pekan))); });
      var tb = h('tbody'), tf = h('tr', { class: 'tot' });
      function hitungFoot() { foot.forEach(function (f) { var s = rows.reduce(function (a, r) { return a + (Number(r.jp_minggu[f.e]) || 0); }, 0); f.td.textContent = s || ''; f.td.className = 'c' + (s > kap[f.e] ? ' over' : ''); f.td.title = 'Alokasi ' + kap[f.e] + ' JP'; }); rows.forEach(function (r, i) { var tot = r.jp_minggu.reduce(function (a, b) { return a + (Number(b) || 0); }, 0); var el = tb.children[i] && tb.children[i].querySelector('.rt'); if (el) { el.textContent = tot; el.style.color = tot === Number(r.jp_total) ? '' : '#B91C1C'; } });
        G.clear(valBox).appendChild(G.validasi(validasiPromes_(rows.map(function (r) { return { label: r.kode_tp || r.label, jp_total: Number(r.jp_total), jp_minggu: r.jp_minggu }; }), kap))); }
      rows.forEach(function (r) {
        var tr = h('tr', null, h('td', { class: 'c' }, String(tb.children.length + 1)), h('td', { class: 'mono small nowrap' }, r.kode_tp), h('td', { class: 'small' }, r.label), h('td', { class: 'c' }, h('b', { class: 'rt' }, String(r.jp_total))));
        kol.forEach(function (k) {
          if (k.e < 0) { tr.appendChild(h('td', { class: 'pg-cell hatch' })); return; }
          var td = h('td', { class: 'pg-cell' + (Number(r.jp_minggu[k.e]) > 0 ? ' has' : '') }), inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 2, 'aria-label': 'JP pekan ' + k.p.no_pekan, value: Number(r.jp_minggu[k.e]) > 0 ? r.jp_minggu[k.e] : '' });
          inp.addEventListener('input', function () { var v = Math.max(0, Math.round(Number(inp.value.replace(/\D/g, '')) || 0)); r.jp_minggu[k.e] = v; td.classList.toggle('has', v > 0); hitungFoot(); });
          inp.addEventListener('focus', function () { inp.select(); }); td.appendChild(inp); tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      tf.appendChild(h('td', { colspan: 4 }, 'Jumlah JP per pekan (alokasi ' + d.jp + ' JP)')); kol.forEach(function (k) { if (k.e < 0) { tf.appendChild(h('td', { class: 'hatch' })); return; } var td = h('td', { class: 'c' }); tf.appendChild(td); foot.push({ e: k.e, td: td }); }); tb.appendChild(tf);
      var aksi = [G.ai('Distribusi otomatis', function () { return G.api('promes.distribusi', { semester: sem }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); rows = r.data.rows.map(function (x) { return { id: x.id, kode_tp: x.kode_tp, label: x.label, id_tp: x.id_tp, no_bab: x.no_bab, jp_total: x.jp_total, jp_minggu: x.jp_minggu, pola: x.pola }; }); d.rows = rows; (r.data.peringatan || []).forEach(function (p) { G.toast(p); }); gambar(Object.assign({}, d, { rows: rows.map(function (x) { return Object.assign({}, x); }) })); }); }, 'ink sm')];
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Grid program semester'), h('span', { class: 'chip' }, nEf + ' pekan efektif'), aksi, h('span', { class: 'small muted' }, 'Distribusi menumpuk berurutan sesuai Prota (tanpa AI).')),
        h('div', { class: 'bd stack' }, rows.length ? h('div', { class: 'tw' }, h('table', { class: 't', style: { width: 'auto', minWidth: '100%' } }, h('thead', null, thB, thW), tb)) : h('div', { class: 'empty' }, 'Belum ada baris. Tekan "Distribusi otomatis" (Prota & ATP harus sudah tersimpan).'), valBox)));
      hitungFoot();
      body.appendChild(G.simpanBar(null, [G.btn('Simpan Promes', { cls: 'pri', ico: 'save' }, function () { return G.tulis('promes.simpan', { semester: sem, rows: rows }).then(function (r) { if (r.success) muat(); }); })]));
      body.appendChild(G.docBar({ dok: d.dokumen, menu: menu, sem: sem, onChange: muat }));
      if (kunci || d.terkunci) body.querySelectorAll('.pg-cell input,.btn.pri,.btn.ink').forEach(function (e) { e.disabled = true; });
    }
    muat(); return { stop: function () { if (ctl && ctl.stop) ctl.stop(); } };
  }
  G.pages.m4 = function (c) { return promes(c, '1', 4); };
  G.pages.m5 = function (c) { return promes(c, '2', 5); };

  /* ---------- Menu 6: KKTP ---------- */
  G.pages.m6 = function (c) {
    c.appendChild(G.pageHead(6, 'KKTP — Kriteria Ketercapaian Tujuan Pembelajaran', 'Rubrik 4 level per TP: Kurang, Cukup, Baik, Amat Baik. Rentang nilai mengikuti ambang ketuntasan di Pengaturan.'));
    var body = h('div', { class: 'stack' }); c.appendChild(body); var ctl;
    function muat() { G.clear(body).appendChild(G.skel(5)); ctl = G.swr('kktp.get', {}, function (d, dc, r) { if (!d) { G.clear(body).appendChild(h('div', { class: 'banner err' }, (r && r.message) || 'Gagal.')); return; } gambar(d); }); }
    function gambar(d) {
      G.clear(body); var kunci = d.dokumen && d.dokumen.status === 'Final', pre = G.prasyaratTeks(G.S.boot, 6);
      if (pre) body.appendChild(G.terkunciBanner(pre)); if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci.'));
      var tp = d.tp.map(function (t) { return { id_tp: t.id_tp, semester: t.semester, kode: t.kode_atp, teks: t.teks_tp, r: t.kktp ? { kurang: t.kktp.kurang, cukup: t.kktp.cukup, baik: t.kktp.baik, amat_baik: t.kktp.amat_baik } : null, ubah: false }; });
      var wrap = h('div', { class: 'stack' }), prog = h('div'), pb = h('div', { class: 'row' });
      var LV = [['kurang', 'Kurang'], ['cukup', 'Cukup'], ['baik', 'Baik'], ['amat_baik', 'Amat Baik']], rng = d.norma.map(function (n) { return n.rentang; });
      function g() {
        G.clear(wrap); if (!tp.length) wrap.appendChild(h('div', { class: 'empty' }, 'Belum ada TP. Selesaikan menu CP-TP-ATP.'));
        tp.forEach(function (t) {
          var ada = !!t.r; if (!ada) t.r = { kurang: '', cukup: '', baik: '', amat_baik: '' };
          wrap.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('span', { class: 'chip mono' }, t.kode || '—'), h('div', { style: { flex: 1, minWidth: '200px' } }, t.teks), G.badge(ada ? 'Draf' : 'Belum'), G.btn('Buat AI', { ico: 'auto_awesome', cls: 'sm ink' }, function () { return buat([t.id_tp]); })),
            h('div', { class: 'bd grid g4' }, LV.map(function (l, i) { var ta = G.input(t.r[l[0]], { area: true, rows: 4, on: function (v) { t.r[l[0]] = v; t.ubah = true; } }); return G.field(l[1] + ' (' + rng[i] + ')', ta); })),
            ada ? h('div', { class: 'bd row end', style: { paddingTop: 0 } }, G.btn('Perbaiki bahasa', { cls: 'sm ghost', ico: 'spellcheck' }, function () { return G.api('kktp.perbaiki', { rubrik: t.r }).then(function (r) { if (r.success) { t.r = r.data; t.ubah = true; g(); } else G.toast(r.message, 'err'); }); })) : null));
        });
        if (kunci) wrap.querySelectorAll('textarea,button').forEach(function (e) { e.disabled = true; });
      }
      function buat(ids) {
        var bagi = []; for (var i = 0; i < ids.length; i += 6) bagi.push(ids.slice(i, i + 6)); var selesai = 0, gagal = 0;
        G.clear(prog).appendChild(h('div', { class: 'progress' }, h('i', { style: { width: '0%' } })));
        return bagi.reduce(function (p, b) { return p.then(function () { return G.api('kktp.generate', { ids: b }).then(function (r) { if (r.success) { r.data.rubrik.forEach(function (x) { var t = tp.filter(function (y) { return y.id_tp === x.id_tp; })[0]; if (t) { t.r = { kurang: x.kurang, cukup: x.cukup, baik: x.baik, amat_baik: x.amat_baik }; t.ubah = true; } }); } else { gagal++; G.toast(r.message, 'err'); } selesai++; prog.firstChild.firstChild.style.width = Math.round(selesai * 100 / bagi.length) + '%'; }); }); }, Promise.resolve()).then(function () { g(); G.clear(prog); if (!gagal) G.toast('Rubrik dibuat. Periksa lalu simpan.', 'ok'); });
      }
      var belum = tp.filter(function (t) { return !t.r; }).map(function (t) { return t.id_tp; });
      body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Pembuatan rubrik'), h('span', { class: 'chip' }, (tp.length - belum.length) + ' / ' + tp.length + ' TP berubrik')), h('div', { class: 'bd stack' }, h('div', { class: 'row' }, G.ai('Buat untuk semua yang belum (' + belum.length + ')', function () { if (!belum.length) return G.toast('Semua TP sudah berrubrik.'); return buat(belum); }), G.btn('Simpan perubahan', { cls: 'pri', ico: 'save' }, function () { var kirim = tp.filter(function (t) { return t.r && t.r.kurang && t.ubah; }).map(function (t) { return Object.assign({ id_tp: t.id_tp }, t.r); }); if (!kirim.length) return G.toast('Tidak ada perubahan.'); return G.tulis('kktp.simpan', { rubrik: kirim }).then(function (r) { if (r.success) muat(); }); })), prog)));
      g(); body.appendChild(wrap); body.appendChild(G.docBar({ dok: d.dokumen, menu: 6, sem: '0', onChange: muat }));
      if (kunci) body.querySelectorAll('.btn.pri,.btn.ink').forEach(function (b) { b.disabled = true; });
    }
    muat(); return { stop: function () { if (ctl && ctl.stop) ctl.stop(); } };
  };
})();
