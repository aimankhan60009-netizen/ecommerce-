/* ============================================================
   Exclusive — E-Commerce Home Page Clone | script.js
   Features: Countdown timers, Hero slider, Flash carousel,
             Wishlist toggle, Add-to-cart feedback, Scroll top
   ============================================================ */

// ---------- 1) FLASH SALES COUNTDOWN (starts 03 : 23 : 19 : 56) ----------
(function () {
  let days = 3, hours = 23, minutes = 19, seconds = 56;

  const el = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMinutes'),
    s: document.getElementById('cdSeconds'),
  };

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    seconds--;
    if (seconds < 0) { seconds = 59; minutes--; }
    if (minutes < 0) { minutes = 59; hours--; }
    if (hours < 0) { hours = 23; days--; }
    if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }

    if (el.d) el.d.textContent = pad(days);
    if (el.h) el.h.textContent = pad(hours);
    if (el.m) el.m.textContent = pad(minutes);
    if (el.s) el.s.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();

// ---------- 2) MUSIC BANNER COUNTDOWN (starts 23 H | 05 D | 59 M | 35 S) ----------
(function () {
  // Remaining time: 5 days, 23 hours, 59 minutes, 35 seconds
  // Display order (same as design): Hours, Days, Minutes, Seconds
  let total = ((((5 * 24) + 23) * 60 + 59) * 60 + 35); // seconds

  const el = {
    h: document.getElementById('mcHours'),
    d: document.getElementById('mcDays'),
    m: document.getElementById('mcMinutes'),
    s: document.getElementById('mcSeconds'),
  };

  const pad = (n) => String(n).padStart(2, '0');

  function render() {
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (el.h) el.h.textContent = pad(h);
    if (el.d) el.d.textContent = pad(d);
    if (el.m) el.m.textContent = pad(m);
    if (el.s) el.s.textContent = pad(s);
  }

  function tick() {
    if (total > 0) total--;
    render();
  }

  render();
  setInterval(tick, 1000);
})();

// ---------- 3) HERO SLIDER (5 slides, dots, autoplay) ----------
(function () {
  const track = document.getElementById('heroTrack');
  const dotsWrap = document.getElementById('heroDots');
  if (!track || !dotsWrap) return;

  const slides = track.children.length;
  let current = 2; // design shows 3rd dot active
  let timer = null;

  // Build dots
  for (let i = 0; i < slides; i++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    b.addEventListener('click', function () {
      goTo(i);
      restartAuto();
    });
    dotsWrap.appendChild(b);
  }

  function goTo(i) {
    current = (i + slides) % slides;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    [...dotsWrap.children].forEach((d, idx) =>
      d.classList.toggle('active', idx === current)
    );
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function restartAuto() {
    clearInterval(timer);
    startAuto();
  }

  goTo(current);
  startAuto();
})();

// ---------- 4) FLASH SALES CAROUSEL (arrows) ----------
(function () {
  const track = document.getElementById('flashTrack');
  const prev = document.getElementById('flashPrev');
  const next = document.getElementById('flashNext');
  if (!track || !prev || !next) return;

  let index = 0;

  function cardWidth() {
    const card = track.children[0];
    const gap = 30;
    return card ? card.getBoundingClientRect().width + gap : 300;
  }

  function visibleCount() {
    const wrap = track.parentElement.getBoundingClientRect().width;
    return Math.max(1, Math.floor(wrap / cardWidth()));
  }

  function maxIndex() {
    return Math.max(0, track.children.length - visibleCount());
  }

  function update() {
    const max = maxIndex();
    if (index > max) index = max;
    if (index < 0) index = 0;
    track.style.transform = 'translateX(-' + index * cardWidth() + 'px)';
  }

  next.addEventListener('click', function () {
    index++;
    update();
  });

  prev.addEventListener('click', function () {
    index--;
    update();
  });

  window.addEventListener('resize', update);
  update();
})();

/* NOTE: Wishlist toggle / add-to-cart feedback ab main.js handle karta hai
   (shared across all pages). Yahan sirf homepage-specific features hain. */

// ---------- 7) SCROLL TO TOP ----------
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ---------- 8) SUBSCRIBE FORM FEEDBACK ----------
(function () {
  const form = document.querySelector('.subscribe-form');
  if (!form) return;

  form.addEventListener('submit', function () {
    const input = form.querySelector('input');
    if (input && input.value.trim()) {
      input.value = '';
      input.placeholder = 'Subscribed! Check your email ✓';
      setTimeout(function () {
        input.placeholder = 'Enter your email';
      }, 2500);
    }
  });
})();
