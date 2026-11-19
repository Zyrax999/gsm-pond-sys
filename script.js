/* IDP Group 9 - site behaviour
   Plain JavaScript, no libraries. Every feature checks that its element exists,
   so one missing element never breaks the rest of the page. */
(function () {
  'use strict';

  var EMAIL = 'idp.group9@nsuk.edu.ng';
  var YOUTUBE_ID = ''; // e.g. 'dQw4w9WgXcQ' (the part after v= in a YouTube link). Leave empty for no video.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Footer year */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* 2. Mobile menu: toggle, close on link click, Escape, outside click, or widening the window */
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  function closeMenu() {
    if (!nav || !btn) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1000) closeMenu(); });
  }

  /* 3. Scroll handling (one rAF-throttled handler):
        - highlight the nav link of the section in view
        - add a shadow to the header after scrolling
        - show or hide the back-to-top button */
  var header = document.querySelector('header');
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  // Only real <section> targets take part (#solution is a block inside #about)
  var spy = links.map(function (a) {
    var el = document.getElementById(a.getAttribute('href').slice(1));
    return el && el.tagName === 'SECTION' ? { link: a, el: el } : null;
  }).filter(Boolean);

  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '&uarr;';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTop);

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);

    var current = spy.length ? spy[0] : null;
    spy.forEach(function (s) {
      if (s.el.getBoundingClientRect().top <= 140) current = s;
    });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4 && spy.length) {
      current = spy[spy.length - 1]; // at the very bottom, the last section is "current"
    }
    links.forEach(function (a) {
      a.classList.toggle('active', !!current && a === current.link);
    });
  }
  function requestUpdate() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', update);
  update();

  /* 4. Fade-in on scroll (skipped for visitors who prefer reduced motion,
        and content stays visible if JavaScript or IntersectionObserver is unavailable) */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = document.querySelectorAll('.problem, .solution, .step, .circles > div, .sms-panel, .parts > div, .why, .about, .member, .contact > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* 5. Contact form
        - Sends the message in the background through FormSubmit (the form's action address).
        - If that fails (offline, blocked, or opened from a local file), falls back to the visitor's email app. */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var sendBtn = document.getElementById('sendBtn');
  var sending = false; // blocks double submission

  function setStatus(kind, msg) {
    if (!statusEl) return;
    statusEl.className = kind ? 'is-' + kind : '';
    statusEl.textContent = msg;
  }
  function setFieldError(input, msg) {
    var out = document.getElementById('err-' + input.name);
    if (out) out.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  function validate(input) {
    var v = input.value.trim(), msg = '';
    if (!v) msg = 'This field is required.';
    else if (input.name === 'email' && !EMAIL_RE.test(v)) msg = 'Please enter a valid email address.';
    else if (input.name === 'message' && v.length < 10) msg = 'Please write at least 10 characters.';
    setFieldError(input, msg);
    return !msg;
  }
  function setBusy(on) {
    sending = on;
    if (!sendBtn) return;
    sendBtn.disabled = on;
    sendBtn.classList.toggle('loading', on);
    sendBtn.querySelector('.lbl').textContent = on ? 'Sending...' : 'Send Message';
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], textarea[required]'));
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid') === 'true') validate(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      var data = new FormData(form);
      if (data.get('_gotcha')) return; // spam trap: bots fill hidden fields

      var firstBad = null;
      fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
      if (firstBad) { setStatus('error', 'Please fix the highlighted fields.'); firstBad.focus(); return; }

      var endpoint = form.getAttribute('action') || '';
      if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint) || /YOUR_FORM_ID/.test(endpoint)) {
        setStatus('error', 'The contact form is not set up yet. Please email us directly at ' + EMAIL + '.');
        return;
      }

      setBusy(true);
      setStatus('loading', 'Sending your message...');
      var timeout = new AbortController();
      var timer = setTimeout(function () { timeout.abort(); }, 15000);

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: timeout.signal })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; });
        })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            fields.forEach(function (f) { setFieldError(f, ''); f.removeAttribute('aria-invalid'); });
            setStatus('success', 'Thank you! Your message has been delivered. We will reply by email soon.');
          } else {
            var detail = res.body && res.body.errors && res.body.errors[0] && res.body.errors[0].message;
            setStatus('error', 'Your message could not be sent' + (detail ? ' (' + detail + ')' : '') +
              '. Please try again, or email us at ' + EMAIL + '.');
          }
        })
        .catch(function () {
          setStatus('error', 'Network problem: your message was not sent. Check your connection and try again, or email us at ' + EMAIL + '.');
        })
        .then(function () { clearTimeout(timer); setBusy(false); });
    });
  }

  /* 6. Project evidence
        Each block stays hidden until its file exists, so the page never shows
        broken images or dead links. Drop the files in and they appear. */
  function probeImage(img, onFound) {
    var probe = new Image();
    probe.onload = function () { img.src = img.getAttribute('data-src'); onFound(); };
    probe.src = img.getAttribute('data-src'); // a missing file simply never fires onload
  }

  var gallery = document.getElementById('gallery');
  if (gallery) {
    Array.prototype.forEach.call(gallery.querySelectorAll('img[data-src]'), function (img) {
      probeImage(img, function () {
        img.parentNode.hidden = false;
        gallery.hidden = false;
      });
    });
  }

  var reportLink = document.getElementById('reportLink');
  if (reportLink && window.fetch) {
    fetch(reportLink.getAttribute('href'), { method: 'HEAD' })
      .then(function (r) { if (r.ok) reportLink.hidden = false; })
      .catch(function () { /* not hosted yet or no file: keep it hidden */ });
  }

  // Demo video: paste a YouTube video ID into YOUTUBE_ID (top of this file) to show it
  var videoBox = document.getElementById('demo');
  var videoFrame = document.getElementById('videoFrame');
  if (YOUTUBE_ID && videoBox && videoFrame) {
    videoFrame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(YOUTUBE_ID) +
      '" title="IDP Group 9 demo video" loading="lazy" allowfullscreen ' +
      'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe>';
    videoBox.hidden = false;
    var heroBtn = document.getElementById('heroSecondBtn');
    if (heroBtn) { heroBtn.setAttribute('href', '#demo'); heroBtn.innerHTML = '&#9654; Watch Video'; }
  }
})();
