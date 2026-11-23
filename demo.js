// ============================================================
//  TESTMODUS: doet alsof er een flow is. Gegevens blijven in deze browser.
//  Dit bestand beschrijft ook precies wat de echte flow moet antwoorden.
//  Testcodes (alleen in de testmodus):
//    Davy van de Velde (personeel)   code 1234
//    Khaled (lesgever)               code 123456
//    Jeffrey, Ian, Lies, Lindsay en Jeroen De Meyer (beheerders)   code 1111
//  Onderaan de pagina kan je het testuur instellen om "voor 9u" en "na 9u" te zien.
// ============================================================
(function () {
  const KEY = 'bj_demo_v4';
  const CLK = 'bj_demo_clock';
  const pad = n => String(n).padStart(2, '0');
  function simNow() {
    let c = null; try { c = JSON.parse(localStorage.getItem(CLK)); } catch (e) {}
    if (!c) return new Date();
    const d = new Date(c.setAt);
    return new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate(), c.h, c.m, 0).getTime() + (Date.now() - c.setAt));
  }
  const today = () => { const d = simNow(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const monthOf = () => today().slice(0, 7);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const MENU = [
    ['Prépare','Belegd broodje',5],['Martino','Belegd broodje',5],['Smos','Belegd broodje',5],['Kaas','Belegd broodje',5],['Hesp','Belegd broodje',5],['Bicky','Belegd broodje',5],['Tonijn','Belegd broodje',5.5],['Tonijntino','Belegd broodje',5.5],['Tropical','Belegd broodje',5],['Krabsalade','Belegd broodje',5.5],['Vleessalade','Belegd broodje',5],['Kip curry','Belegd broodje',5],['Gezond','Belegd broodje',4.5],['Veggiesalade','Belegd broodje',4.5],['Kip curry tropical','Belegd broodje',5],['Zalmsalade','Belegd broodje',6.5],['Gerookte zalm tartare','Belegd broodje',6.5],['Préparé tartare','Belegd broodje',5],['Boulet Briek','Belegd broodje',5.5],['Brie, honing, walnoten','Belegd broodje',5.5],['Italia, serrano, mozarella','Belegd broodje',6.5],['Broodje gebakken kip','Belegd broodje',5.5],['Broodje Breydelspek special','Belegd broodje',6],['Broodje van de maand','Belegd broodje',null],['Veggie','Belegd broodje',null],
    ['Flaguette breydelham','Warm broodje',6.5],['Flaguette kip pepersaus','Warm broodje',6.5],['Flaguette omelet brieks','Warm broodje',6.5],['Panini kip pesto','Warm broodje',8],['Panini kaas & ham','Warm broodje',6],['Panini tropical','Warm broodje',6],['Panini bicky','Warm broodje',7],['Panini italia','Warm broodje',7],
    ['Salade kip','Salade',12],['Salade tomaat & mozarella','Salade',12],['Salade tonijn','Salade',12],['Salade gerookte zalm','Salade',13.5],['Ceasar salad','Salade',12],['Slaatje americain','Salade',12],['Poké bowl sweet chicken','Salade',13.5],['Poké bowl spicy chicken','Salade',13.5],['Poké bowl salmon style','Salade',14.5],['Salade van de maand','Salade',null],
    ['Penne bolognaise','Overig',10],['Andere','Overig',null],
    ['Worstenbroodje','Gebak',2.4],['Donut','Gebak',2],['Appelflap','Gebak',2.8],['Appelschijfje','Gebak',2.8],['Appeltaart','Gebak',3.3],['Frangipane','Gebak',2.8],['Mattetaart','Gebak',3],['Flantaart','Gebak',3.1],['Eclair','Gebak',2.8],['Carré confituur','Gebak',2.8],['Kriekentaartje','Gebak',2.8],['Rabarbercake','Gebak',2.8],['Rijsttaartje','Gebak',2.8],['Rijstvlaai','Gebak',3],['Broodpudding','Gebak',2]
  ];
  const LES = ['Hesp','Kaas','Smos','Prépare','Tonijn','Kip curry','Boulet Briek','Veggie'];
  const OPEN_PRICE = ['Andere', 'Broodje van de maand', 'Salade van de maand'];
  const MONTHLY = ['Broodje van de maand', 'Salade van de maand'];

  function seed() {
    return {
      seq: 100,
      settings: { fitnessSurcharge: 0.5, tokenPrice: 0.8, lesgeverPrijs: 3.6, closeTime: '09:00', mailBroodjeszaak: '', mailHR: '', mailBeheergroep: '', mailITSupport: 'ITSupport@heli.be' },
      places: {
        personeel: ['Kantoor', 'Magazijn'],
        lesgevers: ['Lokaal A', 'Lokaal B', 'Lokaal C', 'Zaal 1', 'Zaal 2', 'Zaal 3', 'Koiba', 'Vergaderzaal', 'Zaal High and Safe', 'Appartement']
      },
      persons: [
        { id: 'p1', name: 'Davy van de Velde', type: 'personeel', beheer: false, actief: true, code: '1234' },
        { id: 'p2', name: 'Joost Merlevede', type: 'personeel', beheer: false, actief: true, code: '1234' },
        { id: 'p3', name: 'Fanny Deschamps', type: 'personeel', beheer: false, actief: true, code: '1234' },
        { id: 'p4', name: 'Alain Van Impe', type: 'personeel', beheer: false, actief: true, code: '1234' },
        { id: 'p5', name: 'Diego Ramirez', type: 'personeel', beheer: false, actief: true, code: '1234' },
        { id: 'p6', name: 'Khaled', type: 'lesgever', beheer: false, actief: true, code: '123456' },
        { id: 'p7', name: 'Jeremie', type: 'lesgever', beheer: false, actief: true, code: '123456' },
        { id: 'p8', name: 'Jeffrey', type: 'personeel', beheer: true, actief: true, code: '1111' },
        { id: 'p9', name: 'Lies', type: 'personeel', beheer: true, actief: true, code: '1111' },
        { id: 'p10', name: 'Ian', type: 'personeel', beheer: true, actief: true, code: '1111' },
        { id: 'p11', name: 'Lindsay', type: 'personeel', beheer: true, actief: true, code: '1111' },
        { id: 'p12', name: 'Jeroen De Meyer', type: 'personeel', beheer: true, admin: true, actief: true, code: '1111' },
        { id: 'p13', name: 'Marie Peeters', type: 'personeel', beheer: false, actief: true, code: '' },
        { id: 'p14', name: 'Tom Vermeulen', type: 'personeel', beheer: false, actief: true, code: '' }
      ].map(p => Object.assign({ tries: 0, lockUntil: 0, admin: false }, p)),
      menu: MENU.map((m, i) => ({
        id: 'm' + (i + 1), name: m[0], category: m[1], price: m[2], order: i,
        openPrice: OPEN_PRICE.includes(m[0]), fitness: m[1] === 'Belegd broodje',
        lesgevers: LES.includes(m[0]), description: '', priceMonth: '', monthly: MONTHLY.includes(m[0]), active: true, other: m[0] === 'Andere'
      })),
      orders: [], tokens: [], mail: { sentAt: null, sentBy: null }, mailDay: today()
    };
  }
  let db;
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db) db = seed();
    if (db.mailDay !== today()) { db.mail = { sentAt: null, sentBy: null }; db.mailDay = today(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  const closeToday = () => { const d = simNow(); const [hh, mm] = db.settings.closeTime.split(':').map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0); };
  const isOpen = () => simNow() < closeToday();
  const state = () => ({ open: isOpen(), now: simNow().toISOString(), closesAt: closeToday().toISOString() });
  function codeError(type, code) {
    code = String(code || '');
    if (!/^\d+$/.test(code)) return 'Een code bestaat enkel uit cijfers.';
    const min = type === 'lesgever' ? 6 : 4;
    if (code.length < min || code.length > 8) return 'De code heeft ' + min + ' tot 8 cijfers.';
    if (/^(\d)\1+$/.test(code)) return 'Kies geen code met enkel hetzelfde cijfer.';
    if ('0123456789'.includes(code) || '9876543210'.includes(code)) return 'Kies geen code zoals 1234 of 4321.';
    return '';
  }
  const fail = (message, error) => ({ ok: false, message, error: error || 'fout' });
  const person = id => db.persons.find(p => p.id === id);
  const menuItem = id => db.menu.find(m => m.id === id);
  // Aanmeldlogboek (zoals in de database): wie, wanneer, gelukt of niet. De code zelf wordt nooit bewaard.
  function logEvent(p, via, result, tries, lockUntil, note) {
    db.loginLog = db.loginLog || [];
    db.loginLog.push({ ts: new Date().toISOString(), person: p ? p.name : null, personId: p ? p.id : null, type: p ? p.type : null, via, result, tries: tries == null ? null : tries, lockUntil: lockUntil ? new Date(lockUntil).toISOString() : null, ip: null, device: 'pc · Chrome', note: note || null });
    if (db.loginLog.length > 500) db.loginLog.shift();
    save();
  }
  function who(auth) {
    if (!auth) return null;
    const p = person(auth.id);
    return p && p.actief && p.code && p.code === auth.code ? p : null;
  }
  function genCode(type) {
    const len = type === 'lesgever' ? 6 : 4;
    for (let t = 0; t < 200; t++) { let c = ''; for (let i = 0; i < len; i++) c += Math.floor(Math.random() * 10); if (!codeError(type, c)) return c; }
    return type === 'lesgever' ? '482913' : '4829';
  }
  const pub = p => ({ id: p.id, name: p.name, type: p.type, beheer: p.beheer || !!p.admin, admin: !!p.admin });
  function menuFor(p) {
    let items = db.menu.filter(m => m.active !== false);
    if (!p.beheer) {
      items = p.type === 'lesgever' ? items.filter(m => m.lesgevers) : items.filter(m => m.price != null || m.openPrice);
    }
    return items.map(m => ({ id: m.id, name: m.name, category: m.category, price: effPrice(m), openPrice: m.openPrice && effPrice(m) == null, fitness: m.fitness, lesgevers: m.lesgevers, other: !!m.other, description: m.description, order: m.order }));
  }
  function effPrice(m) { return m.openPrice ? (m.priceMonth === monthOf() ? m.price : null) : m.price; }
  const soortLabel = (cat, s) => cat === 'Belegd broodje' ? ({ wit: 'Wit broodje', bruin: 'Bruin broodje', fitness: 'Fitness broodje' }[s] || 'Broodje') : '';

  function writeOrder(body, owner, status, by) {
    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) return fail('Je bestelling is leeg.');
    const ref = 'B' + (++db.seq);
    const mailSent = !!db.mail.sentAt;
    const out = [];
    for (const l of lines) {
      const m = menuItem(l.menuId); const qty = parseInt(l.qty, 10);
      if (!m || !(qty >= 1) || qty > 20) return fail('Ongeldige regel in je bestelling.');
      const soort = ['wit', 'bruin', 'fitness'].includes(l.soort) ? l.soort : '';
      if (m.other && !String(l.remark || '').trim()) return fail('Typ wat je wil bestellen bij "Iets anders".');
      if (owner.type === 'lesgever' && !m.lesgevers) return fail('Dit product is niet beschikbaar voor lesgevers.');
      let unit, st = status || (mailSent ? 'Te laat' : 'Nieuw');
      if (owner.type === 'lesgever') unit = db.settings.lesgeverPrijs;
      else { unit = effPrice(m); if (unit == null) { if (!m.openPrice) return fail('Dit product is niet beschikbaar.'); st = status || (mailSent ? 'Te laat' : 'Prijs te bepalen'); } }
      const row = { id: 'o' + (++db.seq), ref, personId: owner.id, person: owner.name, type: owner.type, place: body.place || '', date: today(), menuId: m.id, product: m.name, category: m.category, soort, qty, remark: String(l.remark || '').slice(0, 200), unit, surcharge: (owner.type !== 'lesgever' && soort === 'fitness') ? db.settings.fitnessSurcharge : 0, status: st, ts: simNow().toISOString(), by: by || '', sentAt: null, calledBy: '', calledAt: '' };
      db.orders.push(row); out.push(row);
    }
    save();
    return { ok: true, ref, sentAt: simNow().toISOString(), status: out[0].status };
  }
  // ---- bestellingen aanpassen en annuleren (zoals in de database) ----
  const communicated = o => !!o.sentAt || o.status === 'Telefonisch doorgegeven';
  const groupText = ref => db.orders.filter(o => o.ref === ref && o.status !== 'Geannuleerd').map(lineText).join('; ');
  const hrSentFor = date => !!(db.hr && db.hr[date.slice(0, 7)] && db.hr[date.slice(0, 7)].sentAt);
  function logChange(ref, o, by, role, action, before, after, comm, note) {
    db.orderLog = db.orderLog || [];
    db.orderLog.push({ ts: simNow().toISOString(), ref, date: o.date, owner: o.person, ownerType: o.type, by: by.name, role, action, before, after, communicated: !!comm, hrSent: hrSentFor(o.date), note: String(note || '').trim().slice(0, 300) || null });
    if (db.orderLog.length > 600) db.orderLog.shift();
  }
  function cancelGroup(ref, by, role, note) {
    const rows = db.orders.filter(o => o.ref === ref && o.status !== 'Geannuleerd' && o.type !== 'vergadering'); if (!rows.length) return null;
    const first = rows[0], before = groupText(ref), comm = rows.some(communicated);
    rows.forEach(o => { o.status = 'Geannuleerd'; o.changedAt = simNow().toISOString(); });
    if (comm) db.orders.filter(o => o.ref === ref).forEach(o => { o.changeText = (o.changePending ? o.changeText + ' | ' : '') + 'Geannuleerd (' + by.name + '): ' + before; o.changePending = true; });
    logChange(ref, first, by, role, 'geannuleerd', before, '', comm, note);
    return { communicated: comm, hrSent: hrSentFor(first.date) };
  }
  const todayOrders = () => db.orders.filter(o => o.date === today() && o.status !== 'Geannuleerd');
  const rowTotal = o => o.unit == null ? 0 : (o.unit + o.surcharge) * o.qty;
  const kindsText = o => (o.kinds || []).map(k => k.name + (k.count ? ' (' + k.count + ')' : '')).join(', ') || 'naar keuze van de broodjeszaak';
  const lineText = o => o.type === 'vergadering' ? ('Assortiment vergadering: ' + o.persons + ' personen, ' + o.qty + ' broodjes (' + kindsText(o) + ')') : `${o.qty}x ${soortLabel(o.category, o.soort)} ${o.product}${o.remark ? ' (' + o.remark + ')' : ''}`.replace(/\s+/g, ' ').trim();

  function mailHtml(rows) {
    const th = 'border:1px solid #8A8A8A;padding:6px 10px;background:#F0F0F0';
    const td = 'border:1px solid #8A8A8A;padding:6px 10px;vertical-align:top';
    const col = { 'Belegd broodje': 2, 'Warm broodje': 3, 'Salade': 4, 'Gebak': 5, 'Overig': 6 };
    const assort = rows.filter(r => r.type === 'vergadering'); rows = rows.filter(r => r.type !== 'vergadering');
    const places = [...new Set(rows.map(r => r.place))];
    let html = '<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;color:#222"><p>Beste, hierbij de bestelling voor vandaag,</p>';
    for (const place of places) {
      const rs = rows.filter(r => r.place === place);
      html += `<p><b>${esc(place)}</b></p>`;
      if (db.places.lesgevers.includes(place)) {
        html += `<table style="border-collapse:collapse;width:100%"><tr><th style="${th}">Broodjes</th></tr>` + rs.map(r => `<tr><td style="${td}">${esc(lineText(r))}</td></tr>`).join('') + '</table>';
      } else {
        const names = [...new Set(rs.map(r => r.person))];
        html += `<table style="border-collapse:collapse;width:100%"><tr>${['Naam', 'Broodjes', 'Warme broodjes', 'Salades', 'Gebak', 'Andere'].map(c => `<th style="${th}">${c}</th>`).join('')}</tr>`;
        for (const n of names) {
          const cells = ['', '', '', '', '', ''];
          cells[0] = esc(n);
          rs.filter(r => r.person === n).forEach(r => { const c = col[r.category] - 1; cells[c] += (cells[c] ? '<br>' : '') + esc(lineText(r)); });
          html += '<tr>' + cells.map(c => `<td style="${td}">${c}</td>`).join('') + '</tr>';
        }
        html += '</table>';
      }
    }
    if (assort.length) {
      html += '<p><b>Assortiment voor vergadering</b></p><table style="border-collapse:collapse;width:100%"><tr>' + ['Plaats', 'Voor', 'Personen', 'Broodjes', 'Samenstelling', 'Opmerking'].map(c => `<th style="${th}">${c}</th>`).join('') + '</tr>'
        + assort.map(o => `<tr><td style="${td}">${esc(o.place)}${o.time ? ' om ' + esc(o.time) : ''}</td><td style="${td}">${esc(o.person)}</td><td style="${td}">${o.persons}</td><td style="${td}">${o.qty}</td><td style="${td}">${esc(kindsText(o))}</td><td style="${td}">${esc(o.remark)}</td></tr>`).join('') + '</table>';
    }
    return html + '<p>Met vriendelijke groeten,<br>Heli Group</p></div>';
  }

  const H = {
    ping: () => ({ ok: true, pong: true }),
    findPerson(b) {
      const q = norm(b.q); if (q.length < 2) return { ok: true, persons: [] };
      const me = who(b.auth);
      return { ok: true, persons: db.persons.filter(p => p.actief && norm(p.name).includes(q) && (!b.type || p.type === b.type) && (me || p.type)).slice(0, 8).map(p => ({ id: p.id, name: p.name, type: p.type })) };
    },
    login(b) {
      const p = person(b.personId);
      if (!p) { logEvent(null, 'login', 'onbekend', null, 0); return fail('Dit account is niet actief.'); }
      if (!p.actief) { logEvent(p, 'login', 'niet_actief', p.tries, 0); return fail('Dit account is niet actief.'); }
      if (!p.code) { logEvent(p, 'login', 'geen_code', p.tries, 0); return fail('Je hebt nog geen code. Vraag er een aan bij de broodjes-beheerders.'); }
      const maxT = 5, lockM = 15;
      if (p.lockUntil > Date.now()) { logEvent(p, 'login', 'geblokkeerd', p.tries, p.lockUntil); return fail('Te veel foute pogingen. Probeer over ' + Math.ceil((p.lockUntil - Date.now()) / 60000) + ' minuten opnieuw, of vraag een beheerder om een nieuwe code.'); }
      if (p.code !== String(b.code)) {
        const t = p.tries + 1;
        if (t >= maxT) { p.lockUntil = Date.now() + lockM * 60000; p.tries = 0; logEvent(p, 'login', 'fout_code', t, p.lockUntil); save(); return fail('Te veel foute pogingen. Probeer over ' + lockM + ' minuten opnieuw, of vraag een beheerder om een nieuwe code.'); }
        p.tries = t; logEvent(p, 'login', 'fout_code', t, 0); save();
        const rest = maxT - t; return fail('Dat is niet de juiste code. Probeer opnieuw. Nog ' + rest + (rest === 1 ? ' poging.' : ' pogingen.'));
      }
      p.tries = 0; p.lockUntil = 0; logEvent(p, 'login', 'ok', 0, 0); save();
      return { ok: true, person: pub(p) };
    },
    getState: () => ({ ok: true, state: state() }),
    getMenu(b, me) { return { ok: true, menu: menuFor(me), places: db.places, settings: { fitnessSurcharge: db.settings.fitnessSurcharge, tokenPrice: db.settings.tokenPrice }, state: state() }; },
    placeOrder(b, me) {
      if (!isOpen() && !me.beheer) return fail('Het bestellen is gesloten voor vandaag.');
      return writeOrder(b, me, null, me.name);
    },
    myOrders(b, me) {
      const mine = db.orders.filter(o => o.personId === me.id && o.status !== 'Geannuleerd' && o.type !== 'vergadering');
      const group = rows => { const m = {}; rows.forEach(o => { (m[o.ref] = m[o.ref] || { ref: o.ref, place: o.place, ts: o.ts, status: o.status, lines: [], total: 0, ids: [], sent: false }); m[o.ref].sent = m[o.ref].sent || communicated(o); m[o.ref].lines.push({ text: lineText(o), price: o.unit == null ? null : rowTotal(o) }); m[o.ref].total += rowTotal(o); m[o.ref].ids.push(o.id); }); return Object.values(m); };
      const todays = mine.filter(o => o.date === today());
      const toks = db.tokens.filter(t => t.personId === me.id && t.date.slice(0, 7) === monthOf() && !t.undone);
      const monthRows = mine.filter(o => o.date.slice(0, 7) === monthOf());
      const earlier = monthRows.filter(o => o.date !== today()).map(o => ({ date: o.date, text: lineText(o), price: o.unit == null ? null : rowTotal(o) }))
        .concat(toks.filter(t => t.date !== today()).map(t => ({ date: t.date, text: t.qty + ' jeton(s)', price: t.qty * t.price })));
      earlier.sort((a, b) => b.date.localeCompare(a.date));
      const total = monthRows.reduce((s, o) => s + rowTotal(o), 0) + toks.reduce((s, t) => s + t.qty * t.price, 0);
      return { ok: true, today: group(todays).map(g => Object.assign(g, { canCancel: isOpen() })), monthTotal: total, earlier, openPrices: monthRows.filter(o => o.unit == null).length };
    },
    cancelOrder(b, me) {
      if (!isOpen()) return fail('Annuleren kan niet meer na 9u.');
      const refs = [...new Set(db.orders.filter(o => (b.ids || []).includes(o.id) && o.personId === me.id && o.date === today() && o.status !== 'Geannuleerd' && o.type !== 'vergadering').map(o => o.ref))];
      let any = false, n = 0;
      refs.forEach(r => { const x = cancelGroup(r, me, 'zelf', null); if (x) { n++; any = any || x.communicated; } });
      save(); return n ? { ok: true, communicated: any } : fail('Deze bestelling kan niet geannuleerd worden.');
    },
    adminOverview(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const mo = db.menu.filter(m => m.monthly && m.priceMonth !== monthOf()).length;
      const rows = todayOrders();
      return { ok: true, state: state(), mail: { auto: false, status: rows.length === 0 ? 'empty' : (db.mail.sentAt ? 'sent' : 'ready'), sentAt: db.mail.sentAt, sentBy: db.mail.sentBy, additions: rows.filter(o => !o.sentAt).length && db.mail.sentAt ? rows.filter(o => !o.sentAt).length : 0 }, counts: { noCode: db.persons.filter(p => p.actief && !p.code).length, monthProducts: mo, openPrices: db.orders.filter(o => o.type !== 'vergadering' && (o.status === 'Prijs te bepalen' || (o.unit == null && o.status !== 'Geannuleerd'))).length, toCall: db.orders.filter(o => o.status === 'Te laat').length + new Set(db.orders.filter(o => o.changePending && o.date === today()).map(o => o.ref)).size } };
    },
    giveTokens(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const t = person(b.targetId); const q = parseInt(b.qty, 10);
      if (!t || !(q >= 1 && q <= 20)) return fail('Kies een persoon en een aantal.');
      db.tokens.push({ id: 't' + (++db.seq), personId: t.id, name: t.name, qty: q, price: db.settings.tokenPrice, date: today(), ts: simNow().toISOString(), by: me.name, undone: false });
      save(); return { ok: true };
    },
    listTokens: (b, me) => me.beheer ? { ok: true, tokens: db.tokens.filter(t => !t.undone).slice(-6).reverse().map(t => ({ id: t.id, name: t.name, qty: t.qty, ts: t.ts, by: t.by })) } : fail('Geen toegang.', 'auth'),
    undoToken(b, me) { if (!me.beheer) return fail('Geen toegang.', 'auth'); const t = db.tokens.find(x => x.id === b.id); if (t) t.undone = true; save(); return { ok: true }; },
    getMonthProducts(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      return { ok: true, items: db.menu.filter(m => m.monthly).map(m => ({ menuId: m.id, name: m.name, description: m.description, price: m.price, ok: m.priceMonth === monthOf() })) };
    },
    saveMonthProduct(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const m = menuItem(b.menuId); const price = Number(b.price);
      if (!m || !(price > 0) || price > 100) return fail('Vul een geldige prijs in.');
      m.description = String(b.description || '').slice(0, 120); m.price = price; m.priceMonth = monthOf();
      db.orders.forEach(o => { if (o.menuId === m.id && o.unit == null && o.status !== 'Geannuleerd') { o.unit = price; if (o.status === 'Prijs te bepalen') o.status = db.mail.sentAt && !o.sentAt ? 'Te laat' : 'Nieuw'; } });
      save(); return { ok: true };
    },
    listOpenPrices(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      return { ok: true, items: db.orders.filter(o => o.type !== 'vergadering' && o.unit == null && o.status !== 'Geannuleerd').map(o => ({ id: o.id, person: o.person, date: o.date, text: lineText(o) })) };
    },
    savePrice(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const o = db.orders.find(x => x.id === b.id); const price = Number(b.price);
      if (!o || !(price >= 0) || price > 100) return fail('Vul een geldige prijs in.');
      o.unit = price; if (o.status === 'Prijs te bepalen') o.status = o.sentAt ? 'Verstuurd' : 'Nieuw'; save(); return { ok: true };
    },
    addLateOrder(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const t = person(b.targetId); if (!t) return fail('Kies eerst een persoon.');
      const r = writeOrder(b, t, 'Telefonisch doorgegeven', me.name);
      if (r.ok) { db.orders.filter(o => o.ref === r.ref).forEach(o => { o.calledBy = me.name; o.calledAt = simNow().toISOString(); }); save(); }
      return r;
    },
    listLate(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const m = {};
      db.orders.filter(o => o.date === today() && (o.status === 'Te laat' || (o.status === 'Telefonisch doorgegeven' && o.calledAt))).forEach(o => { (m[o.ref] = m[o.ref] || { ref: o.ref, person: o.person, place: o.place, ts: o.ts, status: o.status, calledBy: o.calledBy, calledAt: o.calledAt, lines: [] }).lines.push(lineText(o)); });
      const c = {};
      db.orders.filter(o => o.date === today() && o.changePending).forEach(o => { const g = (c[o.ref] = c[o.ref] || { ref: o.ref, person: o.person, place: o.place, text: o.changeText, changedAt: o.changedAt, cancelled: true }); if (o.status !== 'Geannuleerd') g.cancelled = false; if ((o.changedAt || '') > (g.changedAt || '')) g.changedAt = o.changedAt; });
      return { ok: true, items: Object.values(m).sort((a, b) => b.ts.localeCompare(a.ts)), changes: Object.values(c).sort((a, b) => (b.changedAt || '').localeCompare(a.changedAt || '')) };
    },
    markCalled(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      db.orders.forEach(o => { if (o.ref === b.ref && o.status === 'Te laat') { o.status = 'Telefonisch doorgegeven'; o.calledBy = me.name; o.calledAt = simNow().toISOString(); } });
      save(); return { ok: true };
    },
    getMailPreview(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const all = todayOrders(); const sent = !!db.mail.sentAt;
      const mode = sent && b.mode === 'additions' ? 'additions' : 'all';
      const rows = mode === 'additions' ? all.filter(o => !o.sentAt) : all;
      const stuks = rows.reduce((s, o) => s + o.qty, 0);
      let html = mailHtml(rows);
      if (mode === 'additions') html = '<div style="font-family:Segoe UI,Arial,sans-serif;background:#FFF1E3;border:1px solid #F2C79B;padding:10px 12px;font-weight:700;color:#5A3510;margin-bottom:8px">AANVULLING op de bestelling van ' + new Date(db.mail.sentAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) + '. Alleen de regels hieronder zijn nieuw.</div>' + html;
      return { ok: true, auto: false, status: all.length === 0 ? 'empty' : (sent ? 'sent' : 'ready'), mode, sentAt: db.mail.sentAt, sentBy: db.mail.sentBy, additions: all.filter(o => !o.sentAt).length && sent ? all.filter(o => !o.sentAt).length : 0, subject: (mode === 'additions' ? 'AANVULLING: ' : '') + 'Bestelling Heli Wetteren, ' + simNow().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' }), to: db.settings.mailBroodjeszaak || '[nog in te vullen in Instellingen]', toMissing: !db.settings.mailBroodjeszaak, counts: { stuks, regels: rows.length, plaatsen: new Set(rows.map(r => r.place)).size }, html };
    },
    sendMail(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const all = todayOrders(); const rows = db.mail.sentAt && b.mode === 'additions' ? all.filter(o => !o.sentAt) : all;
      if (!rows.length) return fail('Er is niets om te verzenden.');
      const now = simNow().toISOString();
      rows.forEach(o => { o.sentAt = now; if (['Nieuw', 'Te laat'].includes(o.status)) o.status = 'Verstuurd'; });
      db.mail = { sentAt: db.mail.sentAt || now, sentBy: db.mail.sentBy || me.name }; save();
      return { ok: true, sentAt: now };
    },
    getSettings: (b, me) => me.admin ? { ok: true, settings: Object.assign({}, db.settings) } : fail('Geen toegang.', 'auth'),
    saveSettings(b, me) {
      if (!me.admin) return fail('Geen toegang.', 'auth');
      const v = b.values || {}, out = {}, em = x => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
      for (const k of ['mailBroodjeszaak', 'mailHR', 'mailBeheergroep', 'mailITSupport']) if (v[k] != null) { const x = String(v[k]).trim(); if (x && !em(x)) return fail('Dit is geen geldig e-mailadres: ' + x); out[k] = x; }
      for (const k of ['fitnessSurcharge', 'tokenPrice', 'lesgeverPrijs']) if (v[k] != null) { const n = Number(String(v[k]).replace(',', '.')); if (!(n >= 0 && n <= 100)) return fail('Dit is geen geldige prijs.'); out[k] = n; }
      if (v.closeTime != null) { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.closeTime)) return fail('Het uur moet er zo uitzien: 09:00.'); out.closeTime = v.closeTime; }
      Object.assign(db.settings, out); save(); return { ok: true };
    },
    listMenuAdmin: (b, me) => me.admin ? { ok: true, items: db.menu.map(m => ({ id: m.id, name: m.name, category: m.category, price: m.price, openPrice: m.openPrice, monthly: m.monthly, fitness: m.fitness, lesgevers: m.lesgevers, active: m.active !== false, order: m.order })) } : fail('Geen toegang.', 'auth'),
    saveMenuItem(b, me) {
      if (!me.admin) return fail('Geen toegang.', 'auth');
      const name = String(b.name || '').trim(); if (name.length < 2) return fail('Typ een naam voor het product.');
      if (!['Belegd broodje', 'Warm broodje', 'Salade', 'Gebak', 'Overig'].includes(b.category)) return fail('Kies een categorie.');
      let price = (b.price === '' || b.price == null) ? null : Number(String(b.price).replace(',', '.'));
      if (price != null && !(price >= 0 && price <= 100)) return fail('Dit is geen geldige prijs.');
      let m = b.id ? menuItem(b.id) : null; if (b.id && !m) return fail('Product niet gevonden.');
      if (db.menu.some(x => (!m || x.id !== m.id) && norm(x.name) === norm(name))) return fail('Er bestaat al een product met deze naam.');
      if (!m) { if (price == null && !b.lesgevers) return fail('Vul een prijs in.'); m = { id: 'm' + (++db.seq), order: db.menu.length, openPrice: false, monthly: false, description: '', priceMonth: '' }; db.menu.push(m); }
      else if (!m.openPrice && price == null && !b.lesgevers) return fail('Vul een prijs in.');
      Object.assign(m, { name, category: b.category, price: m.openPrice ? m.price : price, fitness: !!b.fitness, lesgevers: !!b.lesgevers, active: b.active !== false });
      save(); return { ok: true, id: m.id };
    },
    placeAssortment(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const persons = parseInt(b.persons, 10), per = Number(b.perPerson);
      if (!(persons >= 1 && persons <= 200)) return fail('Kies tussen 1 en 200 personen.');
      if (![1, 1.5, 2].includes(per)) return fail('Kies hoeveel broodjes per persoon.');
      if (!db.places.personeel.concat(db.places.lesgevers).includes(b.place)) return fail('Kies een leverplaats.');
      const date = String(b.date || today()), lim = new Date(simNow().getTime() + 60 * 86400000);
      const limS = lim.getFullYear() + '-' + pad(lim.getMonth() + 1) + '-' + pad(lim.getDate());
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today() || date > limS) return fail('Kies een dag vanaf vandaag, tot 60 dagen vooruit.');
      const time = b.time ? String(b.time) : ''; if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return fail('Het uur moet er zo uitzien: 11:30.');
      const ALLOWED = ['Wit', 'Bruin', 'Wraps', 'Vegetarisch', 'Zonder groenten', 'Zonder ei', 'Zonder vis', 'Glutenvrij'];
      const kinds = (Array.isArray(b.kinds) ? b.kinds : []).map(k => ({ name: String(k.name || ''), count: k.count ? parseInt(k.count, 10) : null }));
      if (kinds.some(k => !ALLOWED.includes(k.name) || (k.count != null && !(k.count >= 1 && k.count <= 400)))) return fail('Ongeldige keuze in het assortiment.');
      const total = Math.ceil(persons * per), ref = 'V' + (++db.seq), status = (date === today() && db.mail.sentAt) ? 'Te laat' : 'Nieuw';
      db.orders.push({ id: 'o' + (++db.seq), ref, personId: me.id, person: String(b.forWho || '').trim().slice(0, 80) || me.name, type: 'vergadering', place: b.place, date, menuId: '', product: 'Assortiment vergadering', category: 'Vergadering', soort: '', qty: total, remark: String(b.remark || '').slice(0, 300), unit: null, surcharge: 0, status, ts: simNow().toISOString(), by: me.name, sentAt: null, calledBy: '', calledAt: '', persons, kinds, time, perPerson: per });
      save(); return { ok: true, ref, total, status };
    },
    listAssortments(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      return { ok: true, items: db.orders.filter(o => o.type === 'vergadering' && o.date >= today() && o.status !== 'Geannuleerd').sort((a, b2) => a.date.localeCompare(b2.date)).map(o => ({ ref: o.ref, date: o.date, place: o.place, time: o.time, forWho: o.person, persons: o.persons, total: o.qty, kinds: o.kinds, remark: o.remark, status: o.status, sent: !!o.sentAt })) };
    },
    cancelAssortment(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const o = db.orders.find(x => x.ref === b.ref && x.type === 'vergadering'); if (!o) return fail('Niet gevonden.');
      if (o.sentAt) return fail('Dit assortiment is al naar de broodjeszaak gestuurd. Bel de broodjeszaak om het te annuleren.');
      o.status = 'Geannuleerd'; save(); return { ok: true };
    },
    monthReport(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const mo = /^\d{4}-\d{2}$/.test(b.month || '') && b.month <= monthOf() && b.month >= '2025-01' ? b.month : (b.month ? null : monthOf());
      if (!mo) return fail('Kies een geldige maand.');
      const MN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
      const per = {}; const get = id => { const p = db.persons.find(x => x.id === id) || { name: '?', type: 'personeel' }; return per[id] = per[id] || { id, name: p.name, type: p.type, items: 0, tokens: 0, total: 0, lines: [] }; };
      db.orders.filter(o => o.type !== 'vergadering' && o.status !== 'Geannuleerd' && o.date.slice(0, 7) === mo).forEach(o => { const p = get(o.personId); p.items += o.qty; p.total += rowTotal(o); p.lines.push({ date: o.date, text: lineText(o), price: o.unit == null ? null : rowTotal(o) }); });
      db.tokens.filter(t => !t.undone && t.date.slice(0, 7) === mo).forEach(t => { const p = get(t.personId); p.tokens += t.qty; p.total += t.qty * t.price; p.lines.push({ date: t.date, text: t.qty + ' jeton(s)', price: t.qty * t.price }); });
      const all = Object.values(per).map(p => Object.assign(p, { total: Math.round(p.total * 100) / 100, lines: p.lines.sort((x, y) => x.date.localeCompare(y.date)) })).sort((x, y) => x.name.localeCompare(y.name));
      const strip = p => ({ id: p.id, name: p.name, items: p.items, tokens: p.tokens, total: p.total, lines: p.lines });
      const pers = all.filter(p => p.type === 'personeel').map(strip), les = all.filter(p => p.type === 'lesgever').map(strip);
      const sum = l => Math.round(l.reduce((s, p) => s + p.total, 0) * 100) / 100;
      const rep = (db.hr || {})[mo];
      return { ok: true, month: mo, label: MN[+mo.slice(5) - 1] + ' ' + mo.slice(0, 4), personeel: pers, lesgevers: les, totals: { personeel: sum(pers), lesgevers: sum(les), all: sum(pers) + sum(les) },
        openPrices: db.orders.filter(o => o.type !== 'vergadering' && o.unit == null && o.status !== 'Geannuleerd' && o.date.slice(0, 7) === mo).length,
        sent: rep ? { sentAt: rep.sentAt, sentBy: rep.sentBy, total: rep.total } : null, hrConfigured: true, auto: false };
    },
    sendHr(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const r = H.monthReport(b, me); if (!r.ok) return r;
      if (r.openPrices > 0) return fail('Er staan nog ' + r.openPrices + ' prijzen open. Vul die eerst in bij Prijzen invullen.', 'prijzen');
      if (r.sent && !b.force) return fail('Dit overzicht is al verstuurd.', 'al_verzonden');
      db.hr = db.hr || {}; db.hr[r.month] = { sentAt: simNow().toISOString(), sentBy: me.name, total: r.totals.personeel }; save();
      return { ok: true, sentAt: db.hr[r.month].sentAt, total: r.totals.personeel, persons: r.personeel.length };
    },
    listOrders(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      let date = String(b.date || '').trim() || today();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) return fail('Kies een geldige datum.');
      if (!me.admin) date = today();
      if (date > today() || date < '2025-01-01') return fail('Kies een geldige datum.');
      const q = norm(b.q), m = {};
      db.orders.filter(o => o.date === date && o.type !== 'vergadering' && o.status !== 'Geannuleerd' && (!q || norm(o.person).includes(q))).forEach(o => {
        const g = (m[o.ref] = m[o.ref] || { ref: o.ref, person: o.person, personId: o.personId, type: o.type, place: o.place, ts: o.ts, status: o.status, communicated: false, pending: false, total: 0, lines: [] });
        const mi = menuItem(o.menuId); g.communicated = g.communicated || communicated(o); g.pending = g.pending || !!o.changePending; g.total += rowTotal(o);
        g.lines.push({ id: o.id, name: o.product, category: o.category, soort: o.soort, qty: o.qty, remark: o.remark, price: o.unit == null ? null : rowTotal(o), soorten: mi && mi.fitness ? (o.type === 'lesgever' ? ['wit', 'bruin'] : ['wit', 'bruin', 'fitness']) : [], other: !!(mi && mi.other) });
      });
      return { ok: true, date, canPickDate: !!me.admin, hrSent: hrSentFor(date), places: { personeel: db.places.personeel, lesgevers: db.places.lesgevers }, orders: Object.values(m).sort((a, b) => a.ts.localeCompare(b.ts)).slice(0, 200) };
    },
    editOrder(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const ref = String(b.ref || ''); const rows = db.orders.filter(o => o.ref === ref && o.type !== 'vergadering' && o.status !== 'Geannuleerd');
      if (!rows.length) return fail('Deze bestelling bestaat niet meer of is al geannuleerd.');
      const first = rows[0];
      if (!me.admin && first.date !== today()) return fail('Enkel een admin kan bestellingen van een andere dag aanpassen.');
      if (!Array.isArray(b.lines) || b.lines.length > 40) return fail('Ongeldige aanpassing.');
      const before = groupText(ref), comm = rows.some(communicated); let changed = false;
      const place = String(b.place || '').trim();
      if (place && place !== first.place) {
        const list = first.type === 'lesgever' ? db.places.lesgevers : db.places.personeel;
        if (!list.includes(place)) return fail('Kies een geldige leverplaats.');
        rows.forEach(o => { o.place = place; o.changedAt = simNow().toISOString(); }); changed = true;
      }
      for (const l of b.lines) {
        const o = rows.find(x => x.id === l.id); if (!o || o.status === 'Geannuleerd') return fail('Een regel van deze bestelling werd niet gevonden. Vernieuw het scherm.');
        const nq = parseInt(l.qty, 10); if (!(nq >= 0 && nq <= 20)) return fail('Kies een aantal van 0 tot 20.');
        if (nq === 0) { o.status = 'Geannuleerd'; o.changedAt = simNow().toISOString(); changed = true; continue; }
        const m = menuItem(o.menuId); let ns = o.soort;
        if (l.soort) { if (!(m && m.fitness)) return fail('Dit product heeft geen soort.'); if (!['wit', 'bruin', 'fitness'].includes(l.soort) || (l.soort === 'fitness' && o.type === 'lesgever')) return fail('Ongeldige soort.'); ns = l.soort; }
        const nr = 'remark' in l ? String(l.remark || '').trim().slice(0, 200) : o.remark;
        if (m && m.other && !nr) return fail('Typ wat er besteld wordt bij "Iets anders".');
        const sur = (o.type !== 'lesgever' && ns === 'fitness') ? db.settings.fitnessSurcharge : 0;
        if (nq !== o.qty || ns !== o.soort || nr !== o.remark || sur !== o.surcharge) { o.qty = nq; o.soort = ns; o.remark = nr; o.surcharge = sur; o.changedAt = simNow().toISOString(); changed = true; }
      }
      if (!changed) return fail('Er is niets gewijzigd.');
      const after = groupText(ref), cancelled = !db.orders.some(o => o.ref === ref && o.status !== 'Geannuleerd');
      if (comm) db.orders.filter(o => o.ref === ref).forEach(o => { o.changeText = (o.changePending ? o.changeText + ' | ' : '') + (cancelled ? 'Geannuleerd (' + me.name + '): ' + before : 'Gewijzigd (' + me.name + '): ' + before + ' → ' + after); o.changePending = true; });
      logChange(ref, first, me, me.admin ? 'admin' : 'beheerder', cancelled ? 'geannuleerd' : 'aangepast', before, after, comm, b.note);
      save(); return { ok: true, communicated: comm, cancelled, hrSent: hrSentFor(first.date) };
    },
    adminCancelOrder(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const o = db.orders.find(x => x.ref === b.ref && x.type !== 'vergadering' && x.status !== 'Geannuleerd');
      if (!o) return fail('Deze bestelling bestaat niet meer of is al geannuleerd.');
      if (!me.admin && o.date !== today()) return fail('Enkel een admin kan bestellingen van een andere dag annuleren.');
      const r = cancelGroup(b.ref, me, me.admin ? 'admin' : 'beheerder', b.note); save();
      return { ok: true, communicated: r.communicated, hrSent: r.hrSent };
    },
    markChangeCalled(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const rows = db.orders.filter(o => o.ref === b.ref && o.changePending); if (!rows.length) return fail('Hier is niets door te bellen.');
      const first = rows[0]; rows.forEach(o => { o.changePending = false; });
      logChange(b.ref, first, me, me.admin ? 'admin' : 'beheerder', 'doorgebeld', first.changeText, '', true, null); save(); return { ok: true };
    },
    changeLog(b, me) {
      if (!me.admin) return fail('Geen toegang.', 'auth');
      const days = Math.min(Math.max(parseInt(b.days, 10) || 30, 1), 365), q = norm(String(b.q || '').trim()), f = b.filter || 'alles', since = Date.now() - days * 86400000;
      const all = (db.orderLog || []).filter(e => new Date(e.ts).getTime() > since);
      const entries = all.slice().reverse().filter(e => (f === 'alles' || (f === 'naverzenden' && e.communicated && e.action !== 'doorgebeld') || (f === 'hr' && e.hrSent && e.action !== 'doorgebeld')) && (!q || norm(e.owner || '').includes(q) || norm(e.by).includes(q))).slice(0, 400)
        .map(e => ({ ts: e.ts, ref: e.ref, date: e.date, owner: e.owner, ownerType: e.ownerType, by: e.by, role: e.role, action: e.action, before: e.before, after: e.after, communicated: e.communicated, hrSent: e.hrSent, note: e.note }));
      const c = fn => all.filter(e => e.action !== 'doorgebeld' && fn(e)).length;
      return { ok: true, entries, summary: { total: c(() => true), cancelled: c(e => e.action === 'geannuleerd'), edited: c(e => e.action === 'aangepast'), afterSent: c(e => e.communicated), afterHr: c(e => e.hrSent), self: all.filter(e => e.role === 'zelf').length, staff: all.filter(e => e.role === 'beheerder').length, admin: all.filter(e => e.role === 'admin').length }, retentionMonths: 12, days };
    },
    listPersons(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const q = norm(b.q), now = Date.now();
      return { ok: true,
        persons: db.persons.filter(p => !q || norm(p.name).includes(q)).slice(0, 60).map(p => ({ id: p.id, name: p.name, type: p.type, actief: p.actief, hasCode: !!p.code, lockUntil: p.lockUntil > now ? new Date(p.lockUntil).toISOString() : null })),
        locked: db.persons.filter(p => p.lockUntil > now).sort((x, y) => x.lockUntil - y.lockUntil).map(p => ({ id: p.id, name: p.name, type: p.type, lockUntil: new Date(p.lockUntil).toISOString() })) };
    },
    unlock(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const p = person(b.targetId); if (!p) return fail('Persoon niet gevonden.');
      p.tries = 0; p.lockUntil = 0; logEvent(p, 'beheer', 'gedeblokkeerd', 0, 0, 'door ' + me.name); save();
      return { ok: true, name: p.name };
    },
    loginLog(b, me) {
      if (!me.admin) return fail('Geen toegang.', 'auth');
      const days = Math.min(Math.max(parseInt(b.days, 10) || 7, 1), 90), lim = Math.min(Math.max(parseInt(b.limit, 10) || 150, 10), 400);
      const onlyProblems = (b.filter || 'problemen') !== 'alles', q = norm(String(b.q || '').trim()), since = Date.now() - days * 86400000;
      const all = (db.loginLog || []).slice().reverse();
      const entries = all.filter(e => new Date(e.ts).getTime() > since && (!onlyProblems || e.result !== 'ok') && (!q || norm(e.person || '').includes(q))).slice(0, lim)
        .map(e => ({ ts: e.ts, person: e.person || '(onbekend)', type: e.type, via: e.via, result: e.result, tries: e.tries, lockUntil: e.lockUntil, ip: e.ip, device: e.device, note: e.note }));
      const today = all.filter(e => new Date(e.ts).toDateString() === new Date().toDateString());
      const c = r => today.filter(e => e.result === r).length;
      return { ok: true, entries, today: { ok: today.filter(e => e.result === 'ok' && e.via === 'login').length, wrongCode: c('fout_code'), blocked: c('geblokkeerd'), unlocked: c('gedeblokkeerd'), people: new Set(today.filter(e => e.result !== 'ok' && e.personId).map(e => e.personId)).size }, retentionDays: 90, days };
    },
    resetCode(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const p = person(b.targetId); if (!p) return fail('Persoon niet gevonden.');
      let c = '';
      if (b.code) { const e = codeError(p.type, b.code); if (e) return fail(e); c = String(b.code); }
      else c = genCode(p.type);
      p.code = c; p.tries = 0; p.lockUntil = 0; save(); return { ok: true, code: c };
    },
    changeOwnCode(b, me) {
      const e = codeError(me.type, b.newCode); if (e) return fail(e);
      me.code = String(b.newCode); me.tries = 0; save(); return { ok: true };
    },
    bulkCodes(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const list = db.persons.filter(p => p.actief && !p.code);
      list.forEach(p => { p.code = genCode(p.type); p.tries = 0; p.lockUntil = 0; });
      save(); return { ok: true, items: list.map(p => ({ name: p.name, type: p.type, code: p.code })) };
    },
    setActive(b, me) { if (!me.beheer) return fail('Geen toegang.', 'auth'); const p = person(b.targetId); if (p) p.actief = !!b.actief; save(); return { ok: true }; },
    addPerson(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const name = String(b.name || '').trim(); if (name.length < 2) return fail('Typ een naam.');
      const type = b.type === 'lesgever' ? 'lesgever' : 'personeel'; let c = '';
      if (b.code) { const e = codeError(type, b.code); if (e) return fail(e); c = String(b.code); }
      else c = genCode(type);
      db.persons.push({ id: 'p' + (++db.seq), name, type, beheer: false, admin: false, actief: true, code: c, tries: 0, lockUntil: 0 }); save(); return { ok: true, code: c };
    }
  };
  const PUBLIC = ['ping', 'findPerson', 'login', 'getState'];
  window.DemoApi = {
    async handle(body) {
      load();
      await new Promise(r => setTimeout(r, 120));
      const fn = H[body.action];
      if (!fn) return fail('Onbekende actie.');
      if (PUBLIC.includes(body.action)) return fn(body);
      const me = who(body.auth);
      if (!me) return fail('Je bent niet ingelogd.', 'auth');
      return fn(body, me);
    },
    reset() { localStorage.removeItem(KEY); },
    setClock(hhmm) {
      if (!hhmm) { localStorage.removeItem(CLK); return; }
      const [h, m] = hhmm.split(':').map(Number);
      localStorage.setItem(CLK, JSON.stringify({ h, m, setAt: Date.now() }));
    },
    getClock() { const d = simNow(); return { fixed: !!localStorage.getItem(CLK), text: pad(d.getHours()) + ':' + pad(d.getMinutes()) }; }
  };
})();
