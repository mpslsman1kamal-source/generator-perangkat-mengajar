(function () {
  'use strict';
  var G = window.GPM, h = G.h;
  function buka(n, sub) {
    n = Number(n); if (!(n >= 1 && n <= 9)) { G.go('#/'); return; }
    var M = G.MENU[n], c = G.layout(n + '. ' + M[0], 'm' + n, M[2] === '#FACC15' ? '#A16207' : M[2]);
    var fn = G.pages['m' + n]; if (!fn) { c.appendChild(h('div', { class: 'empty' }, 'Halaman belum tersedia.')); return; }
    if (!G.S.boot) { c.appendChild(G.skel(5)); return G.segarBoot().then(function () { G.render(); }); }
    return fn(c, sub);
  }
  G.route('/m/:n', function (n) { return buka(n); });
  G.route('/m/:n/:sub', function (n, s) { return buka(n, s); });
  /** Pola umum: halaman dengan tab semester, data dari swr, render ulang saat berubah. */
  G.semHal = function (c, o) {
    var sem = G.store.get('sem', true) || '1', body = h('div', { class: 'stack' }), ctl = null;
    c.appendChild(G.pageHead(o.menu, o.judul, o.desk));
    var tabs = h('div'); c.appendChild(tabs); c.appendChild(body);
    function muat() {
      G.clear(tabs).appendChild(G.semTabs(sem, function (s) { sem = s; G.store.set('sem', s, true); muat(); }));
      if (ctl && ctl.stop) ctl.stop(); G.clear(body).appendChild(G.skel(5));
      var first = true;
      ctl = G.swr(o.aksi, { semester: sem }, function (d, dariCache, r) {
        if (!d) { G.clear(body).appendChild(h('div', { class: 'banner err' }, G.icon('error'), (r && r.message) || 'Gagal memuat.')); return; }
        o.render(body, d, sem, muat, dariCache);
      });
    }
    muat(); return { stop: function () { if (ctl && ctl.stop) ctl.stop(); } };
  };
  G.simpanBar = function (kiri, kanan) { return h('div', { class: 'row between', style: { marginTop: '14px' } }, h('div', { class: 'row' }, kiri), h('div', { class: 'row' }, kanan)); };
  G.ai = function (label, fn, cls) { return G.btn(label, { ico: 'auto_awesome', cls: cls || 'ink' }, fn); };
})();
