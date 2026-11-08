(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  G.route('/', function () {
    var c = G.layout('Dashboard', 'dash'), b = G.S.boot;
    function gambar() {
      b = G.S.boot; if (!b) return; G.clear(c);
      var pr = b.profil || {}, api = b.api || {}, lengkap = pr.nama_sekolah && pr.mapel && pr.kelas && pr.tahun_pelajaran;
      c.appendChild(h('div', { class: 'card accent', style: { '--acc': '#2563EB', marginBottom: '16px' } }, h('div', { class: 'bd row between' },
        h('div', null, h('h1', null, 'Halo, ' + ((b.guru || {}).nama || 'Guru') + ' 👋'), h('p', { class: 'muted', style: { margin: '4px 0 0' } }, lengkap ? [pr.nama_sekolah, pr.mapel, 'Kelas ' + pr.kelas, 'TP ' + pr.tahun_pelajaran].join(' • ') : 'Lengkapi Profil & Data Induk terlebih dahulu.')),
        h('div', { class: 'row' }, h('div', { class: 'chip' }, G.icon('task_alt'), (b.finalTotal || 0) + ' dokumen Final'), G.btn('Profil', { ico: 'badge', cls: 'sm' }, function () { G.go('#/profil'); })))));
      if (!lengkap) c.appendChild(h('div', { class: 'banner warn', style: { marginBottom: '16px' } }, G.icon('info'), h('div', { style: { flex: 1 } }, 'Isi nama sekolah, mata pelajaran, kelas, tahun pelajaran, dan daftar bab agar alur dapat berjalan.'), G.btn('Lengkapi sekarang', { cls: 'pri sm' }, function () { G.go('#/profil'); })));
      if (api.status !== 'Terhubung') c.appendChild(h('div', { class: 'banner ' + (api.status === 'Bermasalah' ? 'err' : 'warn'), style: { marginBottom: '16px' } }, G.icon('key'), h('div', { style: { flex: 1 } }, h('b', null, 'Gemini API: ' + (api.status || 'Belum diatur')), h('div', { class: 'small' }, 'Fitur AI (membaca kalender, menyusun TP, RPM, soal) memerlukan API key Gemini Anda.')), G.btn('Atur API key', { cls: 'pri sm' }, function () { G.go('#/pengaturan/gemini'); })));
      // Stepper
      var st = h('div', { class: 'stepper', role: 'list', 'aria-label': 'Alur kerja' });
      for (var i = 1; i <= 9; i++) { var m = b.menus[i] || { status: 'Belum' }; st.appendChild(h('a', { class: 's ' + m.status, role: 'listitem', href: '#/m/' + i, title: G.MENU[i][1] }, h('b', null, String(i)), G.MENU[i][0].split(' ')[0])); }
      c.appendChild(st);
      var gr = h('div', { class: 'grid g3', style: { marginTop: '16px' } });
      for (var n = 1; n <= 9; n++) (function (n) {
        var M = G.MENU[n], m = b.menus[n] || { status: 'Belum', terkunci: [] }, kunci = m.terkunci && m.terkunci.length && m.status === 'Belum';
        gr.appendChild(h('a', { class: 'mcard' + (kunci ? ' lock' : ''), href: '#/m/' + n, style: { '--acc': M[2] === '#FACC15' ? '#A16207' : M[2], borderTopColor: M[2] } },
          h('div', { class: 'row between' }, h('span', { class: 'k' }, 'MENU ' + n), kunci ? G.icon('lock', 'muted') : G.badge(m.status)),
          h('div', { class: 'row', style: { gap: '8px', flexWrap: 'nowrap' } }, G.icon(M[3]), h('h3', null, M[0])),
          h('div', { class: 'small muted' }, M[1]), kunci ? h('div', { class: 'small', style: { color: '#B45309', fontWeight: 600 } }, 'Prasyarat: ' + m.terkunci.join(', ')) : (m.jumlah ? h('div', { class: 'small muted' }, m.jumlah + ' dokumen • ' + (m.diperbarui ? G.tanggalIndo(m.diperbarui.slice(0, 10)) : '')) : h('div', { class: 'small muted' }, 'Belum dibuat'))));
      })(n);
      c.appendChild(gr);
      c.appendChild(h('div', { class: 'grid g3', style: { marginTop: '16px' } },
        h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Alur data')), h('div', { class: 'bd small' }, 'RPE → CP-TP-ATP → Prota → Promes → KKTP → RPM → Asesmen → Jurnal. Angka (pekan, JP, skor) dihitung kode; AI hanya menulis teks.')),
        h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Aktivitas Gemini')), h('div', { class: 'bd small', id: 'akt' }, h('span', { class: 'muted' }, 'Memuat…'))),
        h('div', { class: 'card' }, h('div', { class: 'hd' }, h('h3', null, 'Dokumen Final')), h('div', { class: 'bd' }, h('b', { class: 'mono', style: { fontSize: '28px' } }, String(b.finalTotal || 0)), h('span', { class: 'muted' }, ' dari ' + (b.dokumenTotal || 0) + ' dokumen'), h('div', null, G.btn('Arsip & Ekspor', { ico: 'inventory_2', cls: 'sm' }, function () { G.go('#/arsip'); }))))));
      if (api.status === 'Terhubung') G.swr('api.riwayat', {}, function (d) { var a = document.getElementById('akt'); if (!a || !d) return; G.clear(a).appendChild(h('div', null, h('b', null, String(d.hariIni || 0)), ' panggilan hari ini • ', h('b', null, String(d.tujuhHari || 0)), ' dalam 7 hari')); });
    }
    if (b) gambar(); else c.appendChild(G.skel(6));
    G.segarBoot().then(function () { if (G.S.boot) gambar(); });
  });
})();
