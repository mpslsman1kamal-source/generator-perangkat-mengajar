(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  G.route('/arsip', function () {
    var c = G.layout('Arsip & Ekspor', 'arsip');
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'Arsip & Riwayat'), h('p', null, 'Seluruh dokumen, status, dan versi. Unduh satuan atau seluruh portofolio sebagai ZIP.'))));
    var f = { menu: '', status: '', q: '', halaman: 1 }, tbl = h('div'), zipBox = h('div');
    var menu = G.select([['', 'Semua menu']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return [String(n), n + '. ' + G.MENU[n][0]]; })), '', function (v) { f.menu = v; f.halaman = 1; muat(); }), st = G.select([['', 'Semua status'], 'Draf', 'Final'], '', function (v) { f.status = v; f.halaman = 1; muat(); }), q = G.input('', { ph: 'Cari judul…', on: function (v) { clearTimeout(q._t); q._t = setTimeout(function () { f.q = v; f.halaman = 1; muat(); }, 250); } });
    c.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Dokumen'), G.btn('Duplikasi paket (tahun baru)', { ico: 'content_copy', cls: 'sm', title: 'Cadangkan paket lama dan mulai tahun baru' }, wizardDuplikat), G.btn('Ekspor portofolio ZIP', { ico: 'folder_zip', cls: 'sm pri' }, ekspor)), h('div', { class: 'bd stack' }, h('div', { class: 'grid g3' }, G.field('Menu', menu), G.field('Status', st), G.field('Cari', q)), zipBox, tbl)));
    function muat() {
      G.clear(tbl).appendChild(G.skel(4));
      G.swr('arsip.list', f, function (d, dc, r) {
        if (!d) return G.clear(tbl).appendChild(h('div', { class: 'banner err' }, (r && r.message) || 'Gagal.'));
        G.clear(tbl); if (!d.rows.length) return tbl.appendChild(h('div', { class: 'empty' }, 'Belum ada dokumen.'));
        tbl.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Menu', 'Judul', 'Smt', 'Versi', 'Status', 'Diperbarui', ''].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.rows.map(function (x) {
          var M = G.MENU[x.menu] || ['', '', '#000'];
          return h('tr', null, h('td', null, h('span', { class: 'dot', style: { display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid #000', background: M[2], marginRight: '6px' } }), M[0]), h('td', null, x.judul), h('td', { class: 'c' }, x.semester === '0' ? '—' : x.semester), h('td', { class: 'c mono' }, 'v' + x.versi), h('td', null, G.badge(x.status)), h('td', { class: 'small' }, G.tanggalIndo((x.diperbarui || '').slice(0, 10))),
            h('td', { class: 'nowrap' }, G.btn('', { ico: 'visibility', cls: 'sm', title: 'Pratinjau' }, function () { return G.pratinjau(x.menu, x.semester, x.ref); }), ' ', G.btn('', { ico: 'download', cls: 'sm', title: 'Unduh Word' }, function () { return G.unduhDok(x.menu, x.semester, x.ref, 'docx'); }), ' ', G.btn('', { ico: 'open_in_new', cls: 'sm', title: 'Buka menu' }, function () { G.go('#/m/' + x.menu + (x.menu === 7 || x.menu === 8 ? '/' + x.ref : '')); }), x.status !== 'Final' && (x.menu === 7 || x.menu === 8) ? [' ', G.btn('', { ico: 'delete', cls: 'sm ghost', title: 'Hapus' }, function () { G.konfirm('Hapus dokumen?', x.judul, 'Hapus', function () { return G.tulis('arsip.hapus', { id_dokumen: x.id_dokumen }).then(function () { muat(); }); }, true); })] : null));
        })))));
        if (d.total > d.per) { var tp = Math.ceil(d.total / d.per); tbl.appendChild(h('div', { class: 'row between', style: { marginTop: '10px' } }, G.btn('Sebelumnya', { cls: 'sm', ico: 'chevron_left' }, function () { if (f.halaman > 1) { f.halaman--; muat(); } }), h('span', { class: 'small' }, 'Halaman ' + d.halaman + ' / ' + tp), G.btn('Berikutnya', { cls: 'sm', ico: 'chevron_right' }, function () { if (f.halaman < tp) { f.halaman++; muat(); } }))); }
      });
    }
    muat();

    function pustakaZip() { return window.JSZip ? Promise.resolve() : new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = ok; s.onerror = function () { no(new Error('Pustaka ZIP gagal dimuat. Periksa internet.')); }; document.head.appendChild(s); }); }
    function ekspor() {
      return G.api('ekspor.zip', {}).then(function (r) {
        if (!r.success) return G.toast(r.message, 'err'); var b = r.data.berkas; if (!b.length) return G.toast('Belum ada dokumen Final untuk diekspor.', 'err');
        G.modal('Ekspor portofolio ZIP', h('div', { class: 'stack' }, h('div', null, b.length + ' dokumen Final akan dibundel dalam folder per menu.' + (r.data.belumFinal ? ' (' + r.data.belumFinal + ' dokumen berstatus Draf tidak ikut.)' : '')), h('div', { class: 'progress' }, h('i', { id: 'zp', style: { width: '0%' } })), h('div', { class: 'small muted', id: 'zt' }, 'Siap.')), { keep: true, foot: function (tutup) { return [G.btn('Tutup', {}, tutup), G.btn('Mulai', { cls: 'pri', ico: 'play_arrow' }, function () { return jalan(b, tutup); })]; } });
      });
    }
    function jalan(b, tutup) {
      var z, n = 0, zt = document.getElementById('zt'), zp = document.getElementById('zp');
      return pustakaZip().then(function () { z = new window.JSZip(); return b.reduce(function (p, x) { return p.then(function () { zt.textContent = 'Menyiapkan ' + x.nama + '…'; return G.api('ekspor.dokumen', { menu: x.menu, semester: x.semester, ref: x.ref, format: 'docx' }).then(function (r) { if (!r.success) throw new Error(x.judul + ': ' + r.message); z.folder(x.folder).file(x.nama.replace(/\.docx$/, '') + '_S' + x.semester + (x.ref ? '_' + x.ref.slice(-4) : '') + '.docx', r.data.base64, { base64: true }); n++; zp.style.width = Math.round(n * 100 / b.length) + '%'; }); }); }, Promise.resolve()); })
        .then(function () { zt.textContent = 'Menyusun ZIP…'; return z.generateAsync({ type: 'blob' }); }).then(function (blob) { var a = h('a', { href: URL.createObjectURL(blob), download: 'Portofolio_Perangkat_Mengajar.zip' }); document.body.appendChild(a); a.click(); a.remove(); zt.textContent = 'Selesai — ZIP diunduh.'; G.toast('Portofolio ZIP diunduh.', 'ok'); })
        .catch(function (e) { G.toast(e.message, 'err'); zt.textContent = 'Gagal: ' + e.message; });
    }
    function wizardDuplikat() {
      var th = G.input('', { ph: '2027/2028' }), kl = G.input('', { ph: 'mis. XII (kosongkan = tetap)' }), keep = { tp: true, kktp: false, prota: false };
      G.modal('Duplikasi paket ke tahun baru', h('div', { class: 'stack' }, h('div', { class: 'banner warn' }, G.icon('warning'), 'Paket saat ini dicadangkan sebagai berkas JSON di Drive Anda, lalu RPE, Promes, RPM, Asesmen, Jurnal, dan status dokumen DIKOSONGKAN untuk tahun baru.'), G.field('Tahun pelajaran baru', th), G.field('Kelas baru', kl),
        h('div', { class: 'lab' }, 'Pertahankan:'), [['tp', 'CP-TP-ATP (TP & ATP)'], ['kktp', 'KKTP'], ['prota', 'Prota']].map(function (k) { return h('label', { class: 'row', style: { gap: '6px' } }, h('input', { type: 'checkbox', checked: keep[k[0]] ? true : null, onchange: function (e) { keep[k[0]] = e.target.checked; } }), k[1]); })), { foot: function (tutup) { return [G.btn('Batal', {}, tutup), G.btn('Cadangkan & mulai', { cls: 'dng' }, function () { return G.tulis('arsip.duplikat', { tahun_pelajaran: th.value, kelas: kl.value, pertahankan: Object.keys(keep).filter(function (k) { return keep[k]; }) }).then(function (r) { if (r.success) { tutup(); G.go('#/'); } }); })]; } });
    }
  });
})();
