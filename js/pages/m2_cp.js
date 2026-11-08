(function () {
  'use strict';
  var G = window.GPM, h = G.h, BLOOM = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

  G.pages.m2 = function (c) {
    return G.semHal(c, { menu: 2, aksi: 'cp.get', judul: 'CP – TP – ATP', desk: 'CP disalin apa adanya dari dokumen resmi; jumlah TP per bab dihitung kode; urutan ATP dan kodenya disusun otomatis.',
      render: function (body, d, sem, muat) {
        var pr = G.S.boot.profil || {}, kunci = d.dokumen && d.dokumen.status === 'Final', K = d.kuota;
        var cp = d.cp.map(function (x) { return Object.assign({}, x); }), tp = d.tp.map(function (x) { return Object.assign({}, x); });
        var urut = d.atp.map(function (a) { return { id_tp: a.id_tp, justifikasi: a.justifikasi || '' }; });
        var tpTersimpan = {}; d.tp.forEach(function (t) { tpTersimpan[t.id_tp] = 1; });
        G.clear(body);
        if (kunci) body.appendChild(h('div', { class: 'banner ok' }, G.icon('lock'), 'Dokumen Final — terkunci. Buka revisi untuk mengubah.'));
        var pre = G.prasyaratTeks(G.S.boot, 2); if (pre) { body.appendChild(G.terkunciBanner(pre)); }
        if (!K.rpeAda) body.appendChild(h('div', { class: 'banner warn' }, G.icon('info'), 'RPE semester ini belum disimpan, sehingga kuota TP belum dapat dihitung.', G.btn('Ke RPE', { cls: 'sm' }, function () { G.go('#/m/1'); })));

        /* A. CP */
        var tbCp = h('tbody'), pilih = G.select([['', '— pilih berkas CP —']].concat(d.berkas.filter(function (b) { return b.jenis === 'cp'; }).map(function (b) { return [b.id_berkas, b.nama_berkas]; })), '');
        function gCp() { G.clear(tbCp); cp.forEach(function (x, i) { tbCp.appendChild(h('tr', null, h('td', { style: { width: '200px' } }, G.input(x.elemen, { on: function (v) { x.elemen = v; } })), h('td', null, G.input(x.teks_cp, { area: true, rows: 3, on: function (v) { x.teks_cp = v; x.verifikasi = 'belum'; } })), h('td', { style: { width: '70px' } }, G.input(x.halaman_sumber, { on: function (v) { x.halaman_sumber = v; } })), h('td', null, G.btn('', { ico: 'delete', cls: 'sm ghost' }, function () { cp.splice(i, 1); gCp(); })))); }); if (!cp.length) tbCp.appendChild(h('tr', null, h('td', { colspan: 4 }, h('div', { class: 'empty' }, 'Belum ada CP. Unggah dokumen CP lalu baca dengan AI, atau ketik manual.')))); }
        gCp();
        body.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'A. Capaian Pembelajaran (CP)'), G.unggahBerkas('cp', 'Unggah dokumen CP', muat), G.btn('Tambah elemen', { ico: 'add', cls: 'sm' }, function () { cp.push({ elemen: '', teks_cp: '', halaman_sumber: '' }); gCp(); })),
          h('div', { class: 'bd stack' }, h('div', { class: 'row' }, h('div', { style: { flex: 1, minWidth: '220px' } }, pilih), G.ai('Ekstrak CP', function () { if (!pilih.value) return G.toast('Pilih berkas CP dulu.', 'err'); return G.api('cp.ekstrak', { id_berkas: pilih.value }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); cp = r.data.cp; gCp(); G.toast(r.message, 'ok'); }); })),
            h('div', { class: 'banner warn small' }, G.icon('fact_check'), 'Penting: AI menyalin CP, tetapi sistem tidak dapat memverifikasinya terhadap dokumen resmi. Bandingkan teks dengan sumber sebelum disimpan.'),
            h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Elemen', 'Teks CP (salin apa adanya)', 'Hal.', ''].map(function (t) { return h('th', null, t); }))), tbCp)),
            h('div', { class: 'row end' }, G.btn('Simpan CP', { cls: 'pri sm', ico: 'save' }, function () { return G.tulis('cp.simpan', { cp: cp }, { boot: false }); })))));

        /* B. TP */
        var elemenOpsi = function () { var e = cp.map(function (x) { return x.elemen; }).filter(String); return e.length ? e : ['(isi elemen CP dulu)']; };
        var tpWrap = h('div', { class: 'stack' });
        function tpBab(no) { return tp.filter(function (t) { return String(t.no_bab) === String(no); }); }
        function gTp() {
          G.clear(tpWrap);
          K.bab.forEach(function (b) {
            var kuota = K.perBab[b.no_bab] || 0, list = tpBab(b.no_bab), ins = G.input('', { ph: 'Instruksi tambahan (opsional)', max: 400 }), buku = G.select([['', 'Tanpa buku teks']].concat(d.berkas.filter(function (x) { return x.jenis === 'buku'; }).map(function (x) { return [x.id_berkas, x.nama_berkas]; })), '');
            var cls = list.length === kuota ? 'Final' : (list.length ? 'Draf' : 'Belum');
            var kartu = h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Bab ' + b.no_bab + ' — ' + b.nama_bab), h('span', { class: 'badge ' + cls }, list.length + ' / ' + kuota + ' TP')),
              h('div', { class: 'bd stack' }, h('div', { class: 'row' }, h('div', { style: { flex: 1, minWidth: '200px' } }, ins), h('div', { style: { minWidth: '180px' } }, buku),
                G.ai('Buat TP (' + kuota + ')', function () { if (!cp.length) return G.toast('Isi CP dulu.', 'err'); if (!d.kuota.rpeAda) return G.toast('Simpan RPE dulu.', 'err'); return G.api('tp.generate', { semester: sem, no_bab: b.no_bab, instruksi: ins.value, id_berkas: buku.value }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); tp = tp.filter(function (t) { return String(t.no_bab) !== String(b.no_bab); }).concat(r.data.tp); gTp(); G.toast(r.message, r.data.peringatan ? '' : 'ok'); }); }, 'ink sm'),
                G.btn('Tambah manual', { ico: 'add', cls: 'sm' }, function () { tp.push({ id_tp: 'TPb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), semester: sem, no_bab: b.no_bab, elemen: '', subbab: '', a: 'Peserta didik', b: '', c: '', d: '', teks_tp: '', bloom: 'C3' }); gTp(); })),
                list.map(function (t) { return kartuTp(t); })));
            tpWrap.appendChild(kartu);
          });
          if (!K.bab.length) tpWrap.appendChild(h('div', { class: 'empty' }, 'Belum ada bab untuk semester ini. Tambahkan di Profil & Data Induk.'));
          if (kunci) tpWrap.querySelectorAll('input,select,textarea,button').forEach(function (e) { e.disabled = true; });
        }
        function kartuTp(t) {
          var idx = tp.indexOf(t), kode = ''; var ta = G.input(t.teks_tp, { area: true, rows: 3, max: 700, on: function (v) { t.teks_tp = v; } });
          function susunTeks() { var s = [t.a, t.b, t.c, t.d].filter(String).join(' '); if (s) { t.teks_tp = s; ta.value = s; } }
          return h('div', { class: 'card flat', style: { borderColor: '#94A3B8' } }, h('div', { class: 'bd stack s8' },
            h('div', { class: 'grid g3' }, G.field('Elemen CP', G.select([['', '—']].concat(elemenOpsi()), t.elemen, function (v) { t.elemen = v; })), G.field('Sub-bab / topik', G.input(t.subbab, { on: function (v) { t.subbab = v; } })), G.field('Level Bloom', G.select(BLOOM, t.bloom || 'C3', function (v) { t.bloom = v; }))),
            h('div', { class: 'grid g4' }, G.field('A — Audience', G.input(t.a, { on: function (v) { t.a = v; } })), G.field('B — Behavior', G.input(t.b, { on: function (v) { t.b = v; } })), G.field('C — Condition', G.input(t.c, { on: function (v) { t.c = v; } })), G.field('D — Degree', G.input(t.d, { on: function (v) { t.d = v; } }))),
            G.field('Teks Tujuan Pembelajaran', ta), h('div', { class: 'row end' }, G.btn('Gabung A-B-C-D', { cls: 'sm ghost', ico: 'merge' }, susunTeks), G.btn('Hapus', { cls: 'sm ghost', ico: 'delete' }, function () { tp.splice(tp.indexOf(t), 1); gTp(); }))));
        }
        gTp();
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'B. Tujuan Pembelajaran (TP)'), h('span', { class: 'chip' }, 'Kuota semester: ' + K.total + ' TP'), h('span', { class: 'small muted' }, K.pekanEfektif + ' pekan efektif × ' + K.tatapMuka + ' tatap muka − ' + K.bab.length + ' bab')), h('div', { class: 'bd stack' }, tpWrap,
          h('div', { class: 'row end' }, G.btn('Simpan TP', { cls: 'pri sm', ico: 'save' }, function () { return G.tulis('tp.simpan', { semester: sem, tp: tp }).then(function (r) { if (r.success) muat(); }); })))));

        /* C. ATP */
        var atpWrap = h('div', { class: 'stack' });
        function tpById(id) { return tp.filter(function (t) { return t.id_tp === id; })[0]; }
        function lengkapi() { var ada = {}; urut.forEach(function (u) { ada[u.id_tp] = 1; }); urut = urut.filter(function (u) { return tpById(u.id_tp); }); tp.slice().sort(function (a, b) { return Number(a.no_bab) - Number(b.no_bab); }).forEach(function (t) { if (!ada[t.id_tp]) urut.push({ id_tp: t.id_tp, justifikasi: '' }); }); urut.sort(function (a, b) { return Number(tpById(a.id_tp).no_bab) - Number(tpById(b.id_tp).no_bab); }); }
        function gAtp() {
          lengkapi(); G.clear(atpWrap);
          var kode = beriKodeAtp_(pr.awalan_kode || awalanDariKelas_(pr.kelas), urut.map(function (u) { return { id_tp: u.id_tp, no_bab: tpById(u.id_tp).no_bab }; })), peta = {}; kode.forEach(function (k) { peta[k.id_tp] = k.kode_atp; });
          K.bab.forEach(function (b) {
            var item = urut.filter(function (u) { return String(tpById(u.id_tp).no_bab) === String(b.no_bab); });
            atpWrap.appendChild(h('div', { class: 'card flat' }, h('div', { class: 'hd' }, h('h3', null, 'Bab ' + b.no_bab + ' — ' + b.nama_bab), G.ai('Susun urutan AI', function () {
              if (!item.every(function (u) { return tpTersimpan[u.id_tp]; })) return G.toast('Simpan TP dulu sebelum menyusun ATP.', 'err');
              return G.api('atp.susun', { semester: sem, no_bab: b.no_bab }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); var baru = r.data.urut, lain = urut.filter(function (u) { return String(tpById(u.id_tp).no_bab) !== String(b.no_bab); }); urut = lain.concat(baru); urut.sort(function (a, c2) { return Number(tpById(a.id_tp).no_bab) - Number(tpById(c2.id_tp).no_bab) || 0; }); gAtp(); });
            }, 'ink sm')), h('div', { class: 'bd stack s8' }, item.map(function (u, i) {
              var t = tpById(u.id_tp); return h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('span', { class: 'chip mono' }, peta[u.id_tp]), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', null, t.teks_tp), G.input(u.justifikasi, { ph: 'Justifikasi urutan (prinsip: hierarki konsep / konkret→abstrak / mudah→sulit)', on: function (v) { u.justifikasi = v; } })),
                h('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '4px' } }, G.btn('', { ico: 'arrow_upward', cls: 'sm', title: 'Naikkan' }, function () { var a = urut.indexOf(u), bb = urut.indexOf(item[i - 1]); if (bb >= 0) { urut[a] = urut[bb]; urut[bb] = u; gAtp(); } }), G.btn('', { ico: 'arrow_downward', cls: 'sm', title: 'Turunkan' }, function () { var a = urut.indexOf(u), bb = urut.indexOf(item[i + 1]); if (bb >= 0) { urut[a] = urut[bb]; urut[bb] = u; gAtp(); } })));
            }), item.length ? null : h('div', { class: 'muted small' }, 'Belum ada TP.')))); });
          if (kunci) atpWrap.querySelectorAll('input,select,textarea,button').forEach(function (e) { e.disabled = true; });
        }
        gAtp();
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'C. Alur Tujuan Pembelajaran (ATP)'), h('span', { class: 'small muted' }, 'Kode: ' + (pr.awalan_kode || awalanDariKelas_(pr.kelas)) + '.no bab.urutan')), h('div', { class: 'bd stack' }, atpWrap, h('div', { class: 'row end' }, G.btn('Simpan ATP', { cls: 'pri sm', ico: 'save' }, function () { var blm = tp.filter(function (t) { return !tpTersimpan[t.id_tp]; }).length; if (blm) return G.toast('Simpan TP terlebih dahulu.', 'err'); return G.tulis('atp.simpan', { semester: sem, urut: urut }).then(function (r) { if (r.success) muat(); }); })))));

        /* D. Cek */
        var cekBox = h('div');
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'D. Pemeriksa mutu'), G.btn('Periksa', { cls: 'sm', ico: 'rule' }, function () { return G.api('cp.cek', { semester: sem }).then(function (r) { G.clear(cekBox).appendChild(r.success ? G.validasi(r.data.hasil) : h('div', { class: 'banner err' }, r.message)); }); })), h('div', { class: 'bd' }, cekBox, h('div', { class: 'hint' }, 'Pemeriksa membaca data yang sudah tersimpan.'))));
        body.appendChild(G.docBar({ dok: d.dokumen, menu: 2, sem: sem, onChange: muat }));
      } });
  };
})();
