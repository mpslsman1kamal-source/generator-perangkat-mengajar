/* Kerangka aplikasi (sidebar + topbar), komponen bersama, dan pratinjau dokumen */
(function () {
  'use strict';
  var G = window.GPM, h = G.h, shell = null;

  G.layout = function (judul, aktif, acc) {
    var app = document.getElementById('app');
    if (!shell || !document.body.contains(shell.el)) { G.clear(app); shell = bangun(); app.appendChild(shell.el); }
    shell.judul.textContent = judul; document.title = judul + ' — Generator Perangkat Mengajar';
    shell.el.classList.remove('open'); shell.aktif = aktif; G.refreshShell();
    G.clear(shell.content); shell.content.style.setProperty('--acc', acc || '#2563EB'); return shell.content;
  };
  G.polos = function () { shell = null; var app = document.getElementById('app'); G.clear(app); return app; };

  function bangun() {
    var el = h('div', { class: 'shell' }), nav = h('nav', { class: 'nav', 'aria-label': 'Menu utama' }), judul = h('div', { class: 'title' }), content = h('main', { class: 'content', id: 'isi', tabindex: '-1' });
    var chip = h('a', { class: 'chip', href: '#/pengaturan/gemini', title: 'Status Gemini API' });
    var user = h('button', { class: 'btn sm', type: 'button', onclick: function () { G.go('#/pengaturan/akun'); } }, G.icon('account_circle'), h('span', { class: 'userlbl' }));
    var sidebar = h('aside', { class: 'sidebar' }, h('div', { class: 'brand' }, h('div', { class: 'logo' }, G.icon('edit_document')), h('div', null, h('b', null, 'Generator Perangkat Mengajar'), h('span', { class: 'small muted' }, 'Guru • Kurikulum Merdeka'))), nav);
    el.appendChild(sidebar); el.appendChild(h('div', { class: 'scrim', onclick: function () { el.classList.remove('open'); } }));
    el.appendChild(h('div', { class: 'main' }, h('header', { class: 'topbar' }, G.btn('', { ico: 'menu', cls: 'burger', title: 'Buka menu' }, function () { el.classList.toggle('open'); }), judul, chip, user, G.btn('', { ico: 'logout', cls: 'sm ghost', title: 'Keluar' }, function () { G.keluar(); })), content));
    shell = { el: el, nav: nav, judul: judul, content: content, chip: chip, user: user, aktif: '' };
    nav.addEventListener('click', function () { el.classList.remove('open'); });
    return shell;
  }

  G.refreshShell = function () {
    if (!shell) return; var b = G.S.boot || { menus: {} }, nav = G.clear(shell.nav);
    function a(href, ikon, label, key, st, lock) { var l = h('a', { href: href, class: shell.aktif === key ? 'on' : '', 'aria-current': shell.aktif === key ? 'page' : null }, ikon, h('span', { class: 'lbl' }, label), lock ? G.icon('lock', 'lock') : null, st ? G.badge(st) : null); return l; }
    nav.appendChild(a('#/', G.icon('dashboard'), 'Dashboard', 'dash'));
    nav.appendChild(h('h4', null, 'Alur perangkat'));
    for (var i = 1; i <= 9; i++) {
      var m = (b.menus || {})[i] || { status: 'Belum', terkunci: [] }, M = G.MENU[i], lock = m.terkunci && m.terkunci.length && m.status === 'Belum';
      var dot = h('span', { class: 'dot', style: { background: M[2] } });
      nav.appendChild(a('#/m/' + i, dot, i + '. ' + M[0], 'm' + i, m.status === 'Belum' ? null : m.status, lock));
    }
    nav.appendChild(h('h4', null, 'Kelola'));
    nav.appendChild(a('#/profil', G.icon('badge'), 'Profil & Data Induk', 'profil'));
    nav.appendChild(a('#/arsip', G.icon('inventory_2'), 'Arsip & Ekspor', 'arsip'));
    nav.appendChild(a('#/wa', G.icon('forum'), 'WhatsApp & CRM', 'wa'));
    nav.appendChild(a('#/template', G.icon('description'), 'Template Kustom', 'template'));
    nav.appendChild(a('#/impor', G.icon('upload_file'), 'Impor Data', 'impor'));
    nav.appendChild(a('#/pengaturan/gemini', G.icon('settings'), 'Pengaturan', 'set'));
    var api = b.api || {}, st = api.status || 'Belum diatur'; G.clear(shell.chip).appendChild(h('span', { class: 'badge ' + (st === 'Terhubung' ? 'Terhubung' : (st === 'Bermasalah' ? 'Bermasalah' : 'Belum')) }, 'Gemini: ' + st));
    var ul = shell.user.querySelector('.userlbl'); if (ul) ul.textContent = ((b.guru || {}).nama || '').split(' ')[0] || 'Akun';
  };

  /* ---------- Komponen halaman ---------- */
  G.pageHead = function (n, judul, desk) { var M = G.MENU[n]; return h('div', { class: 'pagehead' }, h('div', { class: 'num' }, String(n)), h('div', { class: 'tx' }, h('h1', null, judul || M[1]), desk ? h('p', null, desk) : null)); };
  G.semTabs = function (sem, on) {
    var w = h('div', { class: 'tabs', role: 'tablist' });
    [['1', 'Semester Ganjil'], ['2', 'Semester Genap']].forEach(function (s) { w.appendChild(h('button', { type: 'button', role: 'tab', class: sem === s[0] ? 'on' : '', 'aria-selected': sem === s[0], onclick: function () { on(s[0]); } }, s[1])); });
    return w;
  };
  G.terkunciBanner = function (pesan, menu) { return h('div', { class: 'banner warn' }, G.icon('lock'), h('div', { style: { flex: 1 } }, h('b', null, 'Menu belum dapat dipakai'), h('div', null, pesan))); };

  /** Bilah dokumen: status + pratinjau + unduh + Final/Revisi. spec: {dok, menu, sem, ref, onChange} */
  G.docBar = function (s) {
    var d = s.dok, final = d && d.status === 'Final', w = h('div', { class: 'row', style: { marginTop: '14px' } });
    w.appendChild(h('span', { class: 'lab' }, 'Dokumen')); w.appendChild(G.badge(d ? d.status : 'Belum')); if (d) w.appendChild(h('span', { class: 'small muted' }, 'v' + (d.versi || 1)));
    w.appendChild(h('span', { style: { flex: 1 } }));
    if (d) {
      w.appendChild(G.btn('Pratinjau', { ico: 'visibility', cls: 'sm' }, function () { return G.pratinjau(s.menu, s.sem, s.ref); }));
      w.appendChild(G.btn('Word', { ico: 'download', cls: 'sm' }, function () { return G.unduhDok(s.menu, s.sem, s.ref, 'docx'); }));
      w.appendChild(G.btn('PDF', { ico: 'picture_as_pdf', cls: 'sm' }, function () { return G.unduhDok(s.menu, s.sem, s.ref, 'pdf'); }));
      if (!final) w.appendChild(G.btn('Finalkan', { ico: 'verified', cls: 'sm ok' }, function () { G.konfirm('Finalkan dokumen?', 'Dokumen akan dikunci. Anda tetap dapat membuka revisi nanti.', 'Finalkan', function () { return G.tulis('dokumen.final', { id_dokumen: d.id_dokumen }).then(function (r) { if (r.success && s.onChange) s.onChange(); }); }); }));
      else w.appendChild(G.btn('Buka Revisi', { ico: 'edit', cls: 'sm' }, function () { G.konfirm('Buka revisi?', 'Status kembali menjadi Draf (versi naik) dan dokumen turunan dapat terpengaruh.', 'Buka revisi', function () { return G.tulis('dokumen.revisi', { id_dokumen: d.id_dokumen }).then(function (r) { if (r.success && s.onChange) s.onChange(); }); }); }));
    }
    return w;
  };
  G.unduhDok = function (menu, sem, ref, fmt) {
    G.toast('Menyiapkan ' + (fmt === 'pdf' ? 'PDF' : 'Word') + '… (beberapa detik)');
    return G.api('ekspor.dokumen', { menu: menu, semester: sem, ref: ref || '', format: fmt }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); G.unduhB64(r.data.nama, r.data.mime, r.data.base64); G.toast('Berkas diunduh: ' + r.data.nama, 'ok'); });
  };
  G.pratinjau = function (menu, sem, ref) {
    var box = h('div', { class: 'paper-wrap' }, G.skel(6)), mdl = G.modal('Pratinjau dokumen', box, { wide: true });
    return G.api('ekspor.dokumen', { menu: menu, semester: sem, ref: ref || '', format: 'model' }).then(function (r) { G.clear(box); if (!r.success) { box.appendChild(h('div', { class: 'empty' }, r.message)); return; } box.appendChild(G.renderModel(r.data.model)); });
  };
  G.renderModel = function (m) {
    var p = h('div', { class: 'paper' + (m.lanskap ? ' land' : '') });
    m.blok.forEach(function (b) {
      if (b.t === 'kop') { p.appendChild(h('div', { class: 'kop' }, b.sekolah)); }
      else if (b.t === 'h1') p.appendChild(h('h1', null, b.teks)); else if (b.t === 'h2') p.appendChild(h('h2', null, b.teks));
      else if (b.t === 'p') p.appendChild(h('p', { class: b.tebal ? 'tb' : '', style: { textAlign: b.tengah ? 'center' : null, fontSize: b.kecil ? '10px' : null } }, b.teks));
      else if (b.t === 'br') p.appendChild(h('div', { style: { height: '6px' } }));
      else if (b.t === 'kv') p.appendChild(h('table', { class: 'kv' }, h('tbody', null, b.baris.map(function (r) { return h('tr', null, h('td', null, r[0]), h('td', null, ': ' + (r[1] || ''))); }))));
      else if (b.t === 'tabel') {
        var tot = b.lebar.reduce(function (a, c) { return a + c; }, 0), tb = h('table', { class: b.kecil ? 'small' : '' }), hd = h('thead');
        if (b.kelompok) hd.appendChild(h('tr', null, b.kelompok.map(function (c) { return h('th', null, c); })));
        hd.appendChild(h('tr', null, b.kepala.map(function (c, i) { return h('th', { style: { width: (b.lebar[i] * 100 / tot) + '%' } }, c); }))); tb.appendChild(hd);
        tb.appendChild(h('tbody', null, b.baris.map(function (r, ri) { return h('tr', { style: { fontWeight: b.tebalAkhir && ri === b.baris.length - 1 ? '700' : null } }, r.map(function (c) { return h('td', null, c == null ? '' : String(c)); })); })));
        p.appendChild(tb);
      } else if (b.t === 'ttd') p.appendChild(h('div', { class: 'ttd' }, h('div', null, b.kiri.jabatan, h('div', { class: 'sp' }), h('b', null, b.kiri.nama), b.kiri.nip ? '\nNIP. ' + b.kiri.nip : ''), h('div', null, b.kota + ', ' + b.tanggal + '\n' + b.kanan.jabatan, h('div', { class: 'sp' }), h('b', null, b.kanan.nama), b.kanan.nip ? '\nNIP. ' + b.kanan.nip : '')));
    });
    return p;
  };

  /** Penyunting generik objek JSON (untuk bagian RPM / butir soal) → formulir berlabel. */
  G.editorJson = function (obj, onChange, labelMap) {
    labelMap = labelMap || {};
    function lab(k) { return labelMap[k] || String(k).replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); }
    function node(val, parent, k, depth) {
      if (typeof val === 'string') { var ta = G.input(val, { area: true, rows: Math.min(8, Math.max(2, Math.ceil(val.length / 90))), on: function (v) { parent[k] = v; onChange(); } }); return ta; }
      if (typeof val === 'number') return G.input(val, { type: 'number', on: function (v) { parent[k] = Number(v); onChange(); } });
      if (typeof val === 'boolean') return h('label', null, h('input', { type: 'checkbox', checked: val ? true : null, onchange: function (e) { parent[k] = e.target.checked; onChange(); } }), ' Ya');
      if (Array.isArray(val)) {
        var box = h('div', { class: 'stack s8', style: { borderLeft: '3px solid #94A3B8', paddingLeft: '10px' } });
        function gambar() { G.clear(box); val.forEach(function (it, i) { var r = h('div', { class: 'row', style: { alignItems: 'flex-start', flexWrap: 'nowrap' } }, h('div', { style: { flex: 1, minWidth: 0 } }, typeof it === 'object' && it ? node(it, val, i, depth + 1) : node(it, val, i, depth + 1)), G.btn('', { ico: 'delete', cls: 'sm ghost', title: 'Hapus butir' }, function () { val.splice(i, 1); onChange(); gambar(); })); box.appendChild(r); });
          var contoh = val[0]; box.appendChild(G.btn('Tambah', { ico: 'add', cls: 'sm' }, function () { val.push(typeof contoh === 'object' && contoh ? JSON.parse(JSON.stringify(contoh, function (kk, v) { return typeof v === 'string' ? '' : v; })) : ''); onChange(); gambar(); })); }
        gambar(); return box;
      }
      if (val && typeof val === 'object') { var f = h('div', { class: 'stack s8' }); Object.keys(val).forEach(function (kk) { f.appendChild(G.field(lab(kk), node(val[kk], val, kk, depth + 1))); }); return f; }
      return h('span', null, String(val));
    }
    var root = { v: obj }; return node(obj, root, 'v', 0);
  };
  G.tanggalIndo = function (s) { if (!s) return ''; var p = String(s).split('-'); var b = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']; return p.length === 3 ? Number(p[2]) + ' ' + b[Number(p[1]) - 1] + ' ' + p[0] : s; };
  G.prasyaratTeks = function (boot, n) { var m = (boot.menus || {})[n]; return m && m.terkunci && m.terkunci.length ? 'Selesaikan dan finalkan dulu: ' + m.terkunci.join(', ') + '.' : ''; };
  G.unggahBerkas = function (jenis, label, onDone, accept) {
    var inp = h('input', { type: 'file', accept: accept || '.pdf,.docx,.jpg,.jpeg,.png', style: { display: 'none' } });
    inp.addEventListener('change', function () { var f = inp.files[0]; if (!f) return; if (f.size > 20 * 1024 * 1024) return G.toast('Ukuran berkas maksimal 20 MB.', 'err'); G.toast('Mengunggah…'); G.bacaBerkas(f).then(function (b64) { return G.tulis('berkas.upload', { nama: f.name, jenis: jenis, base64: b64 }, { boot: true }); }).then(function (r) { if (r && r.success) onDone(r.data); inp.value = ''; }); });
    return h('span', null, inp, G.btn(label || 'Unggah berkas', { ico: 'upload_file', cls: 'sm' }, function () { inp.click(); }));
  };
})();
