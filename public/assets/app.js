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

  // --- filter + pencarian katalog ---
  var katalog = document.querySelector('[data-katalog]');
  if (!katalog) return;
  var kartu = Array.prototype.slice.call(katalog.querySelectorAll('.card'));
  var cari = document.querySelector('[data-cari]');
  var tombol = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  var hitung = document.querySelector('[data-jumlah]');
  var lagi = document.querySelector('[data-lagi]');
  var SEKALI = 15;                     // kartu per halaman
  var kategori = '';
  var kunci = '';
  var batas = SEKALI;

  function terapkan() {
    var cocok = 0;
    var tampil = 0;
    kartu.forEach(function (k) {
      var cocokKat = !kategori || k.dataset.kategori === kategori;
      var cocokCari = !kunci || k.dataset.cari.indexOf(kunci) > -1;
      var ok = cocokKat && cocokCari;
      if (ok) cocok++;
      var terlihat = ok && cocok <= batas;
      k.hidden = !terlihat;
      if (terlihat) tampil++;
    });
    if (lagi) {
      var sisa = cocok - tampil;
      lagi.hidden = sisa <= 0;
      lagi.textContent = lagi.dataset.label + ' ' + lagi.dataset.sisa.replace('{n}', sisa);
    }
    if (hitung) hitung.textContent = hitung.dataset.pola.replace('{n}', cocok);
    tombol.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.kategori === kategori));
    });
    var u = new URL(location.href);
    kategori ? u.searchParams.set('kategori', kategori) : u.searchParams.delete('kategori');
    kunci ? u.searchParams.set('q', kunci) : u.searchParams.delete('q');
    history.replaceState(null, '', u);
  }

  tombol.forEach(function (b) {
    b.onclick = function () {
      kategori = b.dataset.kategori === kategori ? '' : b.dataset.kategori;
      batas = SEKALI;
      terapkan();
    };
  });

  if (cari) {
    var t;
    cari.oninput = function () {
      clearTimeout(t);
      t = setTimeout(function () {
        kunci = cari.value.trim().toLowerCase();
        batas = SEKALI;
        terapkan();
      }, 200);
    };
  }

  if (lagi) {
    lagi.onclick = function () {
      batas += SEKALI;
      terapkan();
    };
  }

  var awal = new URL(location.href).searchParams;
  kategori = awal.get('kategori') || '';
  kunci = (awal.get('q') || '').toLowerCase();
  if (cari && kunci) cari.value = kunci;
  terapkan();
})();
