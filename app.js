(function () {
  'use strict';
  const cfg = window.BROODJES || {};
  const DEMO = !!cfg.demo || (!cfg.apiUrl && !cfg.supabaseUrl);
  const $app = document.getElementById('app');
  const S = {
    session: null, menu: [], places: { personeel: [], lesgevers: [] }, settings: { fitnessSurcharge: 0.5, tokenPrice: 0.8 },
    open: true, closesAt: null, offset: 0, cart: [], ord: null, les: null, place: '', jeton: null, idle: null, done: null,
    login: { step: 'name', q: '', results: [], picked: null, code: '', err: '', searched: false }
  };
  let currentView = 'login';

  // ---------- hulpfuncties ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const eurFmt = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' });
  const eur = n => (n == null || isNaN(n)) ? '—' : eurFmt.format(n);
  const typeLabel = t => t === 'lesgever' ? 'Lesgever' : 'Personeel';
  const hhmm = iso => new Date(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const pad2 = n => String(n).padStart(2, '0');
  const nowServer = () => new Date(Date.now() + (S.offset || 0));
  const todayISO = () => { const d = nowServer(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
  function timeLeft() {
    if (!S.closesAt) return '';
    const m = Math.floor((Date.parse(S.closesAt) - nowServer().getTime()) / 60000);
    if (m <= 0) return '';
    const hh = Math.floor(m / 60), mm = m % 60;
    return 'Nog ' + (hh ? hh + ' u ' : '') + mm + ' min.';
  }
  const closeLabel = () => S.closesAt ? hhmm(S.closesAt).replace(':00', 'u').replace(/^0/, '') : '9u';
  const isBeheer = () => !!(S.session && S.session.beheer);
  const isAdmin = () => !!(S.session && S.session.admin);
  function toStart() { if (S.session) go(S.session.type === 'lesgever' ? 'les' : 'home'); else { S.login.step = 'name'; S.login.err = ''; viewLogin(); } }
  const parsePrice = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };

  function notify(msg, type) {
    const t = h('div', { class: 'toast ' + (type || ''), role: 'status' }, msg);
    document.body.append(t); setTimeout(() => t.remove(), 5000);
  }
  async function act(btn, fn) {
    if (btn.disabled) return;
    btn.disabled = true; btn.classList.add('busy');
    try { await fn(); } catch (e) { if (e.message !== 'auth') notify(e.message || 'Er ging iets mis.', 'err'); }
    finally { btn.disabled = false; btn.classList.remove('busy'); }
  }
  async function api(action, data, opts) {
    const body = Object.assign({ action }, data || {});
    if (S.session && !(opts && opts.noAuth)) body.auth = { id: S.session.id, code: S.session.code };
    let r;
    try { r = await window.Api.call(body); }
    catch (e) { throw new Error('Geen verbinding met de server. Probeer opnieuw.'); }
    if (!r || r.ok === false) {
      if (r && r.error === 'auth' && S.session && action !== 'login') { logout('Je bent uitgelogd. Log opnieuw in.'); throw new Error('auth'); }
      throw new Error((r && r.message) || 'Er ging iets mis.');
    }
    return r;
  }
  function setState(st) {
    if (!st) return;
    S.open = !!st.open; S.closesAt = st.closesAt; S.offset = Date.parse(st.now) - Date.now();
  }
  function clockEl() { return h('div', { class: 'clock' }, h('span', { class: 'cdate' }), h('span', { class: 'ctime' })); }
  function paintClock() {
    const n = nowServer();
    const close = S.closesAt ? new Date(S.closesAt) : new Date(n.getFullYear(), n.getMonth(), n.getDate(), 9, 0, 0);
    const diff = close.getTime() - n.getTime();
    const cls = diff <= 0 ? 'late' : (diff <= 600000 ? 'soon' : '');
    document.querySelectorAll('.clock').forEach(el => {
      el.className = 'clock ' + cls;
      el.querySelector('.cdate').textContent = n.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      el.querySelector('.ctime').textContent = pad2(n.getHours()) + ':' + pad2(n.getMinutes());
    });
  }
  function onClosed() {
    if ((currentView === 'order' || currentView === 'checkout') && !isBeheer()) { notify('Het is ' + closeLabel() + '. Het bestellen is gesloten.', 'err'); S.cart = []; go('home'); }
    else if (currentView === 'les' || currentView === 'home') go(currentView);
  }
  async function refreshState() {
    const was = S.open;
    try { const r = await api('getState', {}, { noAuth: true }); setState(r.state); } catch (e) {}
    paintClock();
    if (was && !S.open) onClosed(); else if (!was && S.open && currentView === 'home') go('home');
  }
  function tick() {
    const was = S.open;
    if (S.closesAt && was && nowServer() >= new Date(S.closesAt)) { S.open = false; paintClock(); onClosed(); }
    else paintClock();
  }
  setInterval(tick, 1000);
  setInterval(() => { if (!document.hidden) refreshState(); }, 300000);
  function demoBar() {
    if (!DEMO) return null;
    const D = window.DemoApi;
    const setT = async v => { D.setClock(v); await refreshState(); go(currentView); };
    return h('footer', { class: 'demo' }, h('b', {}, 'TESTMODUS'), ' · geen echte bestellingen. ',
      h('span', { class: 'tt' }, 'Testuur: ', ['08:00', '08:45', '08:55', '09:05', '09:35'].map(t => h('button', { class: 'btn sec small', onclick: () => setT(t) }, t)),
        h('input', { type: 'time', 'aria-label': 'Testuur', value: D.getClock().text, onchange: e => { if (e.target.value) setT(e.target.value); } }),
        h('button', { class: 'btn sec small', onclick: () => setT(null) }, 'Echte tijd')));
  }
  function frame(content, o) {
    o = o || {}; const s = S.session;
    const head = h('header', { class: 'top' },
      h('a', { class: 'brand', href: './', title: 'Naar de startpagina', 'aria-label': 'Naar de startpagina', onclick: e => { e.preventDefault(); toStart(); } }, h('img', { class: 'logo', src: 'logo.png', alt: 'Heli Group' }), h('span', { class: 'sub' }, 'Broodjes bestellen')),
      clockEl(),
      s ? h('div', { class: 'who' }, h('span', {}, s.name), h('button', { class: 'btn sec small', onclick: () => go('code') }, 'Mijn code'), h('button', { class: 'btn sec small', onclick: () => logout() }, 'Uitloggen')) : h('div', { class: 'who' }));
    return h('div', { class: 'page' }, head,
      h('main', {}, o.back ? h('button', { class: 'btn sec small back', onclick: o.back }, '← Terug') : null, content), demoBar());
  }
  function mount(n) { $app.replaceChildren(n); paintClock(); window.scrollTo(0, 0); }
  function go(view, arg) { clearTimeout(S.done); currentView = view; const f = VIEWS[view]; Promise.resolve(f(arg)).catch(e => { if (e.message !== 'auth') notify(e.message, 'err'); }); }
  function stepper(val, min, max, onchange, label, big) {
    return h('div', { class: 'stepper' + (big ? ' big' : '') }, label ? h('span', { class: 'lab' }, label) : null,
      h('button', { type: 'button', class: 'rd', 'aria-label': 'Minder', disabled: val <= min, onclick: () => onchange(val - 1) }, '−'),
      h('b', { class: 'num' }, String(val)),
      h('button', { type: 'button', class: 'rd', 'aria-label': 'Meer', disabled: val >= max, onclick: () => onchange(val + 1) }, '+'));
  }
  // ---------- aanmelden / afmelden ----------
  function bump() {
    clearTimeout(S.idle); if (!S.session) return;
    const sec = S.session.type === 'lesgever' ? 900 : (S.session.beheer ? 600 : 180);
    S.idle = setTimeout(() => logout('Je was even weg en bent daarom uitgelogd.'), sec * 1000);
  }
  ['click', 'keydown', 'pointerdown', 'touchstart'].forEach(ev => document.addEventListener(ev, bump, { passive: true }));
  function logout(msg) {
    clearTimeout(S.idle); clearTimeout(S.done);
    sessionStorage.removeItem('bj_s');
    Object.assign(S, { session: null, menu: [], cart: [], ord: null, les: null, jeton: null, place: '' });
    S.login = { step: 'name', q: '', results: [], picked: null, code: '', err: msg || '', searched: false };
    go('login');
  }
  async function enter() {
    const r = await api('getMenu');
    S.menu = r.menu; S.places = r.places; S.settings = r.settings; setState(r.state);
    S.cart = []; S.les = null; S.ord = null; bump();
    go(S.session.type === 'lesgever' ? 'les' : 'home');
  }
  document.addEventListener('keydown', e => {
    if (currentView !== 'login' || S.login.step !== 'code') return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); loginPress(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); loginBack(); }
    else if (e.key === 'Enter') { e.preventDefault(); loginSubmit(); }
  });
  function loginPress(d) { const L = S.login; if (L.code.length < 8) { L.code += d; paintDots(); } }
  function loginBack() { S.login.code = S.login.code.slice(0, -1); paintDots(); }
  function paintDots() {
    const box = document.getElementById('dots'); if (!box) return;
    const n = S.login.code.length;
    box.replaceChildren(...Array.from({ length: Math.max(4, n) }, (_, i) => h('span', { class: i < n ? 'on' : '' })));
  }
  async function loginSubmit() {
    const L = S.login;
    if (L.code.length < 4) { notify('Je code heeft minstens 4 cijfers.', 'err'); return; }
    try {
      const r = await api('login', { personId: L.picked.id, code: L.code }, { noAuth: true });
      S.session = Object.assign({}, r.person, { code: L.code });
      sessionStorage.setItem('bj_s', JSON.stringify(S.session));
      L.code = ''; await enter();
    } catch (e) { if (e.message !== 'auth') { L.code = ''; L.err = e.message; viewLogin(); } }
  }
  function demoHint() {
    return DEMO ? h('div', { class: 'banner warn' }, h('b', {}, 'Testmodus. Probeer:'),
      'Davy van de Velde (personeel, code 1234) · Khaled (lesgever, code 123456) · Jeroen De Meyer of Jeffrey (beheerder, code 1111). Onderaan kan je het testuur instellen.') : null;
  }
  // ---------- schermen ----------
  const VIEWS = {};
  function viewLogin() {
    const L = S.login;
    if (L.step === 'name') {
      const results = h('div', { class: 'namegrid' });
      let timer;
      const paint = () => {
        const kids = L.results.map(p => h('button', { class: 'person', onclick: () => { L.picked = p; L.step = 'code'; L.code = ''; L.err = ''; viewLogin(); } }, p.name, h('small', {}, typeLabel(p.type))));
        if (L.searched && !L.results.length && L.q.trim().length >= 2) kids.push(h('p', { class: 'muted' }, 'Geen naam gevonden. Probeer een andere schrijfwijze.'));
        results.replaceChildren(...kids);
      };
      const doSearch = async () => {
        const q = L.q.trim();
        if (q.length < 2) { L.results = []; L.searched = false; paint(); return; }
        try { const r = await api('findPerson', { q }, { noAuth: true }); if (q !== L.q.trim()) return; L.results = r.persons || []; L.searched = true; paint(); }
        catch (e) { notify(e.message, 'err'); }
      };
      const input = h('input', { class: 'field', type: 'search', autocomplete: 'off', placeholder: 'Typ de eerste letters van je naam', value: L.q, 'aria-label': 'Zoek je naam', oninput: e => { L.q = e.target.value; clearTimeout(timer); timer = setTimeout(doSearch, 250); } });
      mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Wie ben jij?'), L.err ? h('div', { class: 'banner warn' }, L.err) : null, input, results, demoHint())));
      paint(); input.focus();
    } else {
      const dots = h('div', { class: 'dots', id: 'dots', 'aria-hidden': 'true' });
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
      const pad = h('div', { class: 'pad' }, keys.map(k => h('button', { type: 'button', class: k === 'OK' ? 'ok' : '', 'aria-label': k === '⌫' ? 'Wis' : k, onclick: e => { if (k === '⌫') loginBack(); else if (k === 'OK') act(e.currentTarget, loginSubmit); else loginPress(k); } }, k)));
      mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Typ je code'),
        h('div', { class: 'bigname' }, L.picked.name), L.err ? h('div', { class: 'banner warn' }, L.err) : null, dots, pad,
        h('p', {}, h('button', { class: 'btn sec', onclick: () => { L.step = 'name'; L.err = ''; viewLogin(); } }, '← Ik ben iemand anders')),
        h('p', { class: 'muted' }, 'Code vergeten? Vraag een nieuwe aan bij de broodjes-beheerders.'), demoHint())));
      paintDots();
    }
  }
  VIEWS.login = viewLogin;

  async function viewHome() {
    mount(frame(h('p', { class: 'muted' }, 'Even laden…')));
    let ov = null;
    if (isBeheer()) { ov = await api('adminOverview'); setState(ov.state); }
    else { const r = await api('getState'); setState(r.state); }
    const banner = S.open
      ? h('div', { class: 'banner ok' }, h('b', {}, 'Bestellen kan tot ' + closeLabel()), timeLeft())
      : h('div', { class: 'banner warn' }, h('b', {}, 'Het is ' + hhmm(nowServer().toISOString())),
        isBeheer() ? 'Bestellen is gesloten voor het personeel. Voor jou niet.' : 'Het bestellen is gesloten voor vandaag. Iets vergeten? Bel een broodjes-beheerder.');
    const kids = [h('h1', {}, 'Hallo ' + S.session.name.split(' ')[0]), banner];
    if (ov && ov.mail.status === 'ready' && S.closesAt && nowServer() >= new Date(Date.parse(S.closesAt) + 30 * 60000))
      kids.push(h('div', { class: 'banner warn', style: 'border-width:2px;border-color:#B3261E' }, h('b', {}, 'Herinnering: de mail naar de broodjeszaak is nog niet verzonden.'), 'Open hem hieronder en klik op Verzenden.'));
    if (ov) {
      const m = ov.mail;
      kids.push(h('button', { class: 'mailcard', onclick: () => go('mail') },
        h('div', {}, h('b', {}, 'Mail naar de broodjeszaak'),
          h('span', {}, m.status === 'empty' ? 'Nog geen bestellingen' : m.status === 'ready' ? 'Klaar om te verzenden' : 'Verzonden om ' + hhmm(m.sentAt) + (m.additions ? ' · ' + m.additions + ' aanvulling(en) nog niet verstuurd' : ''))), h('b', {}, '›')));
    }
    kids.push(h('div', { class: 'tiles' },
      h('button', { class: 'tile main', disabled: !S.open && !isBeheer(), onclick: () => go('order') }, 'Broodje bestellen'),
      h('button', { class: 'tile', onclick: () => go('mine') }, 'Mijn bestellingen')));
    if (ov) {
      const t = (label, view, n) => h('button', { class: 'tile', onclick: () => go(view) }, n ? h('span', { class: 'badge' }, n) : null, label);
      kids.push(h('div', { class: 'section-label' }, 'Beheer'),
        h('div', { class: 'tiles' }, t('Jeton uitgeven', 'jeton'), t('Maandproducten invullen', 'maand', ov.counts.monthProducts), t('Prijzen invullen', 'prijzen', ov.counts.openPrices),
          t('Nog door te bellen', 'bellen', ov.counts.toCall), t('Bestelling toevoegen na 9u', 'toevoegen'), t('Assortiment vergadering', 'assortiment'), t('Codes beheren', 'codes', ov.counts.noCode)));
      if (isAdmin()) kids.push(h('div', { class: 'section-label' }, 'Alleen voor IT'), h('div', { class: 'tiles' }, t('Menu en prijzen', 'menu'), t('Instellingen', 'instellingen')));
    }
    mount(frame(h('section', {}, kids)));
  }
  VIEWS.home = viewHome;

  function viewCode() {
    let n1 = '', n2 = ''; const back = () => go(S.session.type === 'lesgever' ? 'les' : 'home');
    mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Mijn code wijzigen'),
      h('p', { class: 'muted' }, 'Kies een code die je goed onthoudt: ' + (S.session.type === 'lesgever' ? 'minstens 6 cijfers' : 'minstens 4 cijfers') + '. Niet 1234, 4321 of vier keer hetzelfde cijfer.'),
      h('label', {}, 'Nieuwe code', h('input', { class: 'field', type: 'password', inputmode: 'numeric', autocomplete: 'new-password', maxlength: '8', oninput: e => { n1 = e.target.value; } })),
      h('label', {}, 'Nieuwe code nog eens', h('input', { class: 'field', type: 'password', inputmode: 'numeric', autocomplete: 'new-password', maxlength: '8', oninput: e => { n2 = e.target.value; } })),
      h('p', {}, h('button', { class: 'btn big', onclick: e => act(e.currentTarget, async () => {
        if (n1 !== n2) throw new Error('De twee codes zijn niet gelijk.');
        await api('changeOwnCode', { newCode: n1 });
        S.session.code = n1; sessionStorage.setItem('bj_s', JSON.stringify(S.session)); notify('Je code is gewijzigd.', 'ok'); back();
      }) }, 'Opslaan')),
      h('p', {}, h('button', { class: 'btn sec', onclick: back }, 'Annuleren')))), { back });
  }
  VIEWS.code = viewCode;

  // ----- personeel: bestellen -----
  const CATS = [['Belegd broodje', 'Belegd'], ['Warm broodje', 'Warm'], ['Salade', 'Salade'], ['Gebak', 'Gebak'], ['Overig', 'Overig']];
  const priceText = m => m.openPrice ? 'prijs volgt' : eur(m.price);
  const cartTotal = () => S.cart.reduce((s, l) => l.open ? s : s + (l.unit + l.surcharge) * l.qty, 0);
  const lineLabel = l => l.qty + '× ' + l.name + (l.soort ? ', ' + l.soort : '');
  function cartPanel(onNext, label) {
    const rows = S.cart.map((l, i) => h('div', { class: 'cartline' }, h('div', {}, lineLabel(l), l.remark ? h('small', {}, l.remark) : null), h('div', {}, l.open ? '…' : eur((l.unit + l.surcharge) * l.qty), ' ', h('button', { class: 'x', 'aria-label': 'Verwijder', onclick: () => { S.cart.splice(i, 1); viewOrder(); } }, '×'))));
    return h('aside', { class: 'card' }, h('h2', {}, 'Mandje'), S.cart.length ? rows : h('p', { class: 'muted' }, 'Nog niets toegevoegd. Kies links een broodje.'),
      h('div', { class: 'total' }, h('span', {}, 'Totaal'), h('b', {}, eur(cartTotal()))),
      S.cart.some(l => l.open) ? h('small', {}, 'Voor sommige producten volgt de prijs nog.') : null,
      h('button', { class: 'btn', disabled: !S.cart.length, onclick: onNext }, label || 'Bekijk mandje'));
  }
  function viewOrder() {
    if (!S.open && !isBeheer()) return go('home');
    const O = S.ord || (S.ord = { cat: 'Belegd broodje', sel: null, soort: 'wit', qty: 1, remark: '' });
    const avail = CATS.filter(c => S.menu.some(m => m.category === c[0]));
    if (!avail.some(c => c[0] === O.cat) && avail.length) O.cat = avail[0][0];
    const items = S.menu.filter(m => m.category === O.cat).sort((a, b) => a.order - b.order);
    const cats = h('nav', { class: 'cats' }, avail.map(([k, l]) => h('button', { class: 'cat' + (O.cat === k ? ' on' : ''), onclick: () => { O.cat = k; O.sel = null; viewOrder(); } }, l)));
    const grid = h('div', { class: 'prods' }, items.map(m => h('button', { class: 'prod' + (O.sel && O.sel.id === m.id ? ' on' : ''), onclick: () => { O.sel = m; O.soort = 'wit'; O.qty = 1; O.remark = ''; viewOrder(); } }, h('span', {}, m.name), h('small', {}, priceText(m)))));
    let opts = h('p', { class: 'muted' }, 'Kies een broodje.');
    if (O.sel) {
      const m = O.sel; const rows = [h('h3', {}, m.name, ' ', h('small', {}, priceText(m)))];
      if (m.fitness) rows.push(h('div', { class: 'seg' }, [['wit', 'Wit'], ['bruin', 'Bruin'], ['fitness', 'Fitness + ' + eur(S.settings.fitnessSurcharge)]].map(([k, l]) => h('button', { class: O.soort === k ? 'on' : '', onclick: () => { O.soort = k; viewOrder(); } }, l))));
      rows.push(h('div', { class: 'row' }, h('span', { class: 'lab' }, 'Aantal'), stepper(O.qty, 1, 12, v => { O.qty = v; viewOrder(); }),
        h('input', { class: 'field', placeholder: m.name === 'Andere' ? 'Wat wil je bestellen?' : 'Opmerking, bv. zonder tomaat', value: O.remark, 'aria-label': 'Opmerking', oninput: e => { O.remark = e.target.value; } })));
      rows.push(h('button', { class: 'btn', onclick: () => {
        if (m.name === 'Andere' && !O.remark.trim()) { notify('Typ wat je wil bestellen.', 'err'); return; }
        S.cart.push({ menuId: m.id, name: m.name, soort: m.fitness ? O.soort : '', qty: O.qty, remark: O.remark.trim(), unit: m.price, open: !!m.openPrice, surcharge: (m.fitness && O.soort === 'fitness') ? S.settings.fitnessSurcharge : 0 });
        const added = m.name; O.sel = null; viewOrder(); notify(added + ' zit in je mandje.', 'ok');
      } }, 'Toevoegen aan mandje'));
      opts = h('div', { class: 'card opts' }, rows);
    }
    mount(frame(h('div', { class: 'order' }, cats, h('div', { class: 'mid' }, grid, opts), cartPanel(() => go('checkout'))), { back: () => go('home') }));
  }
  VIEWS.order = viewOrder;

  function viewCheckout() {
    if (!S.cart.length) return go('order');
    const places = S.places.personeel || [];
    const key = 'bj_place_' + S.session.id;
    if (!places.includes(S.place)) { const saved = localStorage.getItem(key); S.place = places.includes(saved) ? saved : ''; }
    const lines = S.cart.map(l => h('div', { class: 'cartline' }, h('div', {}, lineLabel(l), l.remark ? h('small', {}, l.remark) : null), h('b', {}, l.open ? 'prijs volgt' : eur((l.unit + l.surcharge) * l.qty))));
    const send = h('button', { class: 'btn big', disabled: !S.place, onclick: e => { const b = e.currentTarget; act(b, async () => {
      const r = await api('placeOrder', { place: S.place, date: todayISO(), lines: S.cart.map(l => ({ menuId: l.menuId, soort: l.soort, qty: l.qty, remark: l.remark })) });
      localStorage.setItem(key, S.place);
      const summary = S.cart.map(l => lineLabel(l)); S.cart = [];
      viewDone({ title: 'Je bestelling is verstuurd', lines: summary, note: r.status === 'Te laat' ? 'Je bestelling kwam na de mail binnen. De beheerders bellen de broodjeszaak.' : 'Het bedrag wordt aan het einde van de maand van je loon afgehouden.', auto: true });
    }); } }, 'Bestellen');
    mount(frame(h('div', { class: 'two' },
      h('section', { class: 'card' }, h('h2', {}, 'Wat je bestelt'), lines, h('div', { class: 'total' }, h('span', {}, 'Totaal'), h('b', {}, eur(cartTotal())))),
      h('section', { class: 'card' }, h('h2', {}, 'Waar leveren we het?'),
        h('div', { class: 'seg' }, places.map(p => h('button', { class: S.place === p ? 'on' : '', onclick: () => { S.place = p; viewCheckout(); } }, p))),
        h('p', {}, 'Voor ', h('b', {}, 'vandaag'), '. Een datum in het verleden kan niet.'),
        h('p', { class: 'muted' }, 'Het bedrag wordt aan het einde van de maand van je loon afgehouden.'),
        send, h('button', { class: 'btn sec', onclick: () => go('order') }, 'Nog iets toevoegen'))), { back: () => go('order') }));
  }
  VIEWS.checkout = viewCheckout;

  function viewDone(o) {
    mount(frame(h('section', { class: 'done' }, h('div', { class: 'tick' }, '✓'), h('h1', {}, o.title),
      h('div', { class: 'card', style: 'text-align:left' }, o.lines.map(t => typeof t === 'string' ? h('div', { class: 'sumline' }, t) : t)),
      o.note ? h('p', { class: 'muted' }, o.note) : null,
      h('div', { class: 'tools', style: 'justify-content:center;margin-top:1rem' },
        h('button', { class: 'btn', onclick: () => logout() }, 'Klaar'),
        h('button', { class: 'btn sec', onclick: () => go(S.session.type === 'lesgever' ? 'les' : 'home') }, 'Nog een bestelling')),
      o.auto ? h('p', { class: 'muted' }, 'Dit scherm sluit vanzelf.') : null)));
    if (o.auto) S.done = setTimeout(() => logout(), 30000);
  }

  async function viewMine() {
    mount(frame(h('p', { class: 'muted' }, 'Even laden…'), { back: () => go('home') }));
    const r = await api('myOrders');
    const today = r.today.length ? r.today.map(g => h('div', { class: 'card' }, h('div', { class: 'row2' }, h('b', {}, g.place + ' · ' + hhmm(g.ts)), h('span', { class: 'chip grey' }, g.status)),
      g.lines.map(l => h('div', { class: 'row2' }, h('span', {}, l.text), h('b', {}, l.price == null ? 'prijs volgt' : eur(l.price)))),
      g.canCancel ? h('div', { class: 'row2' }, h('small', {}, 'Annuleren kan tot ' + closeLabel()), h('button', { class: 'btn danger small', onclick: e => act(e.currentTarget, async () => { await api('cancelOrder', { ids: g.ids }); notify('Bestelling geannuleerd.', 'ok'); viewMine(); }) }, 'Annuleren')) : null))
      : [h('p', { class: 'muted' }, 'Je hebt vandaag nog niets besteld.')];
    mount(frame(h('div', { class: 'two' },
      h('section', { style: 'display:flex;flex-direction:column;gap:1rem' }, h('div', { class: 'card', style: 'background:#001B35;color:#fff' }, h('span', {}, 'Totaal deze maand'), h('b', { style: 'font-size:2.6rem' }, eur(r.monthTotal)), r.openPrices ? h('small', { style: 'color:#DCE5EF' }, r.openPrices + ' bestelling(en) zonder prijs zijn nog niet meegeteld.') : null), h('h2', {}, 'Vandaag'), today),
      h('section', { class: 'card' }, h('h2', {}, 'Eerder deze maand'), r.earlier.length ? r.earlier.map(e => h('div', { class: 'row2' }, h('span', {}, e.date.slice(8) + '/' + e.date.slice(5, 7) + ' · ' + e.text), h('b', {}, e.price == null ? 'prijs volgt' : eur(e.price)))) : h('p', { class: 'muted' }, 'Nog niets deze maand.'))), { back: () => go('home') }));
  }
  VIEWS.mine = viewMine;

  // ----- lesgevers -----
  function viewLes() {
    const L = S.les || (S.les = { step: 'place', place: '', qty: {}, remark: {}, ok: false });
    const items = S.menu.filter(m => m.lesgevers).sort((a, b) => a.order - b.order);
    const get = id => L.qty[id] || { wit: 0, bruin: 0 };
    const total = () => items.reduce((s, m) => s + get(m.id).wit + get(m.id).bruin, 0);
    if (!S.open) {
      return mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Het bestellen is gesloten'),
        h('div', { class: 'banner warn' }, h('b', {}, 'Het bestellen sloot om ' + closeLabel() + '.'), 'Iets vergeten? Bel een van de broodjes-beheerders. Zij regelen het met de broodjeszaak.'),
        h('button', { class: 'btn', onclick: () => logout() }, 'Afsluiten'))));
    }
    if (L.step === 'place') {
      const places = S.places.lesgevers || [];
      return mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Hallo ' + S.session.name.split(' ')[0] + ', waar zit je?'),
        h('p', { class: 'muted' }, 'Je bestelling is voor vandaag. Bestellen kan tot ' + closeLabel() + '. ' + timeLeft()),
        h('div', { class: 'placegrid' }, places.map(p => h('button', { class: L.place === p ? 'on' : '', onclick: () => { L.place = p; viewLes(); } }, p))),
        h('p', {}, h('button', { class: 'btn big', disabled: !L.place, onclick: () => { L.step = 'broodjes'; viewLes(); } }, 'Volgende')))));
    }
    if (L.step === 'broodjes') {
      const cards = items.map(m => {
        const q = get(m.id), on = q.wit + q.bruin > 0;
        const set = (k, v) => { L.qty[m.id] = Object.assign({}, get(m.id), { [k]: v }); viewLes(); };
        return h('div', { class: 'lescard' + (on ? ' on' : '') }, h('div', { class: 'name' }, m.name),
          h('div', { class: 'steps' }, stepper(q.wit, 0, 12, v => set('wit', v), 'Wit'), stepper(q.bruin, 0, 12, v => set('bruin', v), 'Bruin')),
          on ? h('input', { class: 'field', placeholder: 'Opmerking, bv. 1 zonder tomaat', value: L.remark[m.id] || '', 'aria-label': 'Opmerking bij ' + m.name, oninput: e => { L.remark[m.id] = e.target.value; } }) : null);
      });
      const side = h('aside', { class: 'card' }, h('h2', {}, 'Jouw bestelling'),
        total() ? items.filter(m => get(m.id).wit + get(m.id).bruin > 0).map(m => h('div', {}, h('b', {}, m.name), h('br'), h('small', {}, [get(m.id).wit ? get(m.id).wit + ' wit' : '', get(m.id).bruin ? get(m.id).bruin + ' bruin' : ''].filter(Boolean).join(' · ')))) : h('p', { class: 'muted' }, 'Nog niets gekozen.'),
        h('div', { class: 'total' }, h('span', {}, 'Totaal'), h('b', {}, total() + ' stuks')),
        h('button', { class: 'btn', disabled: !total(), onclick: () => { L.step = 'overzicht'; L.ok = false; viewLes(); } }, 'Naar overzicht'));
      return mount(frame(h('div', { class: 'lesorder' }, h('section', {}, h('h1', {}, 'Kies je broodjes'), h('p', { class: 'muted' }, 'Tik + bij wit of bruin. Opmerking nodig? Typ ze eronder.'), h('div', { class: 'lesgrid' }, cards)), side), { back: () => { L.step = 'place'; viewLes(); } }));
    }
    const lines = []; // [{menuId, soort, qty, remark}]
    items.forEach(m => { const q = get(m.id); let first = true; ['wit', 'bruin'].forEach(s => { if (q[s] > 0) { lines.push({ menuId: m.id, soort: s, qty: q[s], remark: first ? (L.remark[m.id] || '').trim() : '' }); first = false; } }); });
    const summary = () => h('div', { class: 'card' }, items.filter(m => get(m.id).wit + get(m.id).bruin > 0).map(m => { const q = get(m.id), rem = (L.remark[m.id] || '').trim();
      return h('div', { class: 'sumline' }, h('div', { class: 'r' }, h('b', {}, m.name), h('span', {}, [q.wit ? q.wit + ' wit' : '', q.bruin ? q.bruin + ' bruin' : ''].filter(Boolean).join(' · '))), rem ? h('div', { class: 'rem' }, 'Opmerking: ' + rem) : null); }),
      h('div', { class: 'total' }, h('span', {}, 'Totaal'), h('b', {}, total() + ' stuks')));
    if (L.step === 'overzicht') {
      const send = h('button', { class: 'btn big', disabled: !L.ok, onclick: e => act(e.currentTarget, async () => {
        const r = await api('placeOrder', { place: L.place, date: todayISO(), lines });
        L.step = 'klaar'; L.sentAt = r.sentAt || new Date().toISOString(); L.late = r.status === 'Te laat'; viewLes();
      }) }, 'Verzenden');
      return mount(frame(h('section', { class: 'login' }, h('h1', {}, 'Klopt je bestelling?'), h('p', { class: 'muted' }, S.session.name + ' · ' + L.place + ' · vandaag'), summary(),
        h('p', {}, h('button', { class: 'check' + (L.ok ? ' on' : ''), role: 'checkbox', 'aria-checked': String(L.ok), onclick: () => { L.ok = !L.ok; viewLes(); } }, h('i', {}, L.ok ? '✓' : ''), 'Ja, deze bestelling is correct')),
        h('div', { class: 'tools', style: 'justify-content:space-between' }, h('button', { class: 'btn sec big', onclick: () => { L.step = 'broodjes'; viewLes(); } }, 'Aanpassen'), send))));
    }
    // klaar
    mount(frame(h('section', { class: 'done' }, h('div', { class: 'tick' }, '✓'), h('h1', {}, 'Je bestelling is goed verzonden'),
      h('p', { class: 'muted' }, 'Bedankt, ' + S.session.name.split(' ')[0] + ' · ' + L.place + ' · vandaag om ' + hhmm(L.sentAt)), summary(),
      h('div', { class: 'banner warn', style: 'margin-top:1rem;text-align:left' }, L.late ? 'Je bestelling kwam binnen nadat de mail naar de broodjeszaak was verstuurd. De beheerders bellen de broodjeszaak.' : 'Iets vergeten? Na ' + closeLabel() + ' kan je niet meer zelf bestellen. De beheergroep krijgt dan een melding en belt de broodjeszaak.'),
      h('div', { class: 'tools', style: 'justify-content:center;margin-top:1rem' }, h('button', { class: 'btn', onclick: () => logout() }, 'Afsluiten'), h('button', { class: 'btn sec', onclick: () => { S.les = null; viewLes(); } }, 'Nieuwe bestelling')))));
  }
  VIEWS.les = viewLes;
  window.__bj = { S, VIEWS, go, h, api, logout }; // voor tests
  // ---------- start ----------
  (async function init() {
    await refreshState();
    try {
      const saved = JSON.parse(sessionStorage.getItem('bj_s') || 'null');
      if (saved && saved.id) { S.session = saved; await enter(); return; }
    } catch (e) { sessionStorage.removeItem('bj_s'); S.session = null; }
    viewLogin();
  })();
  // ---------- beheerschermen: zie app-admin.js ----------
  window.__bjCore = { h, mount, frame, go, api, act, notify, stepper, eur, hhmm, typeLabel, parsePrice, S, VIEWS, isBeheer, isAdmin, closeLabel, logout, refreshState, todayISO, nowServer };
})();
