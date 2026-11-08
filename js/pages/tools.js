(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  /* ---------- Template kustom ---------- */
  G.route('/template', function () {
    var c = G.layout('Template Kustom', 'template');
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'Template dokumen kustom'), h('p', null, 'Unggah template Word (.docx) berisi penanda {{nama_guru}}, {{sekolah}}, {{tanggal}}, atau bidang buatan sendiri. Sistem mengisinya otomatis dan menghasilkan .docx.'))));
    var box = h('div', { class: 'stack' }); c.appendChild(box);
    function muat() {
      G.clear(box).appendChild(G.skel(3));
      Promise.all([G.api('tpl.list', {}), G.api('berkas.list', { jenis: 'template' })]).then(function (rs) {
        G.clear(box); if (!rs[0].success) return box.appendChild(h('div', { class: 'banner err' }, rs[0].message));
        var d = rs[0].data, berkas = rs[1].data || [];
        box.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, '1. Unggah template'), G.unggahBerkas('template', 'Unggah .docx', muat, '.docx')),
          h('div', { class: 'bd stack' }, h('div', { class: 'hint' }, 'Bidang otomatis tersedia: ' + d.otomatis.map(function (k) { return '{{' + k + '}}'; }).join(' ')), berkas.length ? h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Berkas', 'Diunggah', ''].map(function (t) { return h('th', null, t); }))), h('tbody', null, berkas.map(function (b) { return h('tr', null, h('td', null, b.nama_berkas), h('td', { class: 'small' }, G.tanggalIndo((b.diunggah_pada || '').slice(0, 10))), h('td', null, G.btn('Pindai bidang', { cls: 'sm', ico: 'manage_search' }, function () { return G.tulis('tpl.pindai', { id_berkas: b.id_berkas, kode: b.nama_berkas.replace(/\.docx$/i, '') }, { boot: false }).then(function () { muat(); }); }), ' ', G.btn('', { cls: 'sm ghost', ico: 'delete', title: 'Hapus berkas' }, function () { return G.tulis('berkas.hapus', { id_berkas: b.id_berkas }, { boot: false }).then(muat); }))); })))) : h('div', { class: 'empty' }, 'Belum ada berkas template.'))));
        box.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, '2. Template terdaftar')), h('div', { class: 'bd stack' }, d.template.length ? d.template.map(function (t) {
          var nilai = {}, otomatis = d.otomatis, form = h('div', { class: 'grid g3' });
          t.bidang.filter(function (k) { return otomatis.indexOf(k) < 0; }).forEach(function (k) { form.appendChild(G.field(k.replace(/_/g, ' '), G.input('', { on: function (v) { nilai[k] = v; } }))); });
          return h('div', { class: 'card flat' }, h('div', { class: 'hd' }, h('h3', null, t.nama), h('span', { class: 'chip' }, t.bidang.length + ' bidang • v' + t.versi), G.btn('', { cls: 'sm ghost', ico: 'delete' }, function () { return G.tulis('tpl.hapus', { id: t.id }, { boot: false }).then(muat); })), h('div', { class: 'bd stack' }, t.bidang.length ? h('div', { class: 'row' }, t.bidang.map(function (k) { return h('span', { class: 'chip mono' }, '{{' + k + '}}'); })) : null, form.children.length ? form : h('div', { class: 'muted small' }, 'Semua bidang terisi otomatis.'), h('div', { class: 'row end' }, G.btn('Hasilkan .docx', { cls: 'pri sm', ico: 'download' }, function () { return G.api('tpl.render', { id: t.id, nilai: nilai }).then(function (r) { if (!r.success) return G.toast(r.message, 'err'); G.unduhB64(r.data.nama, r.data.mime, r.data.base64); G.toast(r.data.kosong.length ? 'Diunduh. Bidang kosong: ' + r.data.kosong.join(', ') : 'Berkas diunduh.', r.data.kosong.length ? '' : 'ok'); }); }))));
        }) : h('div', { class: 'empty' }, 'Pindai berkas template untuk mendaftarkannya.'))));
      });
    }
    muat();
  });

  /* ---------- Impor data ---------- */
  function csv(t) {
    var rows = [], r = [], v = '', q = false, sep = (t.split('\n')[0].match(/;/g) || []).length > (t.split('\n')[0].match(/,/g) || []).length ? ';' : (t.indexOf('\t') >= 0 ? '\t' : ',');
    for (var i = 0; i < t.length; i++) { var ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { v += '"'; i++; } else if (ch === '"') q = false; else v += ch; } else if (ch === '"') q = true; else if (ch === sep) { r.push(v); v = ''; } else if (ch === '\n') { r.push(v); rows.push(r); r = []; v = ''; } else if (ch !== '\r') v += ch; }
    if (v !== '' || r.length) { r.push(v); rows.push(r); }
    var hd = (rows.shift() || []).map(function (x) { return x.trim().toLowerCase().replace(/\s+/g, '_'); });
    return rows.filter(function (x) { return x.join('').trim(); }).map(function (x) { var o = {}; hd.forEach(function (k, i) { o[k] = (x[i] || '').trim(); }); return o; });
  }
  G.csv = csv;
  var KOL = { bab: ['semester', 'no_bab', 'nama_bab', 'bobot'], cp: ['elemen', 'teks_cp', 'halaman_sumber'], tp: ['semester', 'no_bab', 'elemen', 'teks_tp', 'bloom'] };
  G.route('/impor', function () {
    var c = G.layout('Impor Data', 'impor'); var jenis = 'bab', rows = [];
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'Impor data'), h('p', null, 'Pindahkan data lama (Bab, CP, TP) dari CSV / hasil salin dari Excel. Selalu uji coba dahulu; impor aman diulang karena data yang sudah ada dilewati.'))));
    var ta = G.input('', { area: true, rows: 8, ph: 'Tempel data berformat CSV/tab dengan baris judul kolom…', on: function (v) { rows = csv(v); } }), jsel = G.select([['bab', 'Daftar Bab'], ['cp', 'Capaian Pembelajaran'], ['tp', 'Tujuan Pembelajaran']], jenis, function (v) { jenis = v; kolom(); }), kol = h('div', { class: 'hint' }), out = h('div', { class: 'stack' });
    function kolom() { kol.textContent = 'Kolom: ' + KOL[jenis].join(', '); } kolom();
    var file = h('input', { type: 'file', accept: '.csv,.txt,.tsv', style: { display: 'none' }, onchange: function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { ta.value = r.result; rows = csv(r.result); }; r.readAsText(f); } });
    c.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Sumber data'), file, G.btn('Pilih berkas CSV', { ico: 'upload_file', cls: 'sm' }, function () { file.click(); })), h('div', { class: 'bd stack' }, G.field('Jenis data', jsel), kol, ta,
      h('div', { class: 'row' }, G.btn('1. Uji coba (tidak mengubah data)', { ico: 'fact_check' }, function () { rows = csv(ta.value); if (!rows.length) return G.toast('Tempel data dulu.', 'err'); return G.api('import.pindai', { jenis: jenis, rows: rows }).then(function (r) { G.clear(out); if (!r.success) return out.appendChild(h('div', { class: 'banner err' }, r.message)); var d = r.data; out.appendChild(G.validasi([{ level: 'ok', pesan: d.akanDitambah + ' baris baru akan ditambahkan.' }, { level: d.sudahAda ? 'warn' : 'ok', pesan: d.sudahAda + ' baris sudah ada dan dilewati.' }, { level: d.bermasalah ? 'err' : 'ok', pesan: d.bermasalah + ' baris bermasalah.' }].concat(d.contohMasalah.map(function (m) { return { level: 'err', pesan: m }; })))); }); }),
        G.btn('2. Jalankan impor', { cls: 'pri', ico: 'play_arrow' }, function () { rows = csv(ta.value); if (!rows.length) return G.toast('Tempel data dulu.', 'err'); return G.tulis('import.jalankan', { jenis: jenis, rows: rows }); })), out)));
  });
})();
