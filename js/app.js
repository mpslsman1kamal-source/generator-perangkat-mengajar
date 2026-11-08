(function () {
  'use strict';
  var G = window.GPM;
  var asli = G.segarBoot;
  G.segarBoot = function () { return asli().then(function (r) { if (r && r.success) { try { sessionStorage.setItem('gpm_boot', JSON.stringify(r.data)); } catch (e) { /* abaikan */ } } return r; }); };

  function mulai() {
    var tok = G.store.get('tok', true), rem = G.store.get('rem');
    var boot = null; try { boot = JSON.parse(sessionStorage.getItem('gpm_boot') || 'null'); } catch (e) { /* abaikan */ }
    if (tok) { G.S.token = tok; G.S.boot = boot; G.render(); if (!boot) G.segarBoot(); return; }
    if (rem) {
      document.getElementById('app').appendChild(G.h('div', { style: { padding: '40px' } }, G.skel(4)));
      G.api('auth.pulih', { token: rem }).then(function (r) { if (r.success) { G.setSesi(r.data, false); if (!location.hash || /^#\/(masuk|daftar)/.test(location.hash)) location.hash = '#/'; } else G.store.del('rem'); G.render(); });
      return;
    }
    if (!location.hash) location.hash = '#/masuk'; G.render();
  }
  // Pemanasan server (mengurangi cold start) — tanpa membaca respons
  try { if (window.GPM_CONFIG && window.GPM_CONFIG.GAS_URL && !/GANTI/.test(window.GPM_CONFIG.GAS_URL)) fetch(window.GPM_CONFIG.GAS_URL + '?w=1', { mode: 'no-cors' }); } catch (e) { /* abaikan */ }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
