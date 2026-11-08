/* Inti: konfigurasi, API (fetch + cache SWR + idempotensi), UI helper, router */
(function () {
  'use strict';
  var G = window.GPM = { pages: {}, S: { token: '', boot: null }, MENU: {
    1: ['RPE', 'Rincian Pekan Efektif', '#2563EB', 'event_available'], 2: ['CP-TP-ATP', 'Capaian dan Alur Tujuan Pembelajaran', '#15803D', 'account_tree'],
    3: ['PROTA', 'Program Tahunan', '#FACC15', 'calendar_month'], 4: ['PROMES GANJIL', 'Program Semester Ganjil', '#C2410C', 'view_week'],
    5: ['PROMES GENAP', 'Program Semester Genap', '#0F766E', 'view_week'], 6: ['KKTP', 'Kriteria Ketercapaian Tujuan Pembelajaran', '#7C3AED', 'rule'],
    7: ['RPM / RPP', 'Rencana Pembelajaran Mendalam', '#3730A3', 'menu_book'], 8: ['ASESMEN', 'Asesmen Sumatif', '#B91C1C', 'quiz'], 9: ['JURNAL', 'Jurnal Mengajar Harian', '#BE185D', 'edit_note'] } };
  var CFG = window.GPM_CONFIG || {};

  /* ---------- Penyimpanan aman ---------- */
  var mem = {};
  G.store = {
    get: function (k, s) { try { var v = (s ? sessionStorage : localStorage).getItem('gpm_' + k); return v === null ? (mem[k] || null) : v; } catch (e) { return mem[k] || null; } },
    set: function (k, v, s) { mem[k] = v; try { (s ? sessionStorage : localStorage).setItem('gpm_' + k, v); } catch (e) { /* abaikan */ } },
    del: function (k) { delete mem[k]; try { localStorage.removeItem('gpm_' + k); sessionStorage.removeItem('gpm_' + k); } catch (e) { /* abaikan */ } }
  };

  /* ---------- DOM ---------- */
  G.h = function (tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v; else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v); else if (v === true) el.setAttribute(k, ''); else el.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) kid(el, arguments[i]);
    return el;
  };
  function kid(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { kid(el, x); }); else el.appendChild(c.nodeType ? c : document.createTextNode(String(c))); }
  var h = G.h;
  G.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  G.icon = function (n, cls) { return h('span', { class: 'material-symbols-outlined ' + (cls || ''), 'aria-hidden': 'true' }, n); };
  G.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  G.badge = function (st) { return h('span', { class: 'badge ' + st }, st); };
  G.skel = function (n) { var w = h('div', { class: 'stack s8' }); for (var i = 0; i < (n || 4); i++) w.appendChild(h('div', { class: 'skel', style: { height: (i === 0 ? 28 : 18) + 'px', width: (100 - i * 9) + '%' } })); return w; };
  G.btn = function (label, opt, fn) {
    opt = opt || {}; var b = h('button', { type: 'button', class: 'btn ' + (opt.cls || '') + (opt.ico && !label ? ' ico' : ''), title: opt.title || (opt.ico && !label ? opt.ico : null), 'aria-label': opt.title || label || opt.ico }, opt.ico ? G.icon(opt.ico) : null, label || null);
    if (fn) b.addEventListener('click', function (e) { if (b.classList.contains('load')) return; e.preventDefault(); var r = fn(e, b); if (r && r.then) { b.classList.add('load'); r.then(done, done); } function done() { b.classList.remove('load'); } });
    return b;
  };
  G.field = function (label, input, hint) { return h('div', { class: 'fld' }, h('label', null, label), input, hint ? h('div', { class: 'hint' }, hint) : null); };
  G.input = function (v, o) { o = o || {}; var el = h(o.area ? 'textarea' : 'input', { class: 'in', type: o.type || 'text', placeholder: o.ph || null, maxlength: o.max || null, inputmode: o.mode || null, autocomplete: o.ac || null, name: o.name || null, min: o.min, max: o.maxv, step: o.step, rows: o.rows || null }); el.value = v == null ? '' : v; if (o.on) el.addEventListener('input', function () { o.on(el.value, el); }); return el; };
  G.select = function (opts, v, on, cls) { var s = h('select', { class: 'in ' + (cls || '') }); opts.forEach(function (o) { var a = Array.isArray(o) ? o : [o, o]; var op = h('option', { value: a[0] }, a[1]); if (String(a[0]) === String(v)) op.selected = true; s.appendChild(op); }); if (on) s.addEventListener('change', function () { on(s.value, s); }); return s; };
  G.validasi = function (list) { return h('div', { class: 'val' }, (list || []).map(function (v) { return h('div', { class: v.level }, G.icon(v.level === 'ok' ? 'check_circle' : (v.level === 'warn' ? 'warning' : 'error')), h('span', null, v.pesan)); })); };
  G.nilaiNum = function (v) { var n = Number(v); return isNaN(n) ? 0 : n; };

  /* ---------- Toast / modal ---------- */
  G.toast = function (msg, tipe) {
    var box = document.getElementById('toasts') || document.body.appendChild(h('div', { id: 'toasts', role: 'status', 'aria-live': 'polite' }));
    var t = h('div', { class: 'toast ' + (tipe || '') }, msg); box.appendChild(t); setTimeout(function () { t.remove(); }, tipe === 'err' ? 6500 : 3200);
  };
  G.modal = function (judul, isi, o) {
    o = o || {}; var bg = h('div', { class: 'modal-bg', role: 'dialog', 'aria-modal': 'true', 'aria-label': judul });
    function tutup() { bg.remove(); document.removeEventListener('keydown', esc); if (o.onClose) o.onClose(); }
    function esc(e) { if (e.key === 'Escape') tutup(); } document.addEventListener('keydown', esc);
    var m = h('div', { class: 'modal ' + (o.wide ? 'wide' : '') }, h('div', { class: 'hd' }, h('h3', null, judul), G.btn('', { ico: 'close', cls: 'sm', title: 'Tutup' }, tutup)), h('div', { class: 'bd' }, isi), o.foot ? h('div', { class: 'ft' }, typeof o.foot === 'function' ? o.foot(tutup) : o.foot) : null);
    bg.appendChild(m); bg.addEventListener('mousedown', function (e) { if (e.target === bg && !o.keep) tutup(); }); document.body.appendChild(bg); return { close: tutup, el: m };
  };
  G.konfirm = function (judul, teks, okLabel, fn, bahaya) {
    G.modal(judul, h('p', { style: { margin: 0 } }, teks), { foot: function (tutup) { return [G.btn('Batal', {}, tutup), G.btn(okLabel || 'Ya, lanjut', { cls: bahaya ? 'dng' : 'pri' }, function () { tutup(); return fn(); })]; } });
  };

  /* ---------- API ---------- */
  var cache = {}, uidN = 0;
  function rid() { return Date.now().toString(36) + (++uidN) + Math.random().toString(36).slice(2, 8); }
  function key(a, d) { return a + '|' + JSON.stringify(d || {}); }
  var AKSI_LAMBAT = /^(rpe\.baca|cp\.ekstrak|tp\.generate|atp\.susun|kktp\.|rpm\.(generate|sunting)|asesmen\.(generate|regenerate)|jurnal\.refleksi|rpe\.analisis|api\.(uji|models|otomatis)|ekspor\.dokumen|auth\.)/;
  G.api = function (action, data, o) {
    o = o || {};
    var url = CFG.GAS_URL;
    if (!url || /GANTI/.test(url)) return Promise.resolve({ success: false, message: 'Alamat API belum diatur. Isi js/config.js.' });
    var body = { action: action, data: data || {}, token: G.S.token, reqId: rid() }, tmo = o.timeout || (AKSI_LAMBAT.test(action) ? 150000 : 30000), t0 = Date.now();
    function once(n) {
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, tmo);
      return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined, redirect: 'follow' })
        .then(function (r) { clearTimeout(tm); return r.json(); })
        .catch(function (e) { clearTimeout(tm); if (n < 1 && !o.noRetry) return new Promise(function (ok) { setTimeout(ok, 600); }).then(function () { return once(n + 1); }); return { success: false, message: e && e.name === 'AbortError' ? 'Server terlalu lama menjawab. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa internet Anda.', code: 'NET' }; });
    }
    return once(0).then(function (res) {
      res.ms = Date.now() - t0; G.perf = { aksi: action, ms: res.ms, server: res.ms_server || res.ms };
      if (res && res.code === 'AUTH' && G.S.token) { G.keluarLokal(); G.toast('Sesi berakhir. Silakan masuk kembali.', 'err'); location.hash = '#/masuk'; }
      return res;
    });
  };
  /** Stale-while-revalidate: tampilkan cache seketika, lalu segarkan. cb(data, dariCache). */
  G.swr = function (action, data, cb, o) {
    var k = key(action, data), c = cache[k], dead = false;
    if (c) cb(c, true);
    var p = G.api(action, data, o).then(function (r) {
      if (dead) return r;
      if (r.success) { cache[k] = r.data; cb(r.data, false); } else if (!c) cb(null, false, r);
      return r;
    });
    p.stop = function () { dead = true; }; return p;
  };
  G.invalidate = function (prefix) { Object.keys(cache).forEach(function (k) { if (!prefix || k.indexOf(prefix) === 0) delete cache[k]; }); };
  /** Tulis: panggil API; sukses → toast + invalidasi cache terkait. */
  G.tulis = function (action, data, o) {
    o = o || {};
    return G.api(action, data, o).then(function (r) {
      if (r.success) { G.invalidate(); if (o.toast !== false && r.message) G.toast(r.message, 'ok'); if (o.boot !== false) G.segarBoot(); } else G.toast(r.message || 'Gagal.', 'err');
      return r;
    });
  };
  G.segarBoot = function () { return G.api('boot', {}).then(function (r) { if (r.success) { G.S.boot = r.data; if (G.refreshShell) G.refreshShell(); } return r; }); };

  /* ---------- Sesi ---------- */
  G.setSesi = function (res, ingat) {
    G.S.token = res.token; G.S.boot = res.boot; G.store.set('tok', res.token, true);
    if (ingat && res.rememberToken) G.store.set('rem', res.rememberToken);
  };
  G.keluarLokal = function () { G.S.token = ''; G.S.boot = null; cache = {}; G.store.del('tok'); };
  G.keluar = function () { var rem = G.store.get('rem'); G.api('auth.keluar', { rememberToken: rem }).then(function () { }); G.store.del('rem'); G.keluarLokal(); location.hash = '#/masuk'; };

  /* ---------- Unduh ---------- */
  G.unduhB64 = function (nama, mime, b64) {
    var bin = atob(b64), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    var url = URL.createObjectURL(new Blob([a], { type: mime })), l = h('a', { href: url, download: nama }); document.body.appendChild(l); l.click(); setTimeout(function () { l.remove(); URL.revokeObjectURL(url); }, 1500);
  };
  G.bacaBerkas = function (file) { return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1] || ''); }; r.onerror = no; r.readAsDataURL(file); }); };

  /* ---------- Router ---------- */
  var cur = null;
  G.route = function (pola, fn, opt) { (G._rt = G._rt || []).push({ re: new RegExp('^' + pola.replace(/:\w+/g, '([^/]+)') + '$'), fn: fn, opt: opt || {} }); };
  G.go = function (hash) { if (location.hash === hash) G.render(); else location.hash = hash; };
  G.render = function () {
    var path = (location.hash || '#/').slice(1) || '/'; if (path.charAt(0) !== '/') path = '/' + path;
    var q = path.indexOf('?'); if (q >= 0) path = path.slice(0, q);
    for (var i = 0; i < G._rt.length; i++) {
      var m = G._rt[i].re.exec(path);
      if (m) {
        var r = G._rt[i];
        if (!r.opt.publik && !G.S.token) { location.hash = '#/masuk'; return; }
        if (r.opt.publik && G.S.token && r.opt.tamuSaja) { location.hash = '#/'; return; }
        if (cur && cur.stop) try { cur.stop(); } catch (e) { /* abaikan */ }
        cur = null; var res = r.fn.apply(null, m.slice(1).map(decodeURIComponent)); cur = res || null; window.scrollTo(0, 0); return;
      }
    }
    location.hash = '#/';
  };
  window.addEventListener('hashchange', function () { G.render(); });
})();
