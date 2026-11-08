(function () {
  'use strict';
  var G = window.GPM, h = G.h;

  function kerangka(judul, sub, isi) {
    var app = G.polos();
    app.appendChild(h('div', { class: 'auth' },
      h('div', { class: 'art' }, h('div', { class: 'row' }, h('div', { class: 'logo', style: { width: '48px', height: '48px', background: '#fff', color: '#0D1C2D', display: 'grid', placeItems: 'center', border: '2px solid #000' } }, G.icon('edit_document')), h('b', { style: { textTransform: 'uppercase', letterSpacing: '.05em' } }, 'Generator Perangkat Mengajar')),
        h('h1', null, 'Sembilan dokumen perangkat, satu alur kerja.'), h('ul', { style: { paddingLeft: '18px', margin: 0, lineHeight: 1.6 } }, ['RPE, CP-TP-ATP, Prota, Promes, KKTP, RPM, Asesmen, Jurnal', 'AI menulis teks, kode menghitung angka', 'Keluaran Word (.docx) siap cetak', 'Kunci Gemini milik Anda sendiri'].map(function (t) { return h('li', null, t); }))),
      h('div', { class: 'box' }, h('div', { class: 'card accent' }, h('div', { class: 'bd stack' }, h('div', null, h('h2', null, judul), sub ? h('p', { class: 'muted', style: { margin: '4px 0 0' } }, sub) : null), isi)))));
  }
  function sandiInput(label, name, ac) {
    var i = G.input('', { type: 'password', name: name, ac: ac, max: 100 }), t = G.btn('', { ico: 'visibility', cls: 'sm ghost', title: 'Tampilkan / sembunyikan' }, function () { i.type = i.type === 'password' ? 'text' : 'password'; });
    return { el: G.field(label, h('div', { class: 'pwd' }, i, t)), i: i };
  }
  function kekuatan(v) { var s = 0; if (v.length >= 8) s++; if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++; return s; }
  G.sandiKuat = function (v) { return v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v); };
  function meter(inp) { var m = h('i', { style: { width: '0%' } }); inp.addEventListener('input', function () { var s = kekuatan(inp.value); m.style.width = (s * 25) + '%'; m.style.background = s < 3 ? '#B91C1C' : (s === 3 ? '#FACC15' : '#15803D'); }); return h('div', { class: 'meter', 'aria-hidden': 'true' }, m); }
  var PESAN_SANDI = 'Kata sandi minimal 8 karakter dengan huruf besar, huruf kecil, dan angka.';

  G.route('/masuk', function () {
    var em = G.input(G.store.get('email') || '', { type: 'email', name: 'email', ac: 'username', max: 120 }), sd = sandiInput('Kata sandi', 'sandi', 'current-password'), ing = h('input', { type: 'checkbox', id: 'ing', checked: true });
    var err = h('div', { class: 'errtxt', role: 'alert' });
    var kirim = G.btn('Masuk', { cls: 'pri' }, function () {
      err.textContent = ''; if (!em.value || !sd.i.value) { err.textContent = 'Email dan kata sandi wajib diisi.'; return; }
      return G.api('auth.masuk', { email: em.value.trim(), sandi: sd.i.value, ingat: ing.checked, perangkat: (navigator.userAgent || '').slice(0, 80) }).then(function (r) {
        if (!r.success) { err.textContent = r.message + (r.code === 'LOCKED' && r.data ? ' (' + Math.ceil(r.data.detik / 60) + ' menit)' : ''); return; }
        G.store.set('email', em.value.trim()); G.setSesi(r.data, ing.checked); G.go('#/');
      });
    });
    var form = h('form', { class: 'stack', onsubmit: function (e) { e.preventDefault(); kirim.click(); } }, G.field('Email', em), sd.el,
      h('label', { class: 'row', style: { gap: '8px' }, for: 'ing' }, ing, 'Ingat saya (30 hari di perangkat ini)'), err, kirim, h('div', { class: 'row between small' }, h('a', { href: '#/lupa' }, 'Lupa kata sandi?'), h('a', { href: '#/daftar' }, 'Daftar akun baru')));
    kerangka('Masuk', 'Selamat datang kembali, Bapak/Ibu Guru.', form); em.focus();
  }, { publik: true, tamuSaja: true });

  G.route('/daftar', function () {
    var nm = G.input('', { name: 'nama', ac: 'name', max: 100 }), em = G.input('', { type: 'email', name: 'email', ac: 'username', max: 120 }), s1 = sandiInput('Kata sandi', 'sandi', 'new-password'), s2 = sandiInput('Ulangi kata sandi', 'konf', 'new-password'), err = h('div', { class: 'errtxt', role: 'alert' });
    var kirim = G.btn('Buat akun', { cls: 'pri' }, function () {
      err.textContent = ''; if (nm.value.trim().length < 2) { err.textContent = 'Nama lengkap wajib diisi.'; return; } if (!G.sandiKuat(s1.i.value)) { err.textContent = PESAN_SANDI; return; } if (s1.i.value !== s2.i.value) { err.textContent = 'Konfirmasi kata sandi tidak sama.'; return; }
      return G.api('auth.daftar', { nama: nm.value.trim(), email: em.value.trim(), sandi: s1.i.value, konfirmasi: s2.i.value }).then(function (r) { if (!r.success) { err.textContent = r.message; return; } G.setSesi(r.data, false); G.toast('Akun dibuat. Lengkapi profil Anda.', 'ok'); G.go('#/profil'); });
    });
    kerangka('Daftar akun guru', 'Gratis. Anda memakai API key Gemini sendiri.', h('form', { class: 'stack', onsubmit: function (e) { e.preventDefault(); kirim.click(); } }, G.field('Nama lengkap', nm), G.field('Email', em), s1.el, meter(s1.i), h('div', { class: 'hint' }, PESAN_SANDI), s2.el, err, kirim, h('div', { class: 'small' }, 'Sudah punya akun? ', h('a', { href: '#/masuk' }, 'Masuk'))));
  }, { publik: true, tamuSaja: true });

  G.route('/lupa', function () {
    var em = G.input('', { type: 'email', ac: 'username' }), pesan = h('div', { role: 'status' }), sisa = 0, tmr = null;
    var kirim = G.btn('Kirim tautan reset', { cls: 'pri' }, function () {
      return G.api('auth.mintaReset', { email: em.value.trim() }).then(function (r) {
        G.clear(pesan).appendChild(h('div', { class: 'banner ' + (r.success ? 'ok' : 'warn') }, G.icon(r.success ? 'mark_email_read' : 'schedule'), r.message));
        var detik = r.success ? 60 : (r.data && r.data.detik) || 0; if (detik) { kirim.classList.add('off'); clearInterval(tmr); sisa = detik; kirim.lastChild.textContent = 'Kirim ulang (' + sisa + ')'; tmr = setInterval(function () { sisa--; if (sisa <= 0) { clearInterval(tmr); kirim.classList.remove('off'); kirim.lastChild.textContent = 'Kirim ulang'; } else kirim.lastChild.textContent = 'Kirim ulang (' + sisa + ')'; }, 1000); }
      });
    });
    kerangka('Lupa kata sandi', 'Masukkan email akun Anda. Tautan berlaku 30 menit dan hanya sekali pakai.', h('form', { class: 'stack', onsubmit: function (e) { e.preventDefault(); kirim.click(); } }, G.field('Email', em), kirim, pesan, h('a', { href: '#/masuk', class: 'small' }, '← Kembali ke Masuk')));
  }, { publik: true });

  G.route('/reset/:token', function (token) {
    var isi = h('div', null, G.skel(3));
    kerangka('Atur ulang kata sandi', null, isi);
    G.api('auth.cekReset', { token: token }).then(function (r) {
      G.clear(isi);
      if (!r.success) { isi.appendChild(h('div', { class: 'stack' }, h('div', { class: 'banner err' }, G.icon('error'), r.message), h('a', { class: 'btn', href: '#/lupa' }, 'Minta tautan baru'))); return; }
      var s1 = sandiInput('Kata sandi baru', 'baru', 'new-password'), s2 = sandiInput('Ulangi kata sandi', 'konf', 'new-password'), err = h('div', { class: 'errtxt', role: 'alert' });
      var kirim = G.btn('Simpan kata sandi', { cls: 'pri' }, function () { err.textContent = ''; if (!G.sandiKuat(s1.i.value)) { err.textContent = PESAN_SANDI; return; } if (s1.i.value !== s2.i.value) { err.textContent = 'Konfirmasi tidak sama.'; return; }
        return G.api('auth.setSandiBaru', { token: token, sandi: s1.i.value, konfirmasi: s2.i.value }).then(function (x) { if (!x.success) { err.textContent = x.message; return; } G.toast('Kata sandi diperbarui. Silakan masuk.', 'ok'); G.go('#/masuk'); }); });
      isi.appendChild(h('form', { class: 'stack', onsubmit: function (e) { e.preventDefault(); kirim.click(); } }, s1.el, meter(s1.i), s2.el, h('div', { class: 'hint' }, PESAN_SANDI), err, kirim));
    });
  }, { publik: true });
})();
