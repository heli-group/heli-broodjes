// ============================================================
//  TESTMODUS: doet alsof er een flow is. Gegevens blijven in deze browser.
//  Dit bestand beschrijft ook precies wat de echte flow moet antwoorden.
//  Testcodes (alleen in de testmodus):
//    Davy van de Velde (personeel)   code 1234
//    Khaled (lesgever)               code 123456
//    Jeffrey (beheerder)             code 1111
//  Extra: voeg ?open=0 toe aan het webadres om "na 9u" te testen.
// ============================================================
(function () {
  const KEY = 'bj_demo_v1';
  const pad = n => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const monthOf = () => today().slice(0, 7);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const MENU = [
    ['Prépare','Belegd broodje',5],['Martino','Belegd broodje',5],['Smos','Belegd broodje',5],['Kaas','Belegd broodje',5],['Hesp','Belegd broodje',5],['Bicky','Belegd broodje',5],['Tonijn','Belegd broodje',5.5],['Tonijntino','Belegd broodje',5.5],['Tropical','Belegd broodje',5],['Krabsalade','Belegd broodje',5.5],['Vleessalade','Belegd broodje',5],['Kip curry','Belegd broodje',5],['Gezond','Belegd broodje',4.5],['Veggiesalade','Belegd broodje',4.5],['Kip curry tropical','Belegd broodje',5],['Zalmsalade','Belegd broodje',6.5],['Gerookte zalm tartare','Belegd broodje',6.5],['Préparé tartare','Belegd broodje',5],['Briek','Belegd broodje',5.5],['Brie, honing, walnoten','Belegd broodje',5.5],['Italia, serrano, mozarella','Belegd broodje',6.5],['Broodje gebakken kip','Belegd broodje',5.5],['Broodje Breydelspek special','Belegd broodje',6],['Broodje van de maand','Belegd broodje',null],['Boulet Briek','Belegd broodje',null],['Veggie','Belegd broodje',null],
    ['Flaguette breydelham','Warm broodje',6.5],['Flaguette kip pepersaus','Warm broodje',6.5],['Flaguette omelet brieks','Warm broodje',6.5],['Panini kip pesto','Warm broodje',8],['Panini kaas & ham','Warm broodje',6],['Panini tropical','Warm broodje',6],['Panini bicky','Warm broodje',7],['Panini italia','Warm broodje',7],
    ['Salade kip','Salade',12],['Salade tomaat & mozarella','Salade',12],['Salade tonijn','Salade',12],['Salade gerookte zalm','Salade',13.5],['Ceasar salad','Salade',12],['Slaatje americain','Salade',12],['Poké bowl sweet chicken','Salade',13.5],['Poké bowl spicy chicken','Salade',13.5],['Poké bowl salmon style','Salade',14.5],['Salade van de maand','Salade',null],
    ['Penne bolognaise','Overig',10],['Andere','Overig',null],
    ['Worstenbroodje','Gebak',2.4],['Donut','Gebak',2],['Appelflap','Gebak',2.8],['Appelschijfje','Gebak',2.8],['Appeltaart','Gebak',3.3],['Frangipane','Gebak',2.8],['Mattetaart','Gebak',3],['Flantaart','Gebak',3.1],['Eclair','Gebak',2.8],['Carré confituur','Gebak',2.8],['Kriekentaartje','Gebak',2.8],['Rabarbercake','Gebak',2.8],['Rijsttaartje','Gebak',2.8],['Rijstvlaai','Gebak',3],['Broodpudding','Gebak',2]
  ];
  const LES = ['Hesp','Kaas','Smos','Prépare','Tonijn','Kip curry','Boulet Briek','Veggie'];
  const OPEN_PRICE = ['Andere', 'Broodje van de maand', 'Salade van de maand'];

  function seed() {
    return {
      seq: 100,
      settings: { fitnessSurcharge: 0.5, tokenPrice: 0.8, lesgeverPrijs: 3.6, closeTime: '09:00' },
      places: {
        personeel: ['Kantoor', 'Magazijn', 'Management'],
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
        { id: 'p9', name: 'Lies', type: 'personeel', beheer: true, actief: true, code: '1111' }
      ].map(p => Object.assign({ tries: 0, lockUntil: 0 }, p)),
      menu: MENU.map((m, i) => ({
        id: 'm' + (i + 1), name: m[0], category: m[1], price: m[2], order: i,
        openPrice: OPEN_PRICE.includes(m[0]), fitness: m[1] === 'Belegd broodje',
        lesgevers: LES.includes(m[0]), description: '', priceMonth: ''
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
  const qs = () => new URLSearchParams(location.search);
  const isOpen = () => qs().get('open') !== '0';
  const state = () => {
    const d = new Date(); const [hh, mm] = db.settings.closeTime.split(':').map(Number);
    const c = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
    if (c < d) c.setDate(c.getDate() + 1);
    return { open: isOpen(), now: d.toISOString(), closesAt: c.toISOString() };
  };
  const fail = (message, error) => ({ ok: false, message, error: error || 'fout' });
  const person = id => db.persons.find(p => p.id === id);
  const menuItem = id => db.menu.find(m => m.id === id);
  function who(auth) {
    if (!auth) return null;
    const p = person(auth.id);
    return p && p.actief && p.code === auth.code ? p : null;
  }
  const pub = p => ({ id: p.id, name: p.name, type: p.type, beheer: p.beheer });
  function menuFor(p) {
    let items = db.menu.slice();
    if (!p.beheer) {
      items = p.type === 'lesgever' ? items.filter(m => m.lesgevers) : items.filter(m => m.price != null || m.openPrice);
    }
    return items.map(m => ({ id: m.id, name: m.name, category: m.category, price: effPrice(m), openPrice: m.openPrice && effPrice(m) == null, fitness: m.fitness, lesgevers: m.lesgevers, description: m.description, order: m.order }));
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
      let unit, st = status || (mailSent ? 'Te laat' : 'Nieuw');
      if (owner.type === 'lesgever') unit = db.settings.lesgeverPrijs;
      else { unit = effPrice(m); if (unit == null) { if (!m.openPrice) return fail('Dit product is niet beschikbaar.'); st = status || 'Prijs te bepalen'; } }
      const row = { id: 'o' + (++db.seq), ref, personId: owner.id, person: owner.name, type: owner.type, place: body.place || '', date: today(), menuId: m.id, product: m.name, category: m.category, soort, qty, remark: String(l.remark || '').slice(0, 200), unit, surcharge: (owner.type !== 'lesgever' && soort === 'fitness') ? db.settings.fitnessSurcharge : 0, status: st, ts: new Date().toISOString(), by: by || '', sentAt: null, calledBy: '', calledAt: '' };
      db.orders.push(row); out.push(row);
    }
    save();
    return { ok: true, ref, sentAt: new Date().toISOString(), status: out[0].status };
  }
  const todayOrders = () => db.orders.filter(o => o.date === today() && o.status !== 'Geannuleerd');
  const rowTotal = o => o.unit == null ? 0 : (o.unit + o.surcharge) * o.qty;
  const lineText = o => `${o.qty}x ${soortLabel(o.category, o.soort)} ${o.product}${o.remark ? ' (' + o.remark + ')' : ''}`.replace(/\s+/g, ' ').trim();

  function mailHtml(rows) {
    const th = 'border:1px solid #8A8A8A;padding:6px 10px;background:#F0F0F0';
    const td = 'border:1px solid #8A8A8A;padding:6px 10px;vertical-align:top';
    const col = { 'Belegd broodje': 2, 'Warm broodje': 3, 'Salade': 4, 'Gebak': 5, 'Overig': 6 };
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
      if (!p || !p.actief) return fail('Dit account is niet actief.');
      if (p.lockUntil > Date.now()) return fail('Te veel foute pogingen. Probeer over ' + Math.ceil((p.lockUntil - Date.now()) / 60000) + ' minuten opnieuw.');
      if (p.code !== String(b.code)) {
        p.tries++; if (p.tries >= 5) { p.lockUntil = Date.now() + 15 * 60000; p.tries = 0; save(); return fail('Te veel foute pogingen. Probeer over 15 minuten opnieuw.'); }
        save(); return fail('Dat is niet de juiste code. Probeer opnieuw.');
      }
      p.tries = 0; save();
      return { ok: true, person: pub(p) };
    },
    getState: () => ({ ok: true, state: state() }),
    getMenu(b, me) { return { ok: true, menu: menuFor(me), places: db.places, settings: { fitnessSurcharge: db.settings.fitnessSurcharge, tokenPrice: db.settings.tokenPrice }, state: state() }; },
    placeOrder(b, me) {
      if (!isOpen() && !me.beheer) return fail('Het bestellen is gesloten voor vandaag.');
      return writeOrder(b, me, null, me.name);
    },
    myOrders(b, me) {
      const mine = db.orders.filter(o => o.personId === me.id && o.status !== 'Geannuleerd');
      const group = rows => { const m = {}; rows.forEach(o => { (m[o.ref] = m[o.ref] || { ref: o.ref, place: o.place, ts: o.ts, status: o.status, lines: [], total: 0, ids: [] }); m[o.ref].lines.push({ text: lineText(o), price: o.unit == null ? null : rowTotal(o) }); m[o.ref].total += rowTotal(o); m[o.ref].ids.push(o.id); }); return Object.values(m); };
      const todays = mine.filter(o => o.date === today());
      const toks = db.tokens.filter(t => t.personId === me.id && t.date.slice(0, 7) === monthOf() && !t.undone);
      const monthRows = mine.filter(o => o.date.slice(0, 7) === monthOf());
      const earlier = monthRows.filter(o => o.date !== today()).map(o => ({ date: o.date, text: lineText(o), price: o.unit == null ? null : rowTotal(o) }))
        .concat(toks.filter(t => t.date !== today()).map(t => ({ date: t.date, text: t.qty + ' jeton(s)', price: t.qty * t.price })));
      earlier.sort((a, b) => b.date.localeCompare(a.date));
      const total = monthRows.reduce((s, o) => s + rowTotal(o), 0) + toks.reduce((s, t) => s + t.qty * t.price, 0);
      return { ok: true, today: group(todays).map(g => Object.assign(g, { canCancel: isOpen() && g.status === 'Nieuw' })), monthTotal: total, earlier, openPrices: monthRows.filter(o => o.unit == null).length };
    },
    cancelOrder(b, me) {
      if (!isOpen()) return fail('Annuleren kan niet meer na 9u.');
      let n = 0; db.orders.forEach(o => { if (o.personId === me.id && o.date === today() && o.status === 'Nieuw' && (b.ids || []).includes(o.id)) { o.status = 'Geannuleerd'; n++; } });
      save(); return n ? { ok: true } : fail('Deze bestelling kan niet geannuleerd worden.');
    },
    adminOverview(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const mo = db.menu.filter(m => m.openPrice && m.priceMonth !== monthOf()).length;
      const rows = todayOrders();
      return { ok: true, state: state(), mail: { status: rows.length === 0 ? 'empty' : (db.mail.sentAt ? 'sent' : 'ready'), sentAt: db.mail.sentAt, sentBy: db.mail.sentBy, additions: rows.filter(o => !o.sentAt).length && db.mail.sentAt ? rows.filter(o => !o.sentAt).length : 0 }, counts: { monthProducts: mo, openPrices: db.orders.filter(o => o.status === 'Prijs te bepalen' || (o.unit == null && o.status !== 'Geannuleerd')).length, toCall: db.orders.filter(o => o.status === 'Te laat').length } };
    },
    giveTokens(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const t = person(b.targetId); const q = parseInt(b.qty, 10);
      if (!t || !(q >= 1 && q <= 20)) return fail('Kies een persoon en een aantal.');
      db.tokens.push({ id: 't' + (++db.seq), personId: t.id, name: t.name, qty: q, price: db.settings.tokenPrice, date: today(), ts: new Date().toISOString(), by: me.name, undone: false });
      save(); return { ok: true };
    },
    listTokens: (b, me) => me.beheer ? { ok: true, tokens: db.tokens.filter(t => !t.undone).slice(-6).reverse().map(t => ({ id: t.id, name: t.name, qty: t.qty, ts: t.ts, by: t.by })) } : fail('Geen toegang.', 'auth'),
    undoToken(b, me) { if (!me.beheer) return fail('Geen toegang.', 'auth'); const t = db.tokens.find(x => x.id === b.id); if (t) t.undone = true; save(); return { ok: true }; },
    getMonthProducts(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      return { ok: true, items: db.menu.filter(m => m.openPrice && m.name !== 'Andere').map(m => ({ menuId: m.id, name: m.name, description: m.description, price: m.price, ok: m.priceMonth === monthOf() })) };
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
      return { ok: true, items: db.orders.filter(o => o.unit == null && o.status !== 'Geannuleerd').map(o => ({ id: o.id, person: o.person, date: o.date, text: lineText(o) })) };
    },
    savePrice(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const o = db.orders.find(x => x.id === b.id); const price = Number(b.price);
      if (!o || !(price >= 0) || price > 100) return fail('Vul een geldige prijs in.');
      o.unit = price; if (o.status === 'Prijs te bepalen') o.status = 'Nieuw'; save(); return { ok: true };
    },
    addLateOrder(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const t = person(b.targetId); if (!t) return fail('Kies eerst een persoon.');
      const r = writeOrder(b, t, 'Telefonisch doorgegeven', me.name);
      if (r.ok) { db.orders.filter(o => o.ref === r.ref).forEach(o => { o.calledBy = me.name; o.calledAt = new Date().toISOString(); }); save(); }
      return r;
    },
    listLate(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const m = {};
      db.orders.filter(o => o.date === today() && (o.status === 'Te laat' || (o.status === 'Telefonisch doorgegeven' && o.calledAt))).forEach(o => { (m[o.ref] = m[o.ref] || { ref: o.ref, person: o.person, place: o.place, ts: o.ts, status: o.status, calledBy: o.calledBy, calledAt: o.calledAt, lines: [] }).lines.push(lineText(o)); });
      return { ok: true, items: Object.values(m).sort((a, b) => b.ts.localeCompare(a.ts)) };
    },
    markCalled(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      db.orders.forEach(o => { if (o.ref === b.ref && o.status === 'Te laat') { o.status = 'Telefonisch doorgegeven'; o.calledBy = me.name; o.calledAt = new Date().toISOString(); } });
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
      return { ok: true, status: all.length === 0 ? 'empty' : (sent ? 'sent' : 'ready'), mode, sentAt: db.mail.sentAt, sentBy: db.mail.sentBy, additions: all.filter(o => !o.sentAt).length && sent ? all.filter(o => !o.sentAt).length : 0, subject: (mode === 'additions' ? 'AANVULLING: ' : '') + 'Bestelling Heli Wetteren, ' + new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' }), to: '[e-mail broodjeszaak]', counts: { stuks, regels: rows.length, plaatsen: new Set(rows.map(r => r.place)).size }, html };
    },
    sendMail(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const all = todayOrders(); const rows = db.mail.sentAt && b.mode === 'additions' ? all.filter(o => !o.sentAt) : all;
      if (!rows.length) return fail('Er is niets om te verzenden.');
      const now = new Date().toISOString();
      rows.forEach(o => { o.sentAt = now; if (['Nieuw', 'Te laat'].includes(o.status)) o.status = 'Verstuurd'; });
      db.mail = { sentAt: db.mail.sentAt || now, sentBy: db.mail.sentBy || me.name }; save();
      return { ok: true, sentAt: now };
    },
    listPersons(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const q = norm(b.q);
      return { ok: true, persons: db.persons.filter(p => !q || norm(p.name).includes(q)).slice(0, 40).map(p => ({ id: p.id, name: p.name, type: p.type, actief: p.actief })) };
    },
    resetCode(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const p = person(b.targetId); if (!p) return fail('Persoon niet gevonden.');
      const len = p.type === 'lesgever' ? 6 : 4; let c = ''; for (let i = 0; i < len; i++) c += Math.floor(Math.random() * 10);
      p.code = c; p.tries = 0; p.lockUntil = 0; save(); return { ok: true, code: c };
    },
    setActive(b, me) { if (!me.beheer) return fail('Geen toegang.', 'auth'); const p = person(b.targetId); if (p) p.actief = !!b.actief; save(); return { ok: true }; },
    addPerson(b, me) {
      if (!me.beheer) return fail('Geen toegang.', 'auth');
      const name = String(b.name || '').trim(); if (name.length < 2) return fail('Typ een naam.');
      const type = b.type === 'lesgever' ? 'lesgever' : 'personeel'; let c = ''; for (let i = 0; i < (type === 'lesgever' ? 6 : 4); i++) c += Math.floor(Math.random() * 10);
      db.persons.push({ id: 'p' + (++db.seq), name, type, beheer: false, actief: true, code: c, tries: 0, lockUntil: 0 }); save(); return { ok: true, code: c };
    }
  };
  const PUBLIC = ['ping', 'findPerson', 'login'];
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
    reset() { localStorage.removeItem(KEY); }
  };
})();
