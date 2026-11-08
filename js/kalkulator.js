// ============================================================
// Kalkulator.gs — FUNGSI MURNI (tanpa layanan GAS), bisa diuji di Node.
// Prinsip PRD: "AI menyusun isi, kode menghitung angka."
// ============================================================

var NAMA_BULAN_ = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var NAMA_HARI_ = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function pad2_(n) { return (n < 10 ? '0' : '') + n; }
function isoDate_(d) { return d.getFullYear() + '-' + pad2_(d.getMonth() + 1) + '-' + pad2_(d.getDate()); }
function parseIso_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
function addDays_(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function tglIndo_(s) {
  var d = typeof s === 'string' ? parseIso_(s) : s;
  return d ? d.getDate() + ' ' + NAMA_BULAN_[d.getMonth()] + ' ' + d.getFullYear() : '';
}
function bulatDua_(x) { return Math.round((Number(x) || 0) * 100) / 100; }

/** Awalan kode TP dari kelas: "XI" → 11, "X" → 10, "XII" → 12, "7" → 7. */
function awalanDariKelas_(kelas) {
  var k = String(kelas || '').trim().toUpperCase();
  var romawi = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 };
  if (romawi[k]) return String(romawi[k]);
  var n = parseInt(k, 10);
  return isNaN(n) ? '' : String(n);
}

/** Tahun awal dari "2026/2027" → 2026. */
function tahunMulai_(tp) {
  var m = /(\d{4})/.exec(String(tp || ''));
  return m ? Number(m[1]) : new Date().getFullYear();
}

// ---------------- RPE ----------------
/**
 * o: {tahunMulai, semester(1|2), hariSekolah(5|6), mode(1|2|3), jpPerPekan, kegiatan:[{nama_kegiatan,mulai,selesai,kategori,mengurangi_efektif}]}
 * Pekan = Senin (atau Senin–Sabtu). Pekan yang melintasi bulan dihitung ke bulan hari Senin (FR-1-07).
 */
function hitungRpe_(o) {
  var hari = Number(o.hariSekolah) === 6 ? 6 : 5;
  var mode = [1, 2, 3].indexOf(Number(o.mode)) >= 0 ? Number(o.mode) : 1;
  var jp = Number(o.jpPerPekan) || 0;
  var sem = Number(o.semester) === 2 ? 2 : 1;
  var Y = Number(o.tahunMulai);
  var bulanList = sem === 1 ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6];
  var tahunBln = sem === 1 ? Y : Y + 1;
  var awal = new Date(tahunBln, bulanList[0] - 1, 1);
  var akhir = new Date(tahunBln, bulanList[5], 0);

  var keg = (o.kegiatan || []).map(function (k) {
    var tr = k.mengurangi_efektif === true || String(k.mengurangi_efektif).toLowerCase() === 'ya' || String(k.mengurangi_efektif).toLowerCase() === 'true';
    return { nama: k.nama_kegiatan || k.nama || '', m: parseIso_(k.mulai), s: parseIso_(k.selesai || k.mulai), kurang: tr };
  }).filter(function (k) { return k.m && k.s; });

  var d = new Date(awal);
  while (d.getDay() !== 1) d = addDays_(d, 1);
  var pekan = [], no = 0;
  for (; d <= akhir; d = addDays_(d, 7)) {
    no++;
    var libur = 0, ket = [];
    for (var i = 0; i < hari; i++) {
      var hr = addDays_(d, i);
      if (keg.some(function (k) { return k.kurang && hr >= k.m && hr <= k.s; })) libur++;
    }
    var minggu = addDays_(d, 6);
    keg.forEach(function (k) { if (k.m <= minggu && k.s >= d && k.nama && ket.indexOf(k.nama) < 0) ket.push(k.nama); });
    var hariEf = hari - libur;
    var nilai = mode === 3 ? hariEf / hari : (mode === 2 ? (libur * 2 > hari ? 0 : 1) : (hariEf > 0 ? 1 : 0));
    pekan.push({
      no_pekan: no, tanggal_senin: isoDate_(d), bulan: d.getMonth() + 1,
      hari_efektif: hariEf, nilai: bulatDua_(nilai),
      status: nilai > 0 ? 'efektif' : 'tidak', keterangan: ket.join('; ')
    });
  }

  var rekap = bulanList.map(function (b) {
    var p = pekan.filter(function (x) { return x.bulan === b; });
    var ef = bulatDua_(p.reduce(function (a, x) { return a + x.nilai; }, 0));
    return {
      bulan: b, nama_bulan: NAMA_BULAN_[b - 1], jumlah_pekan: p.length, pekan_efektif: ef,
      pekan_tidak_efektif: bulatDua_(p.length - ef),
      hari_efektif: p.reduce(function (a, x) { return a + x.hari_efektif; }, 0),
      keterangan: p.map(function (x) { return x.keterangan; }).filter(String).join('; '),
      jp_per_pekan: jp, jam_efektif: bulatDua_(ef * jp)
    };
  });
  var total = {
    jumlah_pekan: pekan.length,
    pekan_efektif: bulatDua_(rekap.reduce(function (a, r) { return a + r.pekan_efektif; }, 0)),
    pekan_tidak_efektif: bulatDua_(rekap.reduce(function (a, r) { return a + r.pekan_tidak_efektif; }, 0)),
    hari_efektif: rekap.reduce(function (a, r) { return a + r.hari_efektif; }, 0),
    jp_per_pekan: jp
  };
  total.jam_efektif = bulatDua_(total.pekan_efektif * jp);

  // Validator (FR-1-10)
  var val = [];
  var jml = rekap.reduce(function (a, r) { return a + r.jumlah_pekan; }, 0);
  val.push(jml === total.jumlah_pekan ? { level: 'ok', pesan: 'Total pekan per bulan sama dengan total semester (' + jml + ').' }
    : { level: 'err', pesan: 'Total pekan per bulan (' + jml + ') berbeda dari total semester (' + total.jumlah_pekan + ').' });
  var luar = keg.filter(function (k) { return k.s < awal || k.m > akhir; });
  val.push(luar.length ? { level: 'warn', pesan: luar.length + ' kegiatan berada di luar rentang semester: ' + luar.map(function (k) { return k.nama; }).join(', ') + '.' }
    : { level: 'ok', pesan: 'Semua kegiatan berada dalam rentang semester.' });
  var adaAsesmen = keg.some(function (k) { return /\b(PTS|STS|ASTS|PAS|SAS|ASAS|SAT|PAT|ASAT)\b|sumatif|penilaian (tengah|akhir)/i.test(k.nama); });
  val.push(adaAsesmen ? { level: 'ok', pesan: 'Tanggal PTS/PAS terdeteksi di daftar kegiatan.' }
    : { level: 'warn', pesan: 'Tanggal PTS/PAS belum ada di daftar kegiatan.' });
  return { pekan: pekan, rekap: rekap, total: total, validasi: val };
}

// ---------------- Kuota TP / Prota ----------------
/** Metode sisa terbesar. Total tepat; minimal 1 per bab bila total >= jumlah bab. */
function bagiKuota_(total, bobot) {
  var n = bobot.length;
  if (!n) return [];
  total = Math.max(0, Math.round(Number(total) || 0));
  var w = bobot.map(function (b) { b = Number(b); return b > 0 ? b : 1; });
  var s = w.reduce(function (a, b) { return a + b; }, 0);
  var raw = w.map(function (x) { return total * x / s; });
  var base = raw.map(Math.floor);
  var sisa = total - base.reduce(function (a, b) { return a + b; }, 0);
  var urut = raw.map(function (r, i) { return { i: i, f: r - Math.floor(r) }; }).sort(function (a, b) { return b.f - a.f || a.i - b.i; });
  for (var k = 0; k < sisa; k++) base[urut[k % n].i]++;
  if (total >= n) {
    for (var i = 0; i < n; i++) {
      if (base[i] === 0) {
        var mx = 0;
        for (var j = 1; j < n; j++) if (base[j] > base[mx]) mx = j;
        if (base[mx] > 1) { base[mx]--; base[i]++; }
      }
    }
  }
  return base;
}

/** FR-2-04: total TP = (pekan efektif × tatap muka/minggu) − jumlah bab (− pertemuan PTS/PAS/cadangan bila opsi). */
function hitungKuotaTP_(o) {
  var pekan = Math.floor(Number(o.pekanEfektif) || 0);
  var tm = Number(o.tatapMuka) || 0;
  var bab = o.bobot || [];
  var kurang = o.kurangiNonReguler ? (Number(o.pertemuanNonReguler) || 0) : 0;
  var total = Math.max(0, pekan * tm - bab.length - kurang);
  return { total: total, perBab: bagiKuota_(total, bab), pertemuan: pekan * tm };
}

/** Prota per semester. babs:[{no_bab,nama_bab,jumlahTP}] */
function hitungProta_(o) {
  var babs = o.babs || [];
  var sum = Number(o.jpSumatif); if (isNaN(sum)) sum = 2;
  var cad = Number(o.jpCadangan) || 0;
  var total = Number(o.totalJP) || 0;
  var materi = total - cad - sum * babs.length;
  var warn = [];
  if (materi < 0) { warn.push('JP tidak cukup untuk sumatif dan cadangan; kurangi JP sumatif/cadangan.'); materi = 0; }
  var bagi = bagiKuota_(materi, babs.map(function (b) { return Number(b.jumlahTP) || 1; }));
  var rows = [];
  babs.forEach(function (b, i) {
    rows.push({ jenis: 'materi', no_bab: b.no_bab, materi: 'Bab ' + b.no_bab + ' — ' + b.nama_bab, jp: bagi[i], semester: String(o.semester) });
    if (sum > 0) rows.push({ jenis: 'sumatif', no_bab: b.no_bab, materi: 'Asesmen Sumatif Bab ' + b.no_bab, jp: sum, semester: String(o.semester) });
  });
  if (cad > 0) rows.push({ jenis: 'cadangan', no_bab: '', materi: 'Cadangan, Pengayaan, dan Remedial', jp: cad, semester: String(o.semester) });
  rows.forEach(function (r, i) { r.no_urut = i + 1; });
  return { rows: rows, warn: warn, total: rows.reduce(function (a, r) { return a + r.jp; }, 0), target: total };
}

// ---------------- Promes ----------------
function jpPerPolaPekan_(pola) { return pola === '3+2' ? 5 : (pola === '2x2' ? 4 : (Number(pola) || 4)); }
function pertemuanPola_(jpMinggu, pola) {
  jpMinggu = Number(jpMinggu) || 0;
  if (jpMinggu <= 0) return [];
  if (pola === '2x2' && jpMinggu === 4) return [2, 2];
  if (pola === '3+2' && jpMinggu === 5) return [3, 2];
  var out = [], sisa = jpMinggu;
  while (sisa > 0) { var t = sisa > 3 ? 2 : sisa; if (sisa - t === 1) t = sisa; out.push(t); sisa -= t; }
  return out;
}

/**
 * items:[{jp}] berurutan; kapasitas:[JP tersedia tiap pekan efektif]
 * Hasil: matriks tiap item → array JP per pekan (panjang = kapasitas.length), plus sisa yang tidak tertampung.
 */
function distribusiPromes_(items, kapasitas) {
  var rem = kapasitas.map(Number), w = 0, sisaTotal = 0;
  var matriks = items.map(function (it) {
    var row = kapasitas.map(function () { return 0; });
    var need = Math.max(0, Math.round(Number(it.jp) || 0));
    while (need > 0 && w < rem.length) {
      if (rem[w] <= 0) { w++; continue; }
      var t = Math.min(need, rem[w]);
      row[w] += t; rem[w] -= t; need -= t;
      if (rem[w] <= 0) w++;
    }
    sisaTotal += need;
    return row;
  });
  return { matriks: matriks, sisa: sisaTotal, kosong: rem.reduce(function (a, b) { return a + b; }, 0) };
}

/** Validator promes: tidak melebihi kapasitas per pekan, total per baris sama dengan alokasi. */
function validasiPromes_(rows, kapasitas) {
  var out = [], over = [], salah = [];
  kapasitas.forEach(function (c, w) {
    var s = rows.reduce(function (a, r) { return a + (Number((r.jp_minggu || [])[w]) || 0); }, 0);
    if (s > c) over.push('M' + (w + 1));
  });
  rows.forEach(function (r) {
    var s = (r.jp_minggu || []).reduce(function (a, b) { return a + (Number(b) || 0); }, 0);
    if (Number(r.jp_total) !== s) salah.push(r.label || r.kode_tp || r.baris);
  });
  out.push(over.length ? { level: 'err', pesan: 'Melebihi alokasi pada ' + over.join(', ') + '.' } : { level: 'ok', pesan: 'Tidak ada minggu yang melebihi alokasi JP.' });
  out.push(salah.length ? { level: 'err', pesan: 'JP baris tidak sama dengan alokasi: ' + salah.slice(0, 5).join(', ') + '.' } : { level: 'ok', pesan: 'Total JP tiap baris sama dengan alokasi.' });
  return out;
}

// ---------------- Jurnal ----------------
/**
 * o: {pekan:[{tanggal_senin, nilai}] hanya pekan efektif berurutan, rows:[{baris,kode_tp,teks_tp,bab,materi,penilaian,jp_minggu[]}],
 *     kegiatan:[{mulai,selesai,mengurangi_efektif}], hariMengajar:[2,4], pola:'2x2'|'3+2'}
 * Hasil: pertemuan berurutan dengan tanggal yang melewati hari libur.
 */
function bangunJurnal_(o) {
  var keg = (o.kegiatan || []).map(function (k) {
    var tr = k.mengurangi_efektif === true || /^(ya|true)$/i.test(String(k.mengurangi_efektif));
    return { m: parseIso_(k.mulai), s: parseIso_(k.selesai || k.mulai), kurang: tr };
  }).filter(function (k) { return k.m && k.s && k.kurang; });
  function libur(d) { return keg.some(function (k) { return d >= k.m && d <= k.s; }); }
  var hariAjar = (o.hariMengajar && o.hariMengajar.length ? o.hariMengajar : [2, 4]).map(Number);
  var out = [], ke = 0;
  (o.pekan || []).forEach(function (p, w) {
    var senin = parseIso_(p.tanggal_senin);
    if (!senin) return;
    var slot = [];
    (o.rows || []).forEach(function (r, idx) {
      var n = Number((r.jp_minggu || [])[w]) || 0;
      for (var i = 0; i < n; i++) slot.push(idx);
    });
    if (!slot.length) return;
    var potong = pertemuanPola_(slot.length, o.pola), pos = 0, terpakai = [];
    potong.forEach(function (jp, k) {
      var chunk = slot.slice(pos, pos + jp); pos += jp;
      var freq = {}; chunk.forEach(function (x) { freq[x] = (freq[x] || 0) + 1; });
      var utama = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a] || a - b; })[0];
      var r = o.rows[Number(utama)];
      var hr = hariAjar[Math.min(k, hariAjar.length - 1)], tgl = null, catatan = '';
      for (var off = 0; off < 7; off++) {
        var hariKe = ((hr - 1 + off) % 7) + 1; // 1=Senin..7
        var cand = addDays_(senin, hariKe - 1);
        if (hariKe > 6) continue;
        if (terpakai.indexOf(isoDate_(cand)) >= 0 && off === 0 && k > 0) { /* hari sama sudah dipakai: lanjut */ }
        if (!libur(cand) && terpakai.indexOf(isoDate_(cand)) < 0) { tgl = cand; if (off > 0) catatan = 'Digeser dari hari yang libur.'; break; }
      }
      if (!tgl) { tgl = addDays_(senin, hr - 1); catatan = 'Tidak ada hari efektif; periksa kalender.'; }
      terpakai.push(isoDate_(tgl));
      ke++;
      out.push({
        pertemuan_ke: ke, tanggal: isoDate_(tgl), hari: NAMA_HARI_[tgl.getDay()], jp: jp, pekan: w + 1,
        baris: r.baris, bab: r.bab || '', kode_atp: r.kode_tp || '', teks_tp: r.teks_tp || '',
        materi_pokok: r.materi || '', penilaian: r.penilaian || '', catatan: catatan
      });
    });
  });
  return out;
}

// ---------------- Asesmen ----------------
var BENTUK_SOAL_ = ['PG', 'PGK', 'BS', 'MJ', 'IS', 'UR'];
var NAMA_BENTUK_ = { PG: 'Pilihan Ganda', PGK: 'Pilihan Ganda Kompleks', BS: 'Benar-Salah', MJ: 'Menjodohkan', IS: 'Isian Singkat', UR: 'Uraian' };
var BOBOT_BAWAAN_ = { PG: 1, PGK: 2, BS: 1.5, MJ: 1.5, IS: 2, UR: 6 };
var PRESET_ASESMEN_ = {
  TS: { PG: 10, PGK: 5, BS: 5, MJ: 0, IS: 5, UR: 5 },
  AB: { PG: 10, PGK: 5, BS: 5, MJ: 5, IS: 5, UR: 2 }
};

/** Skor total tepat 100. jumlah:{PG:10,...}; bobot (opsional, total per bentuk). Mengembalikan skor per butir per bentuk. */
function hitungSkor_(jumlah, bobot) {
  var bentuk = BENTUK_SOAL_.filter(function (b) { return Number(jumlah[b]) > 0; });
  var tot;
  if (bobot) {
    var ada = bentuk.map(function (b) { return Number(bobot[b]) || 0; });
    tot = bagiKuota_(100, ada.map(function (x) { return x || 1; }));
  } else {
    tot = bagiKuota_(100, bentuk.map(function (b) { return Number(jumlah[b]) * BOBOT_BAWAAN_[b]; }));
  }
  var perButir = {}, totalBentuk = {};
  bentuk.forEach(function (b, i) {
    var n = Number(jumlah[b]), B = tot[i], arr = [], acc = 0;
    for (var k = 0; k < n; k++) {
      var s = k === n - 1 ? bulatDua_(B - acc) : bulatDua_(B / n);
      arr.push(s); acc = bulatDua_(acc + s);
    }
    perButir[b] = arr; totalBentuk[b] = B;
  });
  var all = 0; bentuk.forEach(function (b) { all = bulatDua_(all + totalBentuk[b]); });
  return { perButir: perButir, totalBentuk: totalBentuk, total: all };
}

function normaPenilaian_(ambang) {
  var a = Number(ambang) || 61;
  return [
    { rentang: '0 – 40', predikat: 'Kurang', keterangan: 'Belum tuntas' },
    { rentang: '41 – ' + (a - 1), predikat: 'Cukup', keterangan: 'Belum tuntas' },
    { rentang: a + ' – 80', predikat: 'Baik', keterangan: 'Tuntas' },
    { rentang: '81 – 100', predikat: 'Amat Baik', keterangan: 'Tuntas' }
  ];
}

function acakUrut_(arr, seed) {
  var a = arr.slice(), s = Number(seed) || 7;
  for (var i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    var j = s % (i + 1);
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// ---------------- Pemeriksa kualitas CP-TP-ATP ----------------
function cekCpTpAtp_(o) {
  var out = [];
  var tp = o.tp || [], cp = o.cp || [];
  out.push(tp.length === Number(o.kuota) ? { level: 'ok', pesan: 'Total TP (' + tp.length + ') sama dengan kuota.' } : { level: 'err', pesan: 'Total TP ' + tp.length + ' ≠ kuota ' + o.kuota + '.' });
  var elTp = {}; tp.forEach(function (t) { elTp[String(t.elemen).toLowerCase()] = true; });
  var tanpa = cp.filter(function (c) { return !elTp[String(c.elemen).toLowerCase()]; }).map(function (c) { return c.elemen; });
  out.push(tanpa.length ? { level: 'err', pesan: 'Elemen tanpa TP: ' + tanpa.join(', ') + '.' } : { level: 'ok', pesan: 'Setiap elemen CP memiliki minimal satu TP.' });
  var tak = tp.filter(function (t) { return !(t.a && t.b && t.c && t.d); });
  out.push(tak.length ? { level: 'warn', pesan: tak.length + ' TP belum memuat unsur A-B-C-D lengkap.' } : { level: 'ok', pesan: 'Semua TP memuat A-B-C-D.' });
  var kosJus = (o.atp || []).filter(function (a) { return !String(a.justifikasi || '').trim(); });
  out.push(kosJus.length ? { level: 'warn', pesan: kosJus.length + ' ATP belum memiliki justifikasi.' } : { level: 'ok', pesan: 'Justifikasi pengurutan terisi.' });
  var kodeOk = true, per = {};
  (o.atp || []).forEach(function (a) {
    var m = /^(\d+)\.(\d+)\.(\d+)$/.exec(a.kode_atp || '');
    if (!m) { kodeOk = false; return; }
    per[m[2]] = per[m[2]] || [];
    per[m[2]].push(Number(m[3]));
  });
  Object.keys(per).forEach(function (b) { per[b].sort(function (x, y) { return x - y; }); per[b].forEach(function (v, i) { if (v !== i + 1) kodeOk = false; }); });
  out.push(kodeOk ? { level: 'ok', pesan: 'Kode ATP berurutan.' } : { level: 'err', pesan: 'Kode ATP tidak berurutan.' });
  return out;
}

/** Kode ATP oleh kode (FR-2-09): {awalan}.{no bab}.{urutan dalam bab}. urut = array TP berurutan per bab. */
function beriKodeAtp_(awalan, tpUrut) {
  var cnt = {};
  return tpUrut.map(function (t, i) {
    var b = String(t.no_bab);
    cnt[b] = (cnt[b] || 0) + 1;
    return { id_tp: t.id_tp, no_urut: i + 1, kode_atp: awalan + '.' + b + '.' + cnt[b], urutan_bab: cnt[b] };
  });
}
