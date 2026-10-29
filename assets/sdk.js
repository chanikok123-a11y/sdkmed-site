// SDK MED: shared behaviour (wizard, forms, header, small motion). Hebrew and English.
(function () {
  var FORM_URL = 'https://script.google.com/macros/s/AKfycbwvTDSl_oJ2-JH3KdrZW8C9xNx0LK-xhxsb4h-_TKtVSfUvR0_tIAbCi0ik6YJwMcMO/exec';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var en = function () { return document.documentElement.lang === 'en'; };

  var DIV = {
    ops: { name: 'Medical Operations',
      he: ['ליווי רפואי לניסויים', 'צוותים רפואיים למשימות שטח', 'תכנון מענה רפואי לפעילות', 'תיאום ציוד וכוח אדם'],
      en: ['Medical support for trials', 'Medical teams for field missions', 'Medical planning for an activity', 'Coordinating equipment and personnel'] },
    asst: { name: 'Medical Assistance',
      he: ['בירור צורכי ההטסה', 'תיאום גורמים רפואיים', 'התאמת מלווים רפואיים', 'תיאום מול ספקי תובלה וחברות ביטוח'],
      en: ['Assessing flight needs', 'Coordinating medical parties', 'Matching medical escorts', 'Liaising with transport providers and insurers'] },
    staff: { name: 'Medical Staffing',
      he: ['צוותי שטח', 'תגבור רפואי לפרויקט', 'התאמת בעלי מקצוע לפי כשירות וניסיון'],
      en: ['Field teams', 'Medical reinforcement for a project', 'Matching professionals by qualification and experience'] }
  };
  var MSG = {
    busy: ['שולחים…', 'Sending…'],
    ok: ['הבקשה התקבלה. נחזור אליכם בהקדם.', 'Request received. We will get back to you shortly.'],
    fail: ['השליחה לא עברה. אפשר לכתוב לנו בוואטסאפ, או לנסות שוב בעוד רגע.', 'Sending failed. You can message us on WhatsApp, or try again in a moment.'],
    missing: ['חסר שם, וטלפון או דוא״ל כדי שנוכל לחזור אליכם.', 'Please add your name, and a phone number or email so we can reply.'],
    div: ['בחרו חטיבה כדי להמשיך.', 'Choose a division to continue.'],
    type: ['בחרו את סוג המשימה הקרוב ביותר.', 'Choose the closest mission type.'],
    contact: ['חסר איש קשר, וטלפון או דוא״ל.', 'Please add a contact name, and a phone number or email.'],
    lbl: [['סוג משימה', 'מיקום', 'מועד', 'היקף', 'הצורך'], ['Mission type', 'Location', 'Timing', 'Scope', 'Need']]
  };
  var t = function (k) { return MSG[k][en() ? 1 : 0]; };

  // ---------- header ----------
  var hdr = $('[data-hdr]');
  function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var menuBtn = $('[data-menu]');
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('[data-nav] a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });

  // ---------- send ----------
  function send(data, msg, done) {
    msg.dataset.state = 'busy'; msg.textContent = t('busy');
    data.lang = en() ? 'en' : 'he';
    var ok = false;
    try {
      fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) })
        .then(function () { ok = true; msg.dataset.state = 'ok'; msg.textContent = t('ok'); done(); })
        .catch(function () { if (!ok) fail(msg); });
    } catch (e) { fail(msg); }
  }
  function fail(msg) { msg.dataset.state = 'err'; msg.textContent = t('fail'); }

  // ---------- contact form ----------
  $$('[data-contact]').forEach(function (f) {
    var msg = $('[data-msg]', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return String((f.elements[n] || {}).value || '').trim(); };
      if (!v('name') || (!v('phone') && !v('email'))) { msg.dataset.state = 'err'; msg.textContent = t('missing'); return; }
      send({ name: v('name'), org: v('org'), phone: v('phone'), email: v('email'), mission: v('service'), message: v('message') }, msg, function () { f.reset(); });
    });
  });

  // ---------- mission wizard ----------
  $$('[data-wizard]').forEach(function (w) {
    var steps = $$('[data-step]', w), dots = $$('[data-dot]', w), msg = $('[data-msg]', w);
    var back = $('[data-back]', w), next = $('[data-next]', w), submit = $('[data-submit]', w);
    var st = { i: 0, div: '', type: -1 };

    function chips() {
      var box = $('[data-types]', w);
      box.innerHTML = '';
      if (!st.div) return;
      DIV[st.div][en() ? 'en' : 'he'].forEach(function (label, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = label;
        b.style.setProperty('--k', i);
        b.setAttribute('aria-pressed', st.type === i ? 'true' : 'false');
        b.addEventListener('click', function () {
          st.type = i;
          $$('.chip', box).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
          msg.textContent = ''; msg.dataset.state = '';
        });
        box.appendChild(b);
      });
    }
    document.addEventListener('sdk:lang', chips);
    $$('[data-div]', w).forEach(function (b) {
      b.addEventListener('click', function () {
        st.div = b.dataset.div; st.type = -1;
        $$('[data-div]', w).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        chips();
        msg.textContent = ''; msg.dataset.state = '';
      });
    });
    function show(i) {
      st.i = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      dots.forEach(function (d, k) { d.dataset.on = k <= i ? '1' : ''; d.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      back.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
    }
    function need(k) { msg.dataset.state = 'err'; msg.textContent = t(k); return false; }
    function valid(i) {
      if (i === 0 && !st.div) return need('div');
      if (i === 1 && st.type < 0) return need('type');
      return true;
    }
    back.addEventListener('click', function () { msg.textContent = ''; show(Math.max(0, st.i - 1)); });
    next.addEventListener('click', function () { if (valid(st.i)) { msg.textContent = ''; show(st.i + 1); } });
    w.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return String((w.elements[n] || {}).value || '').trim(); };
      if (!v('w_contact') || (!v('w_phone') && !v('w_email'))) return need('contact');
      // the sheet is read in Hebrew, so the mission type is stored in Hebrew whatever the page language
      var L = t('lbl'), type = DIV[st.div].he[st.type];
      var message = [L[0] + ': ' + type, L[1] + ': ' + v('w_where'), L[2] + ': ' + v('w_when'), L[3] + ': ' + v('w_size'), L[4] + ': ' + v('w_need')].join('\n');
      send({ name: v('w_contact'), org: v('w_org'), phone: v('w_phone'), email: v('w_email'), mission: DIV[st.div].name, message: message }, msg, function () {
        w.reset(); st.div = ''; st.type = -1; chips(); $$('[aria-pressed]', w).forEach(function (c) { c.setAttribute('aria-pressed', 'false'); }); show(0);
      });
    });
    show(0);
  });

  // ---------- typewriter: reads its words again every cycle, so a language switch takes effect ----------
  $$('[data-type]').forEach(function (el) {
    var k = 0;
    var words = function () { return el.dataset.type.split('|'); };
    if (calm) { el.textContent = words()[0]; document.addEventListener('sdk:lang', function () { el.textContent = words()[0]; }); return; }
    function run() {
      var list = words(), w = list[k % list.length], i = 0;
      (function write() {
        el.textContent = w.slice(0, ++i);
        if (i < w.length) return setTimeout(write, 55);
        setTimeout(function erase() {
          el.textContent = w.slice(0, --i);
          if (i > 0) return setTimeout(erase, 28);
          k++; setTimeout(run, 280);
        }, 2200);
      })();
    }
    run();
  });

  // ---------- words that light up while scrolling ----------
  window.sdkWords = function (el, text) {
    var parts = String(text == null ? el.textContent : text).trim().split(/\s+/);
    el.innerHTML = parts.map(function (p) { return '<span class="w">' + p.replace(/</g, '&lt;') + '</span>'; }).join(' ');
    upd(el);
  };
  function upd(el) {
    var ws = $$('.w', el), r = el.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    var n = Math.round(p * ws.length);
    ws.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
  }
  $$('[data-words]').forEach(function (el) {
    if (calm) el.classList.add('lit-all');
    window.sdkWords(el);
    if (!calm) window.addEventListener('scroll', function () { upd(el); }, { passive: true });
  });

  // ---------- preloader ----------
  var pre = $('[data-pre]');
  if (pre) {
    var pct = $('[data-pct]', pre), t0 = performance.now(), dur = calm ? 0 : 1300, over = false;
    function finish() {
      if (over) return; over = true;
      pct.textContent = '100%'; pre.classList.add('gone'); document.body.classList.add('ready');
      setTimeout(function () { pre.hidden = true; }, 700);
    }
    // a hidden tab never runs animation frames, so a timer makes sure the page is never left covered
    setTimeout(finish, dur + 400);
    (function tick(now) {
      if (over) return;
      var p = dur ? Math.min(1, (now - t0) / dur) : 1;
      pct.textContent = Math.round(p * 100) + '%';
      if (p < 1) return requestAnimationFrame(tick);
      finish();
    })(t0);
  } else {
    document.body.classList.add('ready');
  }
})();
