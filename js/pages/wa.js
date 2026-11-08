(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  G.route('/wa', function () { return buka('pengaturan'); });
  G.route('/wa/:tab', function (t) { return buka(t); });
  function buka(tab) {
    var c = G.layout('WhatsApp & CRM', 'wa'); tab = ['pengaturan', 'kontak', 'blast', 'antrean'].indexOf(tab) >= 0 ? tab : 'pengaturan';
    c.appendChild(h('div', { class: 'pagehead' }, h('div', { class: 'tx' }, h('h1', null, 'WhatsApp, Email & Kontak'), h('p', null, 'Notifikasi via Fonnte (token milik Anda) dan Email. Pesan masuk antrean dan dikirim bertahap; kontak yang berhenti berlangganan dihormati.'))));
    var tabs = h('div', { class: 'tabs', role: 'tablist' }); [['pengaturan', 'Pengaturan'], ['kontak', 'Kontak (CRM)'], ['blast', 'Kirim Massal'], ['antrean', 'Antrean & Riwayat']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', class: tab === t[0] ? 'on' : '', onclick: function () { G.go('#/wa/' + t[0]); } }, t[1])); });
    c.appendChild(tabs); var isi = h('div', { class: 'stack' }, G.skel(4)); c.appendChild(isi);
    ({ pengaturan: pengaturan, kontak: kontak, blast: blast, antrean: antrean })[tab](isi);
  }

  function pengaturan(isi) {
    G.api('notif.config', {}).then(function (r) {
      G.clear(isi); if (!r.success) return isi.appendChild(h('div', { class: 'banner err' }, r.message));
      var d = r.data, C = JSON.parse(JSON.stringify(d.config)), token = G.input('', { type: 'password', ac: 'off', ph: d.tokenAda ? d.tokenSamar + ' (tersimpan)' : 'Tempel token Fonnte' }), no = G.input(d.noWa, { mode: 'tel', ph: '08xxxxxxxxxx' });
      function sw(k, l) { return h('label', { class: 'row', style: { gap: '8px', fontWeight: 700 } }, h('input', { type: 'checkbox', checked: C[k] ? true : null, onchange: function (e) { C[k] = e.target.checked; } }), l); }
      var batch = G.select([['10', '10 pesan / batch'], ['20', '20 pesan / batch'], ['50', '50 pesan / batch']], String(C.batch), function (v) { C.batch = Number(v); }), jeda = G.input(C.jeda, { ph: '5 atau 3-8', on: function (v) { C.jeda = v; } });
      isi.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Koneksi & saklar'), d.trigger ? G.badge('Terhubung') : h('span', { class: 'badge Perbaikan', title: 'Jalankan setupAppEnvironment di Apps Script' }, 'Trigger pekerja belum aktif')), h('div', { class: 'bd stack' },
        h('div', { class: 'grid g2' }, G.field('Token Fonnte', token, 'Disimpan terenkripsi di server; tidak pernah dikirim balik.'), G.field('Nomor WhatsApp Anda (penerima notifikasi)', no)),
        h('div', { class: 'row', style: { gap: '24px' } }, sw('waAktif', 'Aktifkan WhatsApp'), sw('emailAktif', 'Aktifkan Email'), h('span', { class: 'chip' }, 'Sisa kuota email hari ini: ' + (d.kuotaEmail >= 0 ? d.kuotaEmail : '—'))),
        h('div', { class: 'grid g3' }, G.field('Ukuran batch blast', batch), G.field('Jeda antar pesan (detik)', jeda)),
        h('div', { class: 'hint' }, 'Email "atur ulang kata sandi" selalu terkirim tanpa memedulikan saklar ini.'),
        h('div', { class: 'row' }, G.btn('Simpan', { cls: 'pri', ico: 'save' }, function () { return G.tulis('notif.simpan', { token: token.value.trim() || undefined, noWa: no.value, waAktif: C.waAktif, emailAktif: C.emailAktif, batch: C.batch, jeda: C.jeda, matriks: C.matriks }).then(function (x) { if (x.success) G.render(); }); }), G.btn('Uji WhatsApp', { ico: 'send' }, function () { return G.api('notif.uji', { kanal: 'wa', nomor: no.value }).then(function (x) { G.toast(x.message, x.success ? 'ok' : 'err'); }); }), G.btn('Uji Email', { ico: 'mail' }, function () { return G.api('notif.uji', { kanal: 'email' }).then(function (x) { G.toast(x.message, x.success ? 'ok' : 'err'); }); }), G.btn('Cek perangkat', { ico: 'smartphone' }, function () { return G.api('wa.device', {}).then(function (x) { G.toast(x.success ? 'Perangkat ' + x.data.device + ' • ' + (x.data.status || '') : x.message, x.success ? 'ok' : 'err'); }); }), d.tokenAda ? G.btn('Hapus token', { cls: 'dng sm', ico: 'delete' }, function () { return G.tulis('notif.simpan', { token: '__HAPUS__', waAktif: false }).then(function () { G.render(); }); }) : null))));
      var tb = h('tbody'); Object.keys(C.matriks).forEach(function (k) { var m = C.matriks[k]; tb.appendChild(h('tr', null, h('td', null, h('b', null, m.label), h('div', { class: 'mono small muted' }, k)), h('td', { class: 'c' }, h('input', { type: 'checkbox', 'aria-label': 'WA ' + m.label, checked: m.wa ? true : null, onchange: function (e) { m.wa = e.target.checked; } })), h('td', { class: 'c' }, h('input', { type: 'checkbox', 'aria-label': 'Email ' + m.label, checked: m.email ? true : null, onchange: function (e) { m.email = e.target.checked; } })), h('td', { style: { minWidth: '300px' } }, G.input(m.pesan, { area: true, rows: 2, on: function (v) { m.pesan = v; } }), h('div', { class: 'hint' }, 'Variabel: {nama} {dokumen} {pengirim}')))); });
      isi.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h2', null, 'Matriks peristiwa')), h('div', { class: 'bd' }, h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Peristiwa', 'WA', 'Email', 'Isi pesan'].map(function (t) { return h('th', null, t); }))), tb)), h('div', { class: 'hint', style: { marginTop: '6px' } }, 'Tekan "Simpan" di atas untuk menyimpan matriks.'))));
    });
  }

  function kontak(isi) {
    var f = { q: '', segmen: '', halaman: 1 }, tbl = h('div'), sel = {};
    var q = G.input('', { ph: 'Cari nama / email / WA…', on: function (v) { clearTimeout(q._t); q._t = setTimeout(function () { f.q = v; f.halaman = 1; muat(); }, 250); } });
    isi.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Kontak'), G.btn('Tambah', { ico: 'person_add', cls: 'sm pri' }, function () { form(); }), G.btn('Impor CSV', { ico: 'upload_file', cls: 'sm' }, imporCsv), G.btn('Cek nomor WA', { ico: 'verified_user', cls: 'sm' }, cekWa)), h('div', { class: 'bd stack' }, q, tbl)));
    function muat() {
      G.clear(tbl).appendChild(G.skel(3));
      G.api('crm.list', f).then(function (r) {
        G.clear(tbl); if (!r.success) return tbl.appendChild(h('div', { class: 'banner err' }, r.message)); var d = r.data, s = d.stat;
        tbl.appendChild(h('div', { class: 'row' }, [['Total', s.total], ['Punya WA', s.wa], ['Terdaftar WA', s.terdaftar], ['Email', s.email], ['Berhenti', s.optOut], ['Belum dicek', s.belumCek]].map(function (x) { return h('span', { class: 'chip' }, x[0] + ': ' + x[1]); })));
        if (!d.rows.length) return tbl.appendChild(h('div', { class: 'empty' }, 'Belum ada kontak.'));
        tbl.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['', 'Nama', 'WA', 'Email', 'Segmen', 'Status WA', ''].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.rows.map(function (k) { return h('tr', null, h('td', { class: 'c' }, h('input', { type: 'checkbox', 'aria-label': 'Pilih ' + k.Nama, checked: sel[k.KontakID] ? true : null, onchange: function (e) { sel[k.KontakID] = e.target.checked; } })), h('td', null, k.Nama, k.OptOut === 'YA' ? h('span', { class: 'chip', style: { marginLeft: '6px' } }, 'Berhenti') : null), h('td', { class: 'mono small' }, k.NoWA), h('td', { class: 'small' }, k.Email), h('td', { class: 'small' }, k.Segmen), h('td', null, k.StatusWA ? G.badge(k.StatusWA === 'Terdaftar' ? 'Terhubung' : 'Bermasalah') : h('span', { class: 'muted small' }, '—')), h('td', { class: 'nowrap' }, G.btn('', { ico: 'edit', cls: 'sm', title: 'Ubah' }, function () { form(k); }), ' ', G.btn('', { ico: 'delete', cls: 'sm ghost', title: 'Hapus' }, function () { G.konfirm('Hapus kontak?', k.Nama, 'Hapus', function () { return G.tulis('crm.hapus', { ids: [k.KontakID] }, { boot: false }).then(muat); }, true); }))); })))));
        if (d.total > d.per) tbl.appendChild(h('div', { class: 'row between' }, G.btn('Sebelumnya', { cls: 'sm' }, function () { if (f.halaman > 1) { f.halaman--; muat(); } }), h('span', { class: 'small' }, 'Hal. ' + d.halaman), G.btn('Berikutnya', { cls: 'sm' }, function () { if (f.halaman * d.per < d.total) { f.halaman++; muat(); } })));
      });
    }
    function form(k) {
      k = k || {}; var v = { Nama: k.Nama || '', NoWA: k.NoWA || '', Email: k.Email || '', Segmen: k.Segmen || 'Umum', Tag: k.Tag || '', OptOut: k.OptOut || 'TIDAK' };
      G.modal(k.KontakID ? 'Ubah kontak' : 'Tambah kontak', h('div', { class: 'stack' }, G.field('Nama', G.input(v.Nama, { on: function (x) { v.Nama = x; } })), h('div', { class: 'grid g2' }, G.field('No. WhatsApp', G.input(v.NoWA, { mode: 'tel', on: function (x) { v.NoWA = x; } })), G.field('Email', G.input(v.Email, { type: 'email', on: function (x) { v.Email = x; } }))), h('div', { class: 'grid g2' }, G.field('Segmen', G.input(v.Segmen, { on: function (x) { v.Segmen = x; } })), G.field('Tag', G.input(v.Tag, { on: function (x) { v.Tag = x; } }))), h('label', { class: 'row', style: { gap: '6px' } }, h('input', { type: 'checkbox', checked: v.OptOut === 'YA' ? true : null, onchange: function (e) { v.OptOut = e.target.checked ? 'YA' : 'TIDAK'; } }), 'Berhenti menerima pesan (opt-out)')), { foot: function (tutup) { return [G.btn('Batal', {}, tutup), G.btn('Simpan', { cls: 'pri' }, function () { return G.tulis('crm.simpan', Object.assign({ KontakID: k.KontakID }, v), { boot: false }).then(function (r) { if (r.success) { tutup(); muat(); } }); })]; } });
    }
    function imporCsv() {
      var ta = G.input('', { area: true, rows: 8, ph: 'nama,wa,email,segmen,tag\nAni,08123456789,ani@mail.com,Wali murid,' });
      G.modal('Impor kontak', h('div', { class: 'stack' }, h('div', { class: 'hint' }, 'Kolom: nama, wa, email, segmen, tag. Nomor ganda dilewati otomatis.'), ta), { foot: function (tutup) { return [G.btn('Batal', {}, tutup), G.btn('Impor', { cls: 'pri' }, function () { return G.tulis('crm.import', { rows: G.csv(ta.value) }, { boot: false }).then(function (r) { if (r.success) { tutup(); muat(); } }); })]; } });
    }
    function cekWa() { var ids = Object.keys(sel).filter(function (x) { return sel[x]; }); return G.api('crm.list', { halaman: 1 }).then(function (r) { var nomor = (r.data.rows || []).filter(function (k) { return !ids.length || sel[k.KontakID]; }).map(function (k) { return k.NoWA; }).filter(String); if (!nomor.length) return G.toast('Tidak ada nomor.', 'err'); return G.api('wa.validate', { nomor: nomor }).then(function (x) { G.toast(x.message, x.success ? 'ok' : 'err'); muat(); }); }); }
    muat();
  }

  function blast(isi) {
    var judul = G.input('', { ph: 'Mis. Pengumuman pengumpulan perangkat', max: 80 }), pesan = G.input('', { area: true, rows: 5, max: 1500, ph: 'Halo {nama}, …' }), seg = G.input('', { ph: 'Segmen (kosong = semua kontak)' }), hasil = h('div', { class: 'stack' });
    isi.appendChild(h('div', { class: 'card accent' }, h('div', { class: 'hd' }, h('h2', null, 'Kirim massal WhatsApp')), h('div', { class: 'bd stack' }, h('div', { class: 'banner warn small' }, G.icon('shield'), 'Kirim hanya kepada kontak yang bersedia menerima pesan. Kontak opt-out, nomor tidak valid, dan duplikat dilewati otomatis. Pesan dikirim bertahap sesuai ukuran batch dan jeda di Pengaturan.'), G.field('Judul (internal)', judul), G.field('Isi pesan', pesan, 'Gunakan {nama} untuk menyapa tiap kontak.'), G.field('Segmen', seg),
      h('div', { class: 'row end' }, G.btn('Buat & kirim', { cls: 'pri', ico: 'send' }, function () {
        return G.api('crm.list', { segmen: seg.value.trim() }).then(function (r) { var n = r.success ? r.data.total : 0; G.konfirm('Kirim ke ' + n + ' kontak?', 'Pesan akan masuk antrean dan dikirim bertahap.', 'Kirim', function () { return mulai(); }); });
      })), hasil)));
    function mulai() {
      return G.api('crm.list', { segmen: seg.value.trim(), halaman: 1 }).then(function (r) {
        var ids = null; if (seg.value.trim()) ids = []; var kumpul = Promise.resolve();
        if (seg.value.trim()) { var tp = Math.ceil(r.data.total / r.data.per), h2 = []; for (var p = 1; p <= tp; p++) h2.push(p); kumpul = h2.reduce(function (pr, p) { return pr.then(function () { return G.api('crm.list', { segmen: seg.value.trim(), halaman: p }).then(function (x) { ids = ids.concat(x.data.rows.map(function (k) { return k.KontakID; })); }); }); }, Promise.resolve()); }
        return kumpul.then(function () { return G.tulis('wa.blast', { judul: judul.value, pesan: pesan.value, kontakIds: ids || [] }, { boot: false }); }).then(function (b) {
          if (!b.success) return; var id = b.data.blastId; G.clear(hasil).appendChild(h('div', { class: 'stack' }, h('div', { class: 'progress' }, h('i', { id: 'bp', style: { width: '0%' } })), h('div', { id: 'bt', class: 'small' }, 'Memproses…'), h('div', { class: 'small muted' }, 'Dilewati: opt-out ' + b.data.lewat.optOut + ', tidak valid ' + b.data.lewat.tidakValid + ', ganda ' + b.data.lewat.ganda), G.btn('Hentikan', { cls: 'dng sm', ico: 'stop' }, function () { stop = true; return G.api('wa.blastProses', { blastId: id, hentikan: true }); })));
          var stop = false; function putar() { if (stop) return; G.api('wa.blastProses', { blastId: id }).then(function (x) { if (!x.success) { document.getElementById('bt').textContent = x.message; return; } var s = x.data.stat, done = s.Terkirim + s.Gagal + s.Batal; var bp = document.getElementById('bp'), bt = document.getElementById('bt'); if (!bp) return; bp.style.width = Math.round(done * 100 / x.data.total) + '%'; bt.textContent = s.Terkirim + ' terkirim • ' + s.Gagal + ' gagal • ' + s.Antri + ' antre'; if (s.Antri > 0 && document.body.contains(bp)) setTimeout(putar, 3000); else G.toast('Blast selesai.', 'ok'); }); }
          putar();
        });
      });
    }
  }

  function antrean(isi) {
    G.api('notif.antrean', {}).then(function (r) {
      G.clear(isi); if (!r.success) return isi.appendChild(h('div', { class: 'banner err' }, r.message)); var d = r.data;
      isi.appendChild(h('div', { class: 'row' }, ['Antri', 'Terkirim', 'Gagal', 'Batal'].map(function (k) { return h('span', { class: 'chip' }, k + ': ' + d.ringkas[k]); }), G.btn('Proses antrean sekarang', { cls: 'sm pri', ico: 'play_arrow' }, function () { return G.api('notif.proses', {}).then(function (x) { G.toast(x.message || 'Diproses.', 'ok'); G.render(); }); })));
      isi.appendChild(h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Pesan terakhir')), h('div', { class: 'bd' }, d.baris.length ? h('div', { class: 'tw' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Waktu', 'Kanal', 'Tujuan', 'Peristiwa', 'Pesan', 'Status'].map(function (t) { return h('th', null, t); }))), h('tbody', null, d.baris.map(function (b) { return h('tr', null, h('td', { class: 'small' }, (b.waktu || '').replace('T', ' ').slice(0, 16)), h('td', null, b.kanal), h('td', { class: 'mono small' }, b.tujuan), h('td', { class: 'small' }, b.event), h('td', { class: 'small' }, b.pesan), h('td', null, G.badge(b.status), b.respon && b.status !== 'Terkirim' ? h('div', { class: 'small muted' }, b.respon) : null)); })))) : h('div', { class: 'empty' }, 'Belum ada pesan.'))));
    });
  }
})();
