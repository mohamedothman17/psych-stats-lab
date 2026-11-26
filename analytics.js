/* ===== Admin analytics (shared by both labs; loaded only inside the admin page) =====
   Study progress of registered students (users/{uid}, readable by admins under the Firestore rules),
   daily activity, per-lesson completion, a sortable table with CSV export, and anonymous visitor totals
   from GoatCounter. Results shared with consent (know/, tests/) feed only the follow-up alerts, the item-level CSV and
   the full JSON backup; the alert cut-offs are the ones already used by know.js and tests.js. ===== */
(function () {
  'use strict';
  var E = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var parse = function (s) { try { return JSON.parse(s || 'null'); } catch (e) { return null; } };
  var dkey = function (d) { var x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  var DAY = 864e5;
  var CSS = '.an{display:flex;flex-direction:column;gap:14px}.an-k{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}.an-k div{border:1px solid var(--line,#ddd);border-radius:12px;padding:10px}.an-k small{display:block;opacity:.7;font-size:12.5px}.an-k b{font-size:22px}' +
    '.an svg{width:100%;height:auto;display:block}.an-bars{display:flex;flex-direction:column;gap:4px;font-size:13px}.an-bars div{display:grid;grid-template-columns:minmax(120px,38%) 1fr 44px;gap:8px;align-items:center}.an-bars i{display:block;height:10px;border-radius:5px;background:var(--primary,var(--teal,#4f46e5))}' +
    '.an table{border-collapse:collapse;width:100%;font-size:13px}.an th,.an td{border-bottom:1px solid var(--line,#ddd);padding:6px;text-align:start;white-space:nowrap}.an th{cursor:pointer;user-select:none}.an-tw{overflow-x:auto}.an .muted{opacity:.7}' +
    '.an-al{border:2px solid #b3261e;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:6px}.an-al tr.an-lv0 td{background:rgba(179,38,30,.14)}.an-al tr.an-lv1 td{background:rgba(179,38,30,.06)}.an-c{display:inline-block;border-radius:999px;padding:0 9px;font-size:12.5px}.an-c.r{background:#fbe3e1;color:#b3261e}.an-c.y{background:#fbf0d5;color:#8a5a00}.an-x{display:flex;gap:8px;flex-wrap:wrap;align-items:center}';
  function css() { if (document.getElementById('an-css')) return; var s = document.createElement('style'); s.id = 'an-css'; s.textContent = CSS; document.head.appendChild(s); }
  function app() { return document.title.indexOf('الإحصاء') >= 0 ? 'stats' : 'scales'; }
  function lessonsMeta() {
    try { if (app() === 'stats' && typeof LESSONS !== 'undefined') return LESSONS.map(function (l) { return { id: l.id, t: l.t }; }); } catch (e) { }
    try { if (typeof C !== 'undefined' && C.parts) return Object.keys(C.parts).map(function (k) { return { id: k, t: (C.parts[k].title || k).split(' — ')[0], n: (C.parts[k].sections || []).length }; }); } catch (e) { }
    return [];
  }
  function row(u, A) {
    var s = parse(u[A] && u[A].state) || {}, upd = u.updated && u.updated.toDate ? u.updated.toDate() : null, days = u.days || {}, now = Date.now();
    var act30 = Object.keys(days).filter(function (k) { return now - new Date(k).getTime() <= 30 * DAY; }).length;
    var r = { id: u.id, name: u.name || '—', email: u.email || '', phone: u.phone || '', last: upd, xp: s.xp | 0, streak: s.streak | 0, acc: s.answered ? Math.round(100 * (s.correct || 0) / s.answered) : null, answered: s.answered | 0, labs: Object.keys(s.labs || {}).length, act30: act30, days: days, s: s };
    if (A === 'stats') { r.prog = Object.keys(s.done || {}).length; r.exams = (s.exams || []).length; r.best = (s.exams || []).reduce(function (m, e) { return Math.max(m, e.n ? Math.round(100 * e.s / e.n) : 0); }, 0); }
    else { r.prog = Object.keys(s.read || {}).length; var q = s.quiz || {}, ks = Object.keys(q); r.exams = ks.length; r.best = ks.length ? Math.round(100 * ks.reduce(function (m, k) { return m + ((q[k] && q[k].best) || 0); }, 0) / ks.length) : 0; }
    return r;
  }
  function barsDaily(R) {
    var W = 600, H = 150, n = 30, now = Date.now(), cnt = [];
    for (var i = n - 1; i >= 0; i--) { var k = dkey(now - i * DAY); cnt.push([k, R.filter(function (r) { return r.days[k]; }).length]); }
    var mx = Math.max(1, Math.max.apply(null, cnt.map(function (c) { return c[1]; }))), bw = (W - 20) / n;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" direction="ltr" role="img" aria-label="الطلاب النشطون يوميًا">' + cnt.map(function (c, i) { var h = 110 * c[1] / mx; return '<rect x="' + (10 + i * bw + 1) + '" y="' + (120 - h) + '" width="' + (bw - 2) + '" height="' + h + '" rx="2" fill="currentColor" opacity=".55"><title>' + c[0] + ': ' + c[1] + '</title></rect>' + (c[1] ? '<text x="' + (10 + i * bw + bw / 2) + '" y="' + (116 - h) + '" font-size="10" text-anchor="middle" fill="currentColor">' + c[1] + '</text>' : ''); }).join('') + '<text x="10" y="142" font-size="11" fill="currentColor" opacity=".7">' + cnt[0][0] + '</text><text x="' + (W - 10) + '" y="142" font-size="11" text-anchor="end" fill="currentColor" opacity=".7">اليوم</text></svg>';
  }
  function lessonBars(R, A) {
    var L = lessonsMeta(); if (!L.length || !R.length) return '<p class="muted">لا توجد بيانات بعد.</p>';
    var rows = L.map(function (l) {
      var c = A === 'stats' ? R.filter(function (r) { return r.s.done && r.s.done[l.id]; }).length
        : R.filter(function (r) { var rd = r.s.read || {}; return Object.keys(rd).some(function (k) { return k.indexOf(l.id + '.') === 0; }); }).length;
      return [l.t, c];
    });
    return '<div class="an-bars">' + rows.map(function (x) { var p = Math.round(100 * x[1] / R.length); return '<div><span>' + E(x[0]) + '</span><span><i style="width:' + p + '%"></i></span><span>' + p + '%</span></div>'; }).join('') + '</div>';
  }
  async function visitors() {
    var base = 'https://mo-psych-stats-lab.goatcounter.com/counter/TOTAL.json', blocked = false;
    var day = function (n) { var d = new Date(Date.now() - n * 864e5); return d.toISOString().slice(0, 10); };
    async function get(q) { try { var r = await fetch(base + q, { cache: 'no-store' }); if (!r.ok) return null; var c = (await r.json()).count; return c == null ? null : +c; } catch (e) { blocked = true; return null; } }
    var v = await Promise.all([get(''), get('?start=' + day(6)), get('?start=' + day(0))]);
    if (v[0] == null) return '<p class="muted" style="margin:0">' + (blocked ? 'المتصفح ده بيمنع عدّاد الزوار (غالبًا مانع إعلانات). اسمح للموقع فيه، أو افتح «التفاصيل».' : 'العدد غير متاح دلوقتي، جرّب بعد شوية.') + '</p>';
    var t = function (k, n) { return n == null ? '' : '<div><small>' + k + '</small><b>' + E(n) + '</b></div>'; };
    return '<div class="an-k">' + t('كل الزيارات', v[0]) + t('آخر ٧ أيام', v[1]) + t('النهارده', v[2]) + '</div>';
  }
  async function visitLog(box) {
    var all = [], scope = 'mine', A = app();
    try { var q = await firebase.firestore().collection('visits').orderBy('t', 'desc').limit(500).get(); all = q.docs.map(function (d) { var x = d.data(); x.id = d.id; x.t = x.t && x.t.toDate ? x.t.toDate() : null; return x; }); }
    catch (e) { box.innerHTML = '<p style="color:#b3261e;margin:0">تعذر قراءة سجل الزيارات. انشر قواعد Firebase الجديدة (قسم visits)، ثم حدّث الصفحة.</p>'; return; }
    var SITE = { stats: 'الإحصاء', scales: 'المقاييس' };
    function draw() {
      var R = scope === 'mine' ? all.filter(function (v) { return v.app === A; }) : all, now = Date.now();
      var cnt = function (f) { return R.filter(f).length; };
      var ips = {}; R.forEach(function (v) { if (v.ip) ips[v.ip] = 1; });
      var dev = function (k) { return R.length ? Math.round(100 * cnt(function (v) { return v.dev === k; }) / R.length) + '%' : '—'; };
      var K = function (l, v) { return '<div><small>' + l + '</small><b>' + v + '</b></div>'; };
      box.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><label><input type="radio" name="anS" value="mine"' + (scope === 'mine' ? ' checked' : '') + '> هذا الموقع</label><label><input type="radio" name="anS" value="all"' + (scope === 'all' ? ' checked' : '') + '> الموقعين</label><button type="button" class="ad-btn" id="anLCsv">تنزيل Excel (CSV)</button><button type="button" class="ad-btn" id="anLDel">حذف الأقدم من 30 يومًا</button></div>' +
        '<div class="an-k">' + K('زيارات (آخر 500)', R.length) + K('اليوم', cnt(function (v) { return v.t && now - v.t.getTime() <= DAY; })) + K('عناوين IP مختلفة', Object.keys(ips).length) + K('موبايل', dev('موبايل')) + K('كمبيوتر', dev('كمبيوتر')) + K('تابلت', dev('تابلت')) + K('مسجلين دخول', cnt(function (v) { return v.uid; })) + '</div>' +
        '<div class="an-tw" style="max-height:480px;overflow:auto;margin-top:8px">' + (R.length ? '<table><thead><tr><th>الوقت</th>' + (scope === 'all' ? '<th>الموقع</th>' : '') + '<th>الصفحة</th><th>الجهاز</th><th>الموديل</th><th>النظام</th><th>المتصفح</th><th>الشاشة</th><th>IP</th><th>الزائر</th><th>جاي من</th></tr></thead><tbody>' +
          R.map(function (v) { return '<tr title="' + E(v.ua) + '"><td>' + (v.t ? v.t.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'medium' }) : '—') + '</td>' + (scope === 'all' ? '<td>' + E(SITE[v.app] || v.app) + '</td>' : '') + '<td dir="ltr">' + E((v.path || '').replace(/^\/psych-(stats|scales)-lab\//, '/')) + '</td><td>' + E(v.dev) + '</td><td dir="ltr">' + E(v.model || '—') + '</td><td dir="ltr">' + E(v.os) + '</td><td dir="ltr">' + E(v.br) + '</td><td dir="ltr">' + E(v.scr) + '</td><td dir="ltr">' + (v.ip ? '<a href="https://ipinfo.io/' + encodeURIComponent(v.ip) + '" target="_blank" rel="noopener">' + E(v.ip) + '</a>' : '—') + '</td><td>' + (v.uid ? '<b>' + E(v.name || 'ضيف') + '</b>' + (v.email ? '<br><small dir="ltr">' + E(v.email) + '</small>' : '') : '<span class="muted">زائر</span>') + '</td><td dir="ltr" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">' + (v.ref ? E(v.ref.replace(/^https?:\/\//, '')) : '—') + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="muted">لا توجد زيارات مسجلة بعد.</p>') + '</div>';
      box.querySelectorAll('input[name=anS]').forEach(function (r) { r.onchange = function () { scope = r.value; draw(); }; });
      box.querySelector('#anLCsv').onclick = function () {
        var q = function (x) { x = String(x == null ? '' : x); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
        var head = ['الوقت', 'الموقع', 'الصفحة', 'الجهاز', 'الموديل', 'النظام', 'المتصفح', 'الشاشة', 'IP', 'الاسم', 'الإيميل', 'اللغة', 'المنطقة الزمنية', 'جاي من', 'User-Agent'];
        var lines = [head].concat(R.map(function (v) { return [v.t ? v.t.toISOString().replace('T', ' ').slice(0, 19) : '', SITE[v.app] || v.app, v.path, v.dev, v.model, v.os, v.br, v.scr, v.ip, v.uid ? (v.name || 'ضيف') : '', v.email, v.lang, v.tz, v.ref, v.ua]; }));
        var blob = new Blob(['﻿' + lines.map(function (l) { return l.map(q).join(','); }).join('\n')], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'visits-' + dkey(Date.now()) + '.csv'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      };
      box.querySelector('#anLDel').onclick = async function () {
        var btn = this; btn.disabled = true; btn.textContent = 'جارٍ الحذف…';
        try {
          var old = await firebase.firestore().collection('visits').where('t', '<', new Date(Date.now() - 30 * DAY)).limit(400).get();
          var b = firebase.firestore().batch(); old.docs.forEach(function (d) { b.delete(d.ref); }); if (old.size) await b.commit();
          btn.textContent = 'اتحذف ' + old.size;
        } catch (e) { btn.textContent = 'تعذر الحذف'; }
      };
    }
    draw();
  }
  function csv(R, A) {
    var head = ['الاسم', 'الإيميل', 'التليفون', 'آخر نشاط', A === 'stats' ? 'الدروس المكتملة' : 'الأقسام المقروءة', 'الدقة %', 'الأسئلة المجابة', 'النقاط', A === 'stats' ? 'الامتحانات' : 'اختبارات الوحدات', 'أفضل نتيجة %', 'المعامل المستخدمة', 'أيام النشاط (30 يومًا)'];
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var lines = [head].concat(R.map(function (r) { return [r.name, r.email, r.phone, r.last ? r.last.toISOString().slice(0, 16).replace('T', ' ') : '', r.prog, r.acc == null ? '' : r.acc, r.answered, r.xp, r.exams, r.best, r.labs, r.act30]; }));
    var blob = new Blob(['﻿' + lines.map(function (l) { return l.map(q).join(','); }).join('\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'students-' + A + '-' + dkey(Date.now()) + '.csv'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  /* ---------- psychological results shared with consent (know/{uid}, tests/{uid}): follow-up alerts, item-level CSV, full backup ---------- */
  var tdate = function (t) { if (!t) return null; if (t.toDate) return t.toDate(); if (t.seconds != null) return new Date(t.seconds * 1000); var d = new Date(t); return isNaN(d) ? null : d; };
  var stamp = function (d) { return d ? dkey(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : ''; };
  var cq = function (x) { x = String(x == null ? '' : x); return /[",\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
  function saveFile(name, text, mime) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  var TQ = function () { try { return typeof TESTS !== 'undefined' && TESTS.Q ? TESTS.Q : {}; } catch (e) { return {}; } };
  var COGN = { matrix: 'المصفوفات', series: 'المتسلسلات العددية', analog: 'التناظر اللفظي', rotate: 'التدوير الذهني', coding: 'ترميز الرموز' };
  var QN = { bigfive: 'Mini-IPIP (الشخصية)', rses: 'روزنبرج لتقدير الذات', pss: 'PSS-10 (الضغط)', swls: 'SWLS (الرضا عن الحياة)', brs: 'BRS (الصمود)', ucla: 'UCLA-3 (الوحدة)', grit: 'Grit-S (المثابرة)', erq: 'ERQ (تنظيم الانفعال)', asrs: 'ASRS (فرز الانتباه)' };
  /* one entry per student who shared: { id, name, email, phone, know: {...}|null, kAt, tests: {...}|null } */
  function people(know, tests, users) {
    var P = {}, U = {}; (users || []).forEach(function (u) { U[u.id] = u; });
    var get = function (d) { var p = P[d.id]; if (!p) { var u = U[d.id] || {}; p = P[d.id] = { id: d.id, name: d.name || u.name || '', email: d.email || u.email || '', phone: u.phone || '', know: null, kAt: null, tests: null }; } if (!p.name && d.name) p.name = d.name; if (!p.email && d.email) p.email = d.email; return p; };
    (know || []).forEach(function (d) { var p = get(d); p.know = parse(d.results) || {}; p.kAt = tdate(d.updated); });
    (tests || []).forEach(function (d) { var p = get(d); p.tests = parse(d.results) || {}; p.tAt = tdate(d.updated); });
    return Object.keys(P).map(function (k) { return P[k]; });
  }
  /* cut-offs come from know.js (PHQ/GAD bands ≥15 high, ≥10 moderate; WHO-5 ≤28%) and tests.js (the results that show the referral box) */
  function alerts(PP) {
    var out = [];
    PP.forEach(function (p) {
      var w = p.know && p.know.well, add = function (lv, ins, score, band, at) { out.push({ p: p, lv: lv, ins: ins, score: score, band: band, at: at }); };
      if (w) {
        var nI = (w.phqI || []).length, PH = nI >= 9 ? 'PHQ-9' : 'PHQ-8', mx = nI >= 9 ? 27 : 24;
        if (nI >= 9 && +w.phqI[8] > 0) add(0, PH + ' · البند 9 (أفكار إيذاء النفس)', w.phqI[8] + ' / 3', 'أولوية قصوى: اتواصل معاه النهارده', p.kAt);
        if (w.phq >= 15) add(1, PH + ' (المزاج)', w.phq + ' / ' + mx, 'مرتفع', p.kAt); else if (w.phq >= 10) add(2, PH + ' (المزاج)', w.phq + ' / ' + mx, 'متوسط', p.kAt);
        if (w.gad >= 15) add(1, 'GAD-7 (القلق)', w.gad + ' / 21', 'مرتفع', p.kAt); else if (w.gad >= 10) add(2, 'GAD-7 (القلق)', w.gad + ' / 21', 'متوسط', p.kAt);
        if (w.who != null && w.who * 4 <= 28) add(2, 'WHO-5 (الرفاهية)', (w.who * 4) + '%', 'منخفضة جدًا', p.kAt);
      }
      var t = p.tests || {}, Q = TQ(), band = function (k, def) { try { return Q[k].show(t[k])[0][2][1]; } catch (e) { return def; } }, at = function (k) { return t[k].at ? new Date(t[k].at) : p.tAt; };
      if (t.asrs && t.asrs.shaded >= 4) add(2, QN.asrs, t.asrs.shaded + ' / 6 في المنطقة المظللة', band('asrs', 'الفرز إيجابي'), at('asrs'));
      if (t.pss && t.pss.total >= 27) add(2, QN.pss, t.pss.total + ' / 40', band('pss', 'ضغط مرتفع'), at('pss'));
      if (t.ucla && t.ucla.total >= 6) add(2, QN.ucla, t.ucla.total + ' / 9', band('ucla', 'وحدة واضحة'), at('ucla'));
    });
    return out.sort(function (a, b) { return a.lv - b.lv || ((b.at ? b.at.getTime() : 0) - (a.at ? a.at.getTime() : 0)); });
  }
  function alertsHtml(L) {
    if (!L.length) return '';
    var urgent = L.filter(function (a) { return a.lv === 0; }).length, CH = ['r', 'r', 'y'], ppl = {}; L.forEach(function (a) { ppl[a.p.id] = 1; });
    return '<div class="an-al"><h4 style="margin:0">تنبيهات تحتاج متابعة (' + Object.keys(ppl).length + ' طالب)</h4>' +
      (urgent ? '<p style="margin:0;color:#b3261e"><b>فيه ' + urgent + ' إجابة بأفكار إيذاء النفس.</b> اتواصل مع الطالب النهارده واتبع بروتوكول الأزمة مع المشرف المرخّص.</p>' : '') +
      '<div class="an-tw"><table><thead><tr><th>الطالب</th><th>الأداة</th><th>الدرجة</th><th>المستوى</th><th>التاريخ</th></tr></thead><tbody>' + L.map(function (a) {
        return '<tr class="an-lv' + a.lv + '"><td><b>' + E(a.p.name || 'ضيف') + '</b>' + (a.p.email ? '<br><small dir="ltr">' + E(a.p.email) + '</small>' : '') + (a.p.phone ? '<br><a dir="ltr" href="tel:' + E(a.p.phone.replace(/[^\d+]/g, '')) + '">' + E(a.p.phone) + '</a>' : '') + '</td><td>' + E(a.ins) + '</td><td>' + E(a.score) + '</td><td><span class="an-c ' + CH[a.lv] + '">' + E(a.band) + '</span></td><td>' + (a.at ? E(a.at.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted" style="margin:0;font-size:12.5px">دي أدوات فرز مش تشخيص: التنبيه معناه إن الطالب يستاهل تتواصل معاه وتطمن عليه. خط الصحة النفسية في مصر <b dir="ltr">16328</b>.</p></div>';
  }
  /* one row per student per instrument; item columns hold the stored responses */
  function itemsCsv(PP, A) {
    var rows = [], N = 0, Q = TQ();
    var push = function (p, src, ins, at, total, code, items) { items = items || []; N = Math.max(N, items.length); rows.push([p.name || 'ضيف', p.email, p.phone, src, ins, stamp(at), total, code].concat(items)); };
    PP.forEach(function (p) {
      var k = p.know || {}, w = k.well;
      if (w) {
        if (w.whoI) push(p, 'اعرف نفسك', 'WHO-5', p.kAt, w.who, 'كل بند 0–5؛ المجموع × 4 = النسبة المئوية', w.whoI);
        if (w.phqI) push(p, 'اعرف نفسك', w.phqI.length >= 9 ? 'PHQ-9' : 'PHQ-8', p.kAt, w.phq, 'كل بند 0–3', w.phqI);
        if (w.gadI) push(p, 'اعرف نفسك', 'GAD-7', p.kAt, w.gad, 'كل بند 0–3', w.gadI);
      }
      [['m6', 'ضغط التواجد الرقمي الدائم'], ['m2', 'الاعتماد المعرفي على الذكاء الاصطناعي']].forEach(function (x) { var m = k[x[0]]; if (m) push(p, 'اعرف نفسك', x[1], p.kAt, m.combined != null ? Math.round(m.combined) : '', 'الإجابات بندًا بندًا مش متخزنة؛ الدرجة المركبة 0–100 (مباشرة ' + (m.direct != null ? Math.round(m.direct) : '—') + '، غير مباشرة ' + (m.indirect != null ? Math.round(m.indirect) : '—') + ')'); });
      var t = p.tests || {};
      Object.keys(t).filter(function (id) { return id.charAt(0) !== '_' && t[id]; }).forEach(function (id) {
        var r = t[id], at = r.at ? new Date(r.at) : p.tAt, q = Q[id];
        if (r.kind === 'c' || COGN[id]) return push(p, 'مكتبة الاختبارات', COGN[id] || id, at, r.pct != null ? r.pct + '%' : '', 'مهمة معرفية: ' + (r.ok | 0) + ' صح من ' + (r.n | 0) + '، الوسيط ' + (r.med | 0) + ' مللي ثانية');
        var tot = r.total != null ? r.total : r.mean != null ? (+r.mean).toFixed(2) : r.sub ? Object.keys(r.sub).map(function (s) { return s + '=' + r.sub[s]; }).join(' ') : '';
        if (id === 'asrs' && r.shaded != null) tot = r.total + ' (المظللة ' + r.shaded + '/6)';
        var a = r.a || [], scored = !!(q && q.it && q.opts && a.length === q.it.length && id !== 'asrs');
        var items = scored ? a.map(function (v, i) { return (q.it[i][1] ? q.opts.length - 1 - v : v) + q.min; }) : a;
        push(p, 'مكتبة الاختبارات', QN[id] || (q && q.t) || id, at, tot, scored ? 'درجة البند بعد عكس العبارات العكسية (من ' + q.min + ' لـ ' + (q.opts.length - 1 + q.min) + ')' : a.length ? 'رقم الاختيار الخام (أول اختيار = 0)' : 'الإجابات بندًا بندًا مش متخزنة', items);
      });
    });
    var head = ['الاسم', 'الإيميل', 'التليفون', 'المصدر', 'الأداة', 'التاريخ', 'الدرجة الكلية', 'الترميز']; for (var i = 1; i <= N; i++) head.push('بند ' + i);
    saveFile('item-responses-' + A + '-' + dkey(Date.now()) + '.csv', '﻿' + [head].concat(rows).map(function (l) { return l.map(cq).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
    return rows.length;
  }
  /* full JSON backup of every collection the admin can read (Firestore timestamps become ISO strings) */
  var BK = function () { return 'an-backup-' + app(); };
  function plain(v) { if (v == null || typeof v !== 'object') return v; if (typeof v.toDate === 'function') { try { return v.toDate().toISOString(); } catch (e) { } } if (Array.isArray(v)) return v.map(plain); var o = {}; Object.keys(v).forEach(function (k) { o[k] = plain(v[k]); }); return o; }
  async function backup(fs) {
    var C = ['users', 'know', 'tests', 'gates', 'admins', 'invites', 'visits', 'leaderboard'], out = { site: app(), title: document.title, exported: new Date().toISOString(), by: (function () { try { return fs.email ? fs.email() : ''; } catch (e) { return ''; } })(), note: 'نتائج know و tests محفوظة في الحقل results كنص JSON زي ما هي في قاعدة البيانات.', collections: {}, unreadable: {} };
    await Promise.all(C.map(function (c) { return fs.list(c).then(function (d) { out.collections[c] = plain(d); }, function (e) { out.unreadable[c] = String((e && (e.code || e.message)) || e); }); }));
    var n = 0; Object.keys(out.collections).forEach(function (c) { n += out.collections[c].length; });
    saveFile('backup-' + app() + '-' + dkey(Date.now()) + '.json', JSON.stringify(out, null, 1), 'application/json');
    try { localStorage.setItem(BK(), String(Date.now())); } catch (e) { }
    return n;
  }
  function backupNote() {
    var t = 0; try { t = +localStorage.getItem(BK()) || 0; } catch (e) { }
    if (!t) return '<span class="an-c y">لسه ما نزّلتش نسخة احتياطية. يستحسن تنزّل واحدة دلوقتي.</span>';
    var d = Math.floor((Date.now() - t) / DAY);
    return d > 7 ? '<span class="an-c y">آخر نسخة احتياطية من ' + d + ' يوم. نزّل واحدة جديدة.</span>' : '<span class="muted" style="font-size:12.5px">آخر نسخة احتياطية: ' + E(new Date(t).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })) + '</span>';
  }
  async function render(el, fs) {
    css(); var A = app();
    el.innerHTML = '<section class="ad-card an"><h3>تحليلات الطلاب والزوار</h3><p class="muted">جارٍ التحميل…</p></section>';
    var users = [];
    try { users = await fs.list('users'); }
    catch (e) { el.firstChild.innerHTML = '<h3>تحليلات الطلاب والزوار</h3><p style="color:#b3261e">تعذر قراءة بيانات الطلاب. انشر ملف القواعد الجديد في Firebase (القسم الخاص بـ users يسمح للمسؤول بالقراءة)، ثم حدّث الصفحة.</p>'; return; }
    var KN = [], TS = [];
    await Promise.all([fs.list('know').then(function (d) { KN = d; }, function () { }), fs.list('tests').then(function (d) { TS = d; }, function () { })]);
    var PP = people(KN, TS, users), AL = alerts(PP);
    var R = users.filter(function (u) { return u[A] && u[A].state; }).map(function (u) { return row(u, A); }), now = Date.now();
    var within = function (d) { return R.filter(function (r) { return r.last && now - r.last.getTime() <= d * DAY; }).length; };
    var avg = function (f) { var v = R.map(f).filter(function (x) { return x != null; }); return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length) : 0; };
    var sortK = 'last', dir = -1;
    var K = function (l, v) { return '<div><small>' + l + '</small><b>' + v + '</b></div>'; };
    var sec = el.firstChild;
    sec.innerHTML = '<h3>تحليلات الطلاب والزوار</h3>' + alertsHtml(AL) +
      '<div class="an-x"><button type="button" class="ad-btn" id="anItems">تنزيل الإجابات بندًا بندًا (CSV)</button><button type="button" class="ad-btn" id="anBk">نسخة احتياطية</button><span id="anBkN">' + backupNote() + '</span></div>' +
      '<p class="muted" style="margin:0">التقدم الدراسي لكل الطلاب المسجلين (الدروس والتدريب والنقاط وأيام النشاط). نتائج «اعرف نفسك» والاختبارات النفسية تظهر في جدولها تحت لمن وافق على مشاركتها فقط.</p>' +
      '<div class="an-k">' + K('طلاب مسجلون', R.length) + K('نشطون اليوم', within(1)) + K('آخر 7 أيام', within(7)) + K('آخر 30 يومًا', within(30)) + K(A === 'stats' ? 'متوسط الدروس المكتملة' : 'متوسط الأقسام المقروءة', avg(function (r) { return r.prog; })) + K('متوسط الدقة', avg(function (r) { return r.acc; }) + '%') + K('مجموع الأسئلة المجابة', R.reduce(function (a, r) { return a + r.answered; }, 0)) + '</div>' +
      '<h4 style="margin:6px 0 0">الطلاب النشطون يوميًا (آخر 30 يومًا)</h4>' + barsDaily(R) +
      '<h4 style="margin:6px 0 0">' + (A === 'stats' ? 'نسبة من أكملوا كل درس' : 'نسبة من بدأوا كل وحدة') + '</h4>' + lessonBars(R, A) +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h4 style="margin:6px 0 0">كل الطلاب</h4><button type="button" class="ad-btn" id="anCsv">تنزيل Excel (CSV)</button></div><div class="an-tw" id="anT"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><h4 style="margin:6px 0 0">الزوار</h4><a href="https://mo-psych-stats-lab.goatcounter.com" target="_blank" rel="noopener">التفاصيل ↗</a></div><div id="anV"><p class="muted" style="margin:0">…</p></div>' +
      '<h4 style="margin:6px 0 0">سجل الزيارات (الوقت والجهاز وIP)</h4><div id="anL"><p class="muted" style="margin:0">…</p></div>';
    var COLS = [['name', 'الاسم'], ['email', 'الإيميل'], ['phone', 'التليفون'], ['last', 'آخر نشاط'], ['prog', A === 'stats' ? 'دروس' : 'أقسام'], ['acc', 'الدقة'], ['answered', 'أسئلة'], ['xp', 'نقاط'], ['exams', A === 'stats' ? 'امتحانات' : 'اختبارات'], ['best', 'أفضل %'], ['labs', 'معامل'], ['act30', 'أيام نشاط']];
    function table() {
      var S = R.slice().sort(function (a, b) { var x = a[sortK], y = b[sortK]; if (x instanceof Date) x = x.getTime(); if (y instanceof Date) y = y.getTime(); if (x == null) x = -1; if (y == null) y = -1; return (x > y ? 1 : x < y ? -1 : 0) * dir; });
      sec.querySelector('#anT').innerHTML = R.length ? '<table><thead><tr>' + COLS.map(function (c) { return '<th data-k="' + c[0] + '">' + c[1] + (sortK === c[0] ? (dir < 0 ? ' ▼' : ' ▲') : '') + '</th>'; }).join('') + '</tr></thead><tbody>' + S.map(function (r) { return '<tr><td><b>' + E(r.name) + '</b></td><td dir="ltr">' + (r.email ? E(r.email) : '<span dir="rtl" class="muted">ضيف</span>') + '</td><td dir="ltr">' + (r.phone ? '<a href="tel:' + E(r.phone.replace(/[^\d+]/g, '')) + '">' + E(r.phone) + '</a>' : '<span dir="rtl" class="muted">—</span>') + '</td><td>' + (r.last ? r.last.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '—') + '</td><td>' + r.prog + '</td><td>' + (r.acc == null ? '—' : r.acc + '%') + '</td><td>' + r.answered + '</td><td>' + r.xp + '</td><td>' + r.exams + '</td><td>' + (r.exams ? r.best + '%' : '—') + '</td><td>' + r.labs + '</td><td>' + r.act30 + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="muted">لا يوجد طلاب مسجلون بعد.</p>';
      sec.querySelectorAll('#anT th').forEach(function (th) { th.onclick = function () { if (sortK === th.dataset.k) dir = -dir; else { sortK = th.dataset.k; dir = -1; } table(); }; });
    }
    table();
    sec.querySelector('#anCsv').onclick = function () { csv(R, A); };
    sec.querySelector('#anItems').onclick = function () { var n = itemsCsv(PP, A); this.textContent = 'اتنزّل (' + n + ' صف)'; };
    sec.querySelector('#anBk').onclick = async function () { var b = this; b.disabled = true; b.textContent = 'جارٍ التجهيز…'; try { var n = await backup(fs); b.textContent = 'اتنزّلت (' + n + ' مستند)'; } catch (e) { b.textContent = 'تعذر التنزيل'; } b.disabled = false; sec.querySelector('#anBkN').innerHTML = backupNote(); };
    sec.querySelector('#anV').innerHTML = await visitors();
    visitLog(sec.querySelector('#anL'));
  }
  window.ADMIN_AN = { render: render };
})();
