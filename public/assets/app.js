// SNFI — carousel, penghitung angka, filter katalog. Tanpa library.
(function () {
  var kurangGerak = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- carousel: panah + auto-scroll (hanya yang bertanda data-auto) ---
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var el = rail.querySelector('.carousel');
    var prev = rail.querySelector('[data-prev]');
    var next = rail.querySelector('[data-next]');
    var langkah = function () { return Math.max(el.clientWidth * 0.8, 200); };
    if (prev) prev.onclick = function () { el.scrollBy({ left: -langkah(), behavior: 'smooth' }); };
    if (next) next.onclick = function () { el.scrollBy({ left: langkah(), behavior: 'smooth' }); };

    if (!el.hasAttribute('data-auto') || kurangGerak) return;
    var timer = setInterval(function () {
      if (document.hidden) return;
      var habis = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: habis ? 0 : el.scrollLeft + 192, behavior: 'smooth' });
    }, 3200);
    var stop = function () { clearInterval(timer); };
    el.addEventListener('mouseenter', stop);
    el.addEventListener('focusin', stop);
    el.addEventListener('pointerdown', stop);
  });

  // --- angka menghitung naik ---
  document.querySelectorAll('[data-hitung]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-hitung'));
    var akhir = el.textContent;
    if (kurangGerak) return;
    var mulai = null, durasi = 1200;
    el.textContent = '0';
    requestAnimationFrame(function step(t) {
      if (mulai === null) mulai = t;
      var p = Math.min((t - mulai) / durasi, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? Math.round(target * e).toString() : akhir;
      if (p < 1) requestAnimationFrame(step);
    });
  });

  // --- seksi & isinya muncul berurutan saat digulir ---
  if (!kurangGerak && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (masuk, obs) {
      masuk.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.__anak.forEach(function (el, i) {
          el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
          el.classList.add('is-in');
        });
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('main .section').forEach(function (sec) {
      var wadah = sec.querySelector('.inner') || sec;
      var anak = Array.prototype.slice.call(wadah.children);
      if (!anak.length) anak = [sec];
      anak.forEach(function (el) { el.classList.add('will-reveal'); });
      sec.__anak = anak;
      io.observe(sec);
    });
  }

  // --- kartu muncul berurutan saat halaman dimuat ---
  if (!kurangGerak) {
    document.querySelectorAll('.grid > .card').forEach(function (kartu, i) {
      if (i > 11) return;
      kartu.style.animationDelay = i * 45 + 'ms';
      kartu.classList.add('reveal');
    });
  }

  // --- filter + pencarian + paginasi katalog ---
  var katalog = document.querySelector('[data-katalog]');
  if (!katalog) return;
  var kartu = Array.prototype.slice.call(katalog.querySelectorAll('.card'));
  var cari = document.querySelector('[data-cari]');
  var tombol = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  var hitung = document.querySelector('[data-jumlah]');
  var pager = document.querySelector('[data-pager]');
  var PER = 12;                        // kartu per halaman
  var kategori = '';
  var kunci = '';
  var halaman = 1;

  function terapkan() {
    var cocok = kartu.filter(function (k) {
      return (!kategori || k.dataset.kategori === kategori) &&
             (!kunci || k.dataset.cari.indexOf(kunci) > -1);
    });
    var maks = Math.max(1, Math.ceil(cocok.length / PER));
    if (halaman > maks) halaman = maks;
    var mulai = (halaman - 1) * PER;
    kartu.forEach(function (k) { k.hidden = true; });
    cocok.forEach(function (k, i) { k.hidden = i < mulai || i >= mulai + PER; });
    if (hitung) hitung.textContent = hitung.dataset.pola.replace('{n}', cocok.length);
    tombol.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.kategori === kategori));
    });
    gambarPager(maks);
    syncUrl();
  }

  function syncUrl() {
    var u = new URL(location.href);
    kategori ? u.searchParams.set('kategori', kategori) : u.searchParams.delete('kategori');
    kunci ? u.searchParams.set('q', kunci) : u.searchParams.delete('q');
    halaman > 1 ? u.searchParams.set('hal', halaman) : u.searchParams.delete('hal');
    history.replaceState(null, '', u);
  }

  function loncat() {
    var y = katalog.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: kurangGerak ? 'auto' : 'smooth' });
  }

  function gambarPager(maks) {
    if (!pager) return;
    pager.textContent = '';
    if (maks <= 1) { pager.hidden = true; return; }
    pager.hidden = false;
    var tbl = function (label, hal, opsi) {
      opsi = opsi || {};
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (opsi.aria) b.setAttribute('aria-label', opsi.aria);
      if (opsi.aktif) b.setAttribute('aria-current', 'page');
      if (opsi.mati) b.disabled = true;
      else b.onclick = function () { halaman = hal; terapkan(); loncat(); };
      pager.appendChild(b);
    };
    var gap = function () {
      var s = document.createElement('span');
      s.className = 'pager-gap';
      s.textContent = '…';
      pager.appendChild(s);
    };
    tbl(pager.dataset.prev || '‹', halaman - 1, { mati: halaman <= 1, aria: pager.dataset.prev });
    var dari = Math.max(1, Math.min(halaman - 2, maks - 4));
    var sampai = Math.min(maks, dari + 4);
    if (dari > 1) { tbl('1', 1); if (dari > 2) gap(); }
    for (var i = dari; i <= sampai; i++) tbl(String(i), i, { aktif: i === halaman });
    if (sampai < maks) { if (sampai < maks - 1) gap(); tbl(String(maks), maks); }
    tbl(pager.dataset.next || '›', halaman + 1, { mati: halaman >= maks, aria: pager.dataset.next });
  }

  tombol.forEach(function (b) {
    b.onclick = function () {
      kategori = b.dataset.kategori === kategori ? '' : b.dataset.kategori;
      halaman = 1;
      terapkan();
    };
  });

  if (cari) {
    var t;
    cari.oninput = function () {
      clearTimeout(t);
      t = setTimeout(function () {
        kunci = cari.value.trim().toLowerCase();
        halaman = 1;
        terapkan();
      }, 200);
    };
  }

  var awal = new URL(location.href).searchParams;
  kategori = awal.get('kategori') || '';
  kunci = (awal.get('q') || '').toLowerCase();
  halaman = Math.max(1, parseInt(awal.get('hal'), 10) || 1);
  if (cari && kunci) cari.value = kunci;
  terapkan();
})();
