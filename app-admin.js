(function () {
  'use strict';
  const C = window.__bjCore;
  const { h, mount, frame, go, api, act, notify, stepper, eur, hhmm, typeLabel, parsePrice, S, VIEWS } = C;
  const page = (title, ...kids) => { if (!S.session) return; mount(frame(h('section', {}, h('h1', {}, title), ...kids), { back: () => go('home') })); };
  const loading = title => page(title, h('p', { class: 'muted' }, 'Even laden…'));
  const dateShort = d => d.slice(8) + '/' + d.slice(5, 7);

  function personPicker(onPick, type) {
    let timer;
    const res = h('div', { class: 'namegrid' });
    const input = h('input', { class: 'field', type: 'search', autocomplete: 'off', placeholder: 'Typ de eerste letters van de naam', 'aria-label': 'Zoek een naam', oninput: e => {
      clearTimeout(timer); const q = e.target.value.trim();
      timer = setTimeout(async () => {
        if (q.length < 2) { res.replaceChildren(); return; }
        try { const r = await api('findPerson', { q, type: type || '' });
          res.replaceChildren(...(r.persons.length ? r.persons.map(p => h('button', { class: 'person', onclick: () => onPick(p) }, p.name, h('small', {}, typeLabel(p.type)))) : [h('p', { class: 'muted' }, 'Geen naam gevonden.')]));
        } catch (e2) { notify(e2.message, 'err'); }
      }, 250);
    } });
    return h('div', {}, input, res);
  }
  function bulkModal(items) {
    const m = h('div', { class: 'modal' }, h('div', { class: 'card printarea', style: 'text-align:left;max-width:640px;max-height:90vh;overflow:auto' }, h('h2', {}, 'Nieuwe codes (' + items.length + ')'),
      h('p', { class: 'muted' }, 'Deze lijst wordt maar één keer getoond. Druk hem af en geef elke code persoonlijk door. Bewaar de lijst niet.'),
      h('table', { class: 'codes' }, items.map(i => h('tr', {}, h('td', {}, i.name), h('td', { class: 'bigmono' }, i.code)))),
      h('div', { class: 'tools noprint' }, h('button', { class: 'btn', onclick: () => { if (window.print) window.print(); } }, 'Afdrukken'), h('button', { class: 'btn sec', onclick: () => m.remove() }, 'Sluiten'))));
    document.body.append(m);
  }
  function codeModal(name, code) {
    const m = h('div', { class: 'modal' }, h('div', { class: 'card' }, h('h2', {}, 'Nieuwe code voor ' + name), h('div', { class: 'bigcode' }, code),
      h('p', { class: 'muted' }, 'Geef deze code door aan de persoon. Hij wordt maar één keer getoond. Daarna kan niemand hem nog opvragen.'),
      h('button', { class: 'btn', onclick: () => m.remove() }, 'Ik heb de code genoteerd')));
    document.body.append(m);
  }

  function customCodeModal(p, done) {
    let v = '';
    const m = h('div', { class: 'modal' }, h('div', { class: 'card' }, h('h2', {}, 'Eigen code voor ' + p.name),
      h('p', { class: 'muted' }, (p.type === 'lesgever' ? '6 tot 8 cijfers' : '4 tot 8 cijfers') + '. Niet 1234, 4321 of vier keer hetzelfde cijfer.'),
      h('input', { class: 'field', type: 'text', inputmode: 'numeric', maxlength: '8', autocomplete: 'off', 'aria-label': 'Eigen code', oninput: e => { v = e.target.value; } }),
      h('div', { class: 'tools', style: 'justify-content:center' },
        h('button', { class: 'btn', onclick: e => act(e.currentTarget, async () => { await api('resetCode', { targetId: p.id, code: v }); m.remove(); codeModal(p.name, v); if (done) done(); }) }, 'Opslaan'),
        h('button', { class: 'btn sec', onclick: () => m.remove() }, 'Annuleren'))));
    document.body.append(m); m.querySelector('input').focus();
  }

  const CATS = ['Belegd broodje', 'Warm broodje', 'Salade', 'Gebak', 'Overig'];
  const check = (label, checked, onchange, disabled) => h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: checked ? true : null, disabled: disabled ? true : null, onchange: e => onchange(e.target.checked) }), label);
  async function reloadMenu() { const m = await api('getMenu'); S.menu = m.menu; S.settings = m.settings; S.places = m.places; }

  function editMenuItem(item, done) {
    const F = item ? { id: item.id, name: item.name, category: item.category, price: item.price == null ? '' : String(item.price).replace('.', ','), fitness: item.fitness, lesgevers: item.lesgevers, active: item.active }
      : { id: null, name: '', category: 'Belegd broodje', price: '', fitness: true, lesgevers: false, active: true };
    const fixed = item && item.openPrice;
    const m = h('div', { class: 'modal' });
    const body = () => {
      m.replaceChildren(h('div', { class: 'card', style: 'text-align:left' }, h('h2', {}, item ? 'Product wijzigen' : 'Nieuw product'),
        h('label', {}, 'Naam', h('input', { class: 'field', value: F.name, oninput: e => { F.name = e.target.value; } })),
        h('label', {}, 'Categorie', h('select', { class: 'field', onchange: e => { F.category = e.target.value; F.fitness = F.category === 'Belegd broodje'; body(); } }, CATS.map(c => h('option', { value: c, selected: c === F.category ? true : null }, c)))),
        h('label', {}, 'Prijs (€)', h('input', { class: 'field', inputmode: 'decimal', value: fixed ? '' : F.price, disabled: fixed ? true : null, placeholder: fixed ? 'Wisselt, wordt ingevuld bij Maandproducten of Prijzen invullen' : 'bv. 5,50', oninput: e => { F.price = e.target.value; } })),
        F.category === 'Belegd broodje' ? check('Je kan wit, bruin of fitness kiezen (fitness kost extra)', F.fitness, v => { F.fitness = v; }) : null,
        check('Ook beschikbaar voor lesgevers (zij betalen de vaste prijs)', F.lesgevers, v => { F.lesgevers = v; }),
        check('Actief (zichtbaar voor iedereen)', F.active, v => { F.active = v; }),
        h('p', { class: 'muted' }, 'Een nieuwe prijs geldt vanaf nu. Bestaande bestellingen behouden hun prijs.'),
        h('div', { class: 'tools', style: 'justify-content:center' },
          h('button', { class: 'btn', onclick: e => act(e.currentTarget, async () => { await api('saveMenuItem', F); await reloadMenu(); m.remove(); notify('Opgeslagen.', 'ok'); if (done) done(); }) }, 'Opslaan'),
          h('button', { class: 'btn sec', onclick: () => m.remove() }, 'Annuleren'))));
    };
    body(); document.body.append(m);
  }
  VIEWS.menu = async function viewMenu() {
    loading('Menu en prijzen');
    const r = await api('listMenuAdmin');
    const blocks = CATS.map(c => {
      const items = r.items.filter(i => i.category === c).sort((a, b) => a.order - b.order);
      if (!items.length) return null;
      return h('div', { class: 'card' }, h('h2', {}, c), items.map(i => h('div', { class: 'row2' },
        h('span', {}, h('b', {}, i.name), ' ', i.active ? null : h('span', { class: 'chip grey' }, 'Niet actief'), ' ', i.lesgevers ? h('span', { class: 'chip ok' }, 'Lesgevers') : null, ' ', i.monthly ? h('span', { class: 'chip warn' }, 'Maandproduct') : null),
        h('span', { class: 'tools' }, h('b', {}, i.openPrice ? 'wisselt' : (i.price == null ? '—' : eur(i.price))), h('button', { class: 'btn sec small', onclick: () => editMenuItem(i, () => VIEWS.menu()) }, 'Wijzig')))));
    });
    page('Menu en prijzen', h('p', { class: 'muted' }, 'Hier beheer je de producten en hun prijzen. Een product dat je niet meer aanbiedt, zet je op niet actief. Verwijderen kan niet, zodat oude bestellingen kloppen. De prijs van het Broodje en de Salade van de maand vul je in bij Maandproducten invullen.'),
      h('p', {}, h('button', { class: 'btn', onclick: () => editMenuItem(null, () => VIEWS.menu()) }, '+ Nieuw product')), ...blocks);
  };
  VIEWS.instellingen = async function viewInstellingen() {
    loading('Instellingen');
    const r = await api('getSettings'); const v = Object.assign({}, r.settings); const edit = {};
    const inp = (k, label, hint, kind) => h('label', {}, label, h('input', { class: 'field', inputmode: kind === 'num' ? 'decimal' : null, value: kind === 'num' ? String(v[k]).replace('.', ',') : (v[k] || ''), placeholder: hint, oninput: e => { edit[k] = e.target.value; } }));
    page('Instellingen', h('div', { class: 'two' },
      h('div', { class: 'card' }, h('h2', {}, 'E-mailadressen'),
        inp('mailBroodjeszaak', 'Broodjeszaak (hier gaat de bestelling naartoe)', 'naam@broodjeszaak.be'),
        inp('mailHR', 'HR (maandoverzicht)', 'naam@heli.be'),
        inp('mailBeheergroep', 'Broodjes-beheergroep (meldingen)', 'groep@heli.be'),
        inp('mailITSupport', 'IT-support (altijd in kopie)', 'ITSupport@heli.be'),
        h('p', { class: 'muted' }, 'Tijdens de proefweek zet je bij "Broodjeszaak" je eigen adres. Zo ziet alleen jij de mail.')),
      h('div', { class: 'card' }, h('h2', {}, 'Prijzen en uur'),
        inp('tokenPrice', 'Prijs per jeton (€)', '0,80', 'num'), inp('fitnessSurcharge', 'Toeslag per fitnessbroodje (€)', '0,50', 'num'),
        inp('lesgeverPrijs', 'Vaste prijs per broodje voor lesgevers (€)', '3,60', 'num'),
        inp('closeTime', 'Uur waarop het bestellen sluit', '09:00'))),
      h('p', {}, h('button', { class: 'btn big', onclick: e => act(e.currentTarget, async () => {
        if (!Object.keys(edit).length) { notify('Er is niets gewijzigd.', 'err'); return; }
        await api('saveSettings', { values: edit }); await reloadMenu(); notify('Opgeslagen.', 'ok'); VIEWS.instellingen();
      }) }, 'Opslaan')));
  };

  // ----- assortiment voor een vergadering -----
  const KINDS = ['Wit', 'Bruin', 'Wraps', 'Vegetarisch', 'Zonder groenten', 'Zonder ei', 'Zonder vis', 'Glutenvrij'];
  const kindsLabel = ks => (ks || []).map(k => k.name + (k.count ? ' (' + k.count + ')' : '')).join(', ') || 'naar keuze van de broodjeszaak';
  const dateNL = d => d.slice(8) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4);
  VIEWS.assortiment = async function viewAssortiment() {
    const A = S.assort || (S.assort = { date: C.todayISO(), place: '', time: '', forWho: '', persons: 10, per: 1, kinds: {}, remark: '' });
    const places = [...new Set([...(S.places.personeel || []), ...(S.places.lesgevers || [])])];
    let list = []; try { list = (await api('listAssortments')).items; } catch (e) { if (e.message === 'auth') return; }
    const refresh = () => VIEWS.assortiment();
    const total = Math.ceil(A.persons * A.per);
    const maxD = new Date(C.nowServer().getTime() + 60 * 86400000); const maxS = maxD.getFullYear() + '-' + String(maxD.getMonth() + 1).padStart(2, '0') + '-' + String(maxD.getDate()).padStart(2, '0');
    const selected = Object.keys(A.kinds);
    const summaryKinds = kindsLabel(selected.map(n => ({ name: n, count: A.kinds[n] })));
    const form = h('div', { class: 'card' },
      h('div', { class: 'two' },
        h('label', {}, 'Voor welke dag?', h('input', { class: 'field', type: 'date', min: C.todayISO(), max: maxS, value: A.date, onchange: e => { if (e.target.value) { A.date = e.target.value; refresh(); } } })),
        h('label', {}, 'Leverplaats', h('select', { class: 'field', onchange: e => { A.place = e.target.value; refresh(); } }, h('option', { value: '' }, 'Kies de plaats'), places.map(p => h('option', { value: p, selected: p === A.place ? true : null }, p))))),
      h('div', { class: 'two' },
        h('label', {}, 'Uur (optioneel)', h('input', { class: 'field', type: 'time', value: A.time, onchange: e => { A.time = e.target.value; } })),
        h('label', {}, 'Voor welke vergadering of wie?', h('input', { class: 'field', value: A.forWho, placeholder: 'bv. Directievergadering', oninput: e => { A.forWho = e.target.value; } }))),
      h('h2', {}, 'Hoeveel personen?'),
      h('div', { style: 'text-align:center' }, stepper(A.persons, 1, 200, v => { A.persons = v; refresh(); }, null, true)),
      h('div', { class: 'chips', style: 'justify-content:center' }, [5, 8, 10, 12, 15, 20, 25, 30].map(n => h('button', { class: 'chipbtn' + (A.persons === n ? ' on' : ''), onclick: () => { A.persons = n; refresh(); } }, String(n)))),
      h('h2', {}, 'Hoeveel broodjes per persoon?'),
      h('div', { class: 'seg' }, [[1, '1'], [1.5, '1,5'], [2, '2']].map(([v, l]) => h('button', { class: A.per === v ? 'on' : '', onclick: () => { A.per = v; refresh(); } }, l))),
      h('h2', {}, 'Waaruit moet het assortiment bestaan?'),
      h('p', { class: 'muted' }, 'Tik aan wat erbij hoort. Je kan bij elke keuze een aantal opgeven. Zonder aantal beslist de broodjeszaak.'),
      h('div', { class: 'chips' }, KINDS.map(k => h('button', { class: 'chipbtn' + (A.kinds[k] != null ? ' on' : ''), onclick: () => { if (A.kinds[k] == null) A.kinds[k] = 0; else delete A.kinds[k]; refresh(); } }, k))),
      selected.length ? h('div', {}, selected.map(k => h('div', { class: 'row2' }, h('b', {}, k), h('span', { class: 'tools' }, 'Hoeveel? ', stepper(A.kinds[k], 0, Math.max(total, 1), v => { A.kinds[k] = v; refresh(); }), A.kinds[k] === 0 ? h('small', {}, 'naar keuze') : null)))) : null,
      h('label', {}, 'Andere wensen (optioneel)', h('input', { class: 'field', value: A.remark, placeholder: 'bv. 2 broodjes zonder boter', oninput: e => { A.remark = e.target.value; } })),
      h('div', { class: 'banner ok' }, h('b', {}, total + ' broodjes'), A.persons + ' personen × ' + String(A.per).replace('.', ',') + ' · ' + summaryKinds),
      A.date === C.todayISO() && !S.open ? h('div', { class: 'banner warn' }, 'Het is na ' + C.closeLabel() + '. Je belt de broodjeszaak zelf. Dit komt bij "Nog door te bellen".') : null,
      h('button', { class: 'btn big', disabled: !A.place, onclick: e => act(e.currentTarget, async () => {
        const r = await api('placeAssortment', { date: A.date, place: A.place, time: A.time, forWho: A.forWho, persons: A.persons, perPerson: A.per, kinds: selected.map(n => ({ name: n, count: A.kinds[n] || null })), remark: A.remark });
        notify('Assortiment besteld: ' + r.total + ' broodjes.', 'ok'); S.assort = null; refresh();
      }) }, 'Assortiment bestellen'));
    const upcoming = h('div', { class: 'card' }, h('h2', {}, 'Geplande assortimenten'), list.length ? list.map(it => h('div', { class: 'row2' },
      h('span', {}, h('b', {}, dateNL(it.date) + ' · ' + it.place + (it.time ? ' om ' + it.time : '')), h('br'), it.forWho + ' · ' + it.persons + ' personen · ' + it.total + ' broodjes', h('br'), h('small', {}, kindsLabel(it.kinds) + (it.remark ? ' · ' + it.remark : '') + (it.sent ? ' · al verstuurd' : ''))),
      h('button', { class: 'btn danger small', disabled: it.sent ? true : null, onclick: e => act(e.currentTarget, async () => { await api('cancelAssortment', { ref: it.ref }); notify('Geannuleerd.', 'ok'); refresh(); }) }, 'Annuleren'))) : h('p', { class: 'muted' }, 'Geen assortimenten gepland.'));
    page('Assortiment voor een vergadering', h('div', { class: 'two' }, form, upcoming));
  };

  // ----- mail naar de broodjeszaak -----
  VIEWS.mail = async function viewMail(mode) {
    const title = 'Mail naar de broodjeszaak';
    loading(title);
    const r = await api('getMailPreview', { mode: mode || 'all' });
    const sent = r.status === 'sent', empty = r.status === 'empty';
    const banner = empty ? h('div', { class: 'banner warn' }, h('b', {}, 'Nog geen bestellingen'), 'Er is vandaag niets om te versturen.')
      : sent ? h('div', { class: 'banner ok' }, h('b', {}, 'Verzonden om ' + hhmm(r.sentAt) + ' door ' + r.sentBy), r.additions ? r.additions + ' aanvulling(en) sinds het verzenden.' : 'Er zijn geen aanvullingen sinds het verzenden.')
        : h('div', { class: 'banner warn' }, h('b', {}, 'Klaar om te verzenden'), 'Controleer de mail en klik op Verzenden.');
    const toggle = sent ? h('div', { class: 'seg' }, [['additions', 'Alleen aanvullingen'], ['all', 'Volledige mail']].map(([k, l]) => h('button', { class: r.mode === k ? 'on' : '', onclick: () => VIEWS.mail(k) }, l))) : null;
    const frameEl = h('iframe', { class: 'mailframe', sandbox: '', srcdoc: r.html || '', title: 'Voorbeeld van de mail' });
    const canSend = !empty && (!sent || (r.mode === 'additions' ? r.additions > 0 : true));
    const label = sent ? (r.mode === 'additions' ? 'Aanvulling verzenden' : 'Volledige mail opnieuw verzenden') : 'Verzenden';
    const manualMode = r.auto === false && !(window.BROODJES || {}).demo;
    const label2 = manualMode ? (sent ? (r.mode === 'additions' ? 'Aanvulling is verstuurd' : 'Volledige mail is verstuurd') : 'Mail is verstuurd') : label;
    const send = h('button', { class: 'btn big', disabled: !canSend, onclick: e => act(e.currentTarget, async () => {
      if (sent && r.mode === 'all' && !confirm('De broodjeszaak krijgt dan de volledige bestelling nog eens. Zeker?')) return;
      await api('sendMail', { mode: r.mode }); notify('De mail is verzonden.', 'ok'); VIEWS.mail(sent ? r.mode : 'all');
    }) }, label);
    const manual = r.auto === false && !(window.BROODJES || {}).demo;   // handmatig tot de flow aan staat
    const plain = () => { const d = document.createElement('div'); d.innerHTML = r.html || ''; return d.innerText || d.textContent || ''; };
    const copyMail = async btn => {
      try {
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([r.html || ''], { type: 'text/html' }), 'text/plain': new Blob([plain()], { type: 'text/plain' }) })]);
        } else {
          const f = frameEl; f.contentWindow.focus(); f.contentWindow.document.execCommand('selectAll'); if (!f.contentWindow.document.execCommand('copy')) throw new Error('kopieren mislukt');
        }
        notify('De mail is gekopieerd. Plak ze in Outlook met Ctrl+V.', 'ok');
      } catch (e) { notify('Kopiëren lukt niet. Selecteer de tekst in het voorbeeld en kopieer met Ctrl+C.', 'err'); }
    };
    const manualBox = manual && !empty ? h('div', { class: 'card' }, h('h2', {}, 'Zo verstuur je de mail'),
      h('ol', { class: 'steps' }, h('li', {}, 'Klik op ', h('b', {}, 'Kopieer mail'), '.'), h('li', {}, 'Klik op ', h('b', {}, 'Open Outlook'), ' en plak de mail met Ctrl+V.'), h('li', {}, 'Verstuur ze en klik hieronder op ', h('b', {}, label2), '.')),
      h('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap' }, h('button', { class: 'btn', onclick: e => copyMail(e.currentTarget) }, 'Kopieer mail'),
        h('a', { class: 'btn sec', href: 'mailto:' + (r.toMissing ? '' : encodeURIComponent(r.to)) + '?subject=' + encodeURIComponent(r.subject) }, 'Open Outlook'))) : null;
    page(title, banner, h('div', { class: 'two' },
      h('div', { class: 'card' }, h('div', { class: 'mailmeta' }, 'Onderwerp: ' + r.subject + ' · Aan: ' + r.to), r.toMissing ? h('div', { class: 'banner warn' }, 'Er is nog geen e-mailadres van de broodjeszaak ingevuld. Een IT-beheerder doet dat bij Instellingen.') : null, frameEl),
      h('div', { style: 'display:flex;flex-direction:column;gap:1rem' }, toggle,
        h('div', { class: 'card' }, h('h2', {}, 'Samenvatting'), h('div', { class: 'row2' }, 'Stuks', h('b', {}, r.counts.stuks)), h('div', { class: 'row2' }, 'Bestelregels', h('b', {}, r.counts.regels)), h('div', { class: 'row2' }, 'Plaatsen', h('b', {}, r.counts.plaatsen))),
        manualBox,
        h('button', { class: 'btn sec', onclick: () => go('toevoegen') }, 'Bestelling toevoegen'), send,
        h('small', {}, manual ? 'Klik pas op de knop hierboven nadat je de mail echt verstuurd hebt. Zo weten de andere beheerders dat het gebeurd is.' : 'De mail vertrekt uit de gedeelde mailbox, met IT in kopie.'))));
  };

  // ----- jeton -----
  VIEWS.jeton = async function viewJeton() {
    const J = S.jeton || (S.jeton = { picked: null, qty: 1 });
    const r = await api('listTokens'); const price = S.settings.tokenPrice;
    const left = h('div', { class: 'card' }, h('h2', {}, 'Wie komt een jeton halen?'),
      J.picked ? h('div', { class: 'picked' }, J.picked.name, h('button', { class: 'btn sec small', onclick: () => { J.picked = null; VIEWS.jeton(); } }, 'Andere persoon')) : personPicker(p => { J.picked = p; VIEWS.jeton(); }),
      h('h2', {}, 'Hoeveel jetons?'), h('div', { style: 'text-align:center' }, stepper(J.qty, 1, 20, v => { J.qty = v; VIEWS.jeton(); }, null, true)),
      h('p', { class: 'sum' }, J.qty + ' jetons × ' + eur(price) + ' = ', h('b', {}, eur(J.qty * price))),
      h('button', { class: 'btn big', disabled: !J.picked, onclick: e => act(e.currentTarget, async () => { await api('giveTokens', { targetId: J.picked.id, qty: J.qty }); notify(J.qty + ' jeton(s) opgeslagen voor ' + J.picked.name, 'ok'); S.jeton = null; VIEWS.jeton(); }) }, 'Opslaan'));
    const right = h('div', { class: 'card' }, h('h2', {}, 'Laatste jetons'), r.tokens.length ? r.tokens.map(t => h('div', { class: 'row2' }, h('span', {}, h('b', {}, t.name + ' · ' + t.qty), h('br'), h('small', {}, hhmm(t.ts) + ' · ' + t.by)),
      h('button', { class: 'btn danger small', onclick: e => act(e.currentTarget, async () => { await api('undoToken', { id: t.id }); notify('Jeton ongedaan gemaakt.', 'ok'); VIEWS.jeton(); }) }, 'Ongedaan maken'))) : h('p', { class: 'muted' }, 'Nog geen jetons uitgegeven.'));
    page('Jeton uitgeven', h('div', { class: 'two' }, left, right));
  };

  // ----- maandproducten -----
  VIEWS.maand = async function viewMaand() {
    loading('Maandproducten invullen');
    const r = await api('getMonthProducts'); const edits = {};
    const cards = r.items.map(it => {
      const upd = (k, v) => { (edits[it.menuId] = edits[it.menuId] || {})[k] = v; };
      return h('div', { class: 'card ' + (it.ok ? 'okc' : 'warnc') }, h('h2', {}, it.name, ' ', h('span', { class: 'chip ' + (it.ok ? 'ok' : 'warn') }, it.ok ? 'Ingevuld' : 'Nog in te vullen')),
        h('label', {}, 'Wat is het?', h('input', { class: 'field', value: it.description || '', placeholder: 'Typ wat het is', oninput: e => upd('description', e.target.value) })),
        h('label', {}, 'Prijs (€)', h('input', { class: 'field', inputmode: 'decimal', value: it.price != null && it.ok ? String(it.price).replace('.', ',') : '', placeholder: 'bv. 5,50', oninput: e => upd('price', e.target.value) })));
    });
    page('Maandproducten invullen', h('div', { class: 'two' }, cards),
      h('p', { class: 'muted' }, 'Bestellingen die op "Prijs te bepalen" stonden, krijgen automatisch de prijs zodra je opslaat.'),
      h('button', { class: 'btn big', onclick: e => act(e.currentTarget, async () => {
        const ids = Object.keys(edits); if (!ids.length) { notify('Er is niets gewijzigd.', 'err'); return; }
        for (const id of ids) {
          const it = r.items.find(x => x.menuId === id); const price = edits[id].price != null ? parsePrice(edits[id].price) : it.price;
          if (price == null || price <= 0) throw new Error('Vul een geldige prijs in bij ' + it.name + '.');
          await api('saveMonthProduct', { menuId: id, description: edits[id].description != null ? edits[id].description : it.description, price });
        }
        notify('Opgeslagen.', 'ok'); VIEWS.maand();
      }) }, 'Opslaan'));
  };

  // ----- prijzen -----
  VIEWS.prijzen = async function viewPrijzen() {
    loading('Prijzen invullen');
    const r = await api('listOpenPrices');
    const rows = r.items.map(it => {
      let val = ''; const input = h('input', { class: 'field', style: 'max-width:9rem', inputmode: 'decimal', placeholder: '€ 0,00', 'aria-label': 'Prijs per stuk', oninput: e => { val = e.target.value; } });
      return h('div', { class: 'row2' }, h('div', { style: 'flex:1;min-width:14rem' }, h('b', {}, it.person), h('small', {}, ' · ' + dateShort(it.date)), h('br'), it.text), input,
        h('button', { class: 'btn small', onclick: e => act(e.currentTarget, async () => { const p = parsePrice(val); if (p == null || p < 0) throw new Error('Vul een geldige prijs in.'); await api('savePrice', { id: it.id, price: p }); notify('Prijs opgeslagen.', 'ok'); VIEWS.prijzen(); }) }, 'Opslaan'));
    });
    page('Prijzen invullen', h('p', { class: 'muted' }, 'Bestellingen onder "Andere" hebben geen vaste prijs. Typ de prijs per stuk. Zolang een prijs openstaat, gaat het maandoverzicht niet naar HR.'),
      h('div', { class: 'card' }, rows.length ? rows : h('p', { class: 'muted' }, 'Er staan geen prijzen open.')));
  };

  // ----- bestelling toevoegen na 9u -----
  VIEWS.toevoegen = function viewToevoegen() {
    const T = S.toev || (S.toev = { type: 'lesgever', person: null, place: '', menuId: '', soort: 'wit', qty: 1, remark: '' });
    const items = T.type === 'lesgever' ? S.menu.filter(m => m.lesgevers) : S.menu.filter(m => m.price != null || m.openPrice);
    const item = items.find(m => m.id === T.menuId);
    const places = T.type === 'lesgever' ? S.places.lesgevers : S.places.personeel;
    const soorten = T.type === 'lesgever' ? (item && item.category === 'Belegd broodje' ? ['wit', 'bruin'] : []) : (item && item.fitness ? ['wit', 'bruin', 'fitness'] : []);
    const refresh = () => VIEWS.toevoegen();
    const sel = (opts, cur, set, ph) => h('select', { class: 'field', onchange: e => { set(e.target.value); refresh(); } }, h('option', { value: '' }, ph), opts.map(o => h('option', { value: o.v, selected: o.v === cur ? true : null }, o.t)));
    const form = h('div', { class: 'card' },
      h('div', { class: 'seg' }, [['lesgever', 'Lesgever'], ['personeel', 'Personeel']].map(([k, l]) => h('button', { class: T.type === k ? 'on' : '', onclick: () => { Object.assign(T, { type: k, person: null, place: '', menuId: '', soort: k === 'lesgever' ? 'wit' : 'wit' }); refresh(); } }, l))),
      h('h2', {}, 'Wie?'), T.person ? h('div', { class: 'picked' }, T.person.name, h('button', { class: 'btn sec small', onclick: () => { T.person = null; refresh(); } }, 'Andere persoon')) : personPicker(p => { T.person = p; refresh(); }, T.type),
      h('label', {}, 'Leverplaats', sel(places.map(p => ({ v: p, t: p })), T.place, v => { T.place = v; }, 'Kies de plaats')),
      h('label', {}, 'Product', sel(items.map(m => ({ v: m.id, t: m.name })), T.menuId, v => { T.menuId = v; T.soort = 'wit'; }, 'Kies het product')),
      soorten.length ? h('div', { class: 'seg' }, soorten.map(s => h('button', { class: T.soort === s ? 'on' : '', onclick: () => { T.soort = s; refresh(); } }, s[0].toUpperCase() + s.slice(1)))) : null,
      h('div', { class: 'row2' }, h('b', {}, 'Aantal'), stepper(T.qty, 1, 12, v => { T.qty = v; refresh(); })),
      h('input', { class: 'field', placeholder: item && item.other ? 'Wat moet er besteld worden? (verplicht)' : 'Opmerking (optioneel)', value: T.remark, 'aria-label': 'Opmerking', oninput: e => { T.remark = e.target.value; const sb = document.getElementById('saveLate'); if (sb) sb.disabled = !(T.person && T.place && T.menuId) || !!(item && item.other && !T.remark.trim()); } }),
      item && item.other ? h('div', { class: 'banner ok' }, 'De prijs per stuk vul je nadien in bij "Prijzen invullen".') : null,
      h('div', { class: 'banner warn' }, 'Je belt de broodjeszaak zelf. Dit wordt geregistreerd als "Telefonisch doorgegeven", met jouw naam en het uur.'),
      h('button', { id: 'saveLate', class: 'btn big', disabled: !(T.person && T.place && T.menuId) || (item && item.other && !T.remark.trim()), onclick: e => act(e.currentTarget, async () => {
        await api('addLateOrder', { targetId: T.person.id, place: T.place, date: new Date().toISOString().slice(0, 10), lines: [{ menuId: T.menuId, soort: soorten.length ? T.soort : '', qty: T.qty, remark: T.remark.trim() }] });
        notify('Geregistreerd voor ' + T.person.name + '.', 'ok'); T.menuId = ''; T.qty = 1; T.remark = ''; refresh();
      }) }, 'Opslaan en registreren'));
    page('Bestelling toevoegen na 9u', form);
  };

  // ----- nog door te bellen -----
  VIEWS.bellen = async function viewBellen() {
    loading('Nog door te bellen');
    const r = await api('listLate');
    const cards = r.items.map(it => { const done = it.status !== 'Te laat';
      return h('div', { class: 'card ' + (done ? 'okc' : 'warnc') }, h('div', { class: 'row2' }, h('b', {}, it.person + ' · ' + it.place), h('span', { class: 'chip ' + (done ? 'ok' : 'warn') }, done ? 'Doorgegeven' : 'Te laat')),
        it.lines.map(l => h('div', {}, l)), h('small', {}, 'Binnengekomen om ' + hhmm(it.ts)),
        done ? h('small', {}, 'Doorgebeld door ' + (it.calledBy || '?') + (it.calledAt ? ' om ' + hhmm(it.calledAt) : ''))
          : h('button', { class: 'btn', onclick: e => act(e.currentTarget, async () => { await api('markCalled', { ref: it.ref }); notify('Geregistreerd als doorgebeld.', 'ok'); VIEWS.bellen(); }) }, 'Doorgebeld'));
    });
    page('Nog door te bellen', h('p', { class: 'muted' }, 'Bestellingen die binnenkwamen nadat de mail was verstuurd.'),
      cards.length ? h('div', { class: 'two' }, cards) : h('p', { class: 'muted' }, 'Niets door te bellen.'),
      h('p', {}, h('button', { class: 'btn sec', onclick: () => VIEWS.mail('additions') }, 'Mail opnieuw opstellen')));
  };

  // ----- codes beheren -----
  VIEWS.codes = async function viewCodes(q) {
    q = typeof q === 'string' ? q : '';
    const r = await api('listPersons', { q });
    let timer;
    const search = h('input', { class: 'field', type: 'search', placeholder: 'Zoek een naam', value: q, 'aria-label': 'Zoek een naam', oninput: e => { clearTimeout(timer); const v = e.target.value; timer = setTimeout(() => VIEWS.codes(v), 400); } });
    const rows = r.persons.map(p => h('div', { class: 'row2' }, h('span', {}, h('b', {}, p.name), ' ', h('small', {}, typeLabel(p.type)), ' ', p.actief ? null : h('span', { class: 'chip grey' }, 'Niet actief'), ' ', p.hasCode ? null : h('span', { class: 'chip warn' }, 'Nog geen code')),
      h('span', { class: 'tools' },
        h('button', { class: 'btn small', onclick: e => act(e.currentTarget, async () => { const c = await api('resetCode', { targetId: p.id }); codeModal(p.name, c.code); }) }, 'Nieuwe code'),
        h('button', { class: 'btn sec small', onclick: () => customCodeModal(p) }, 'Eigen code'),
        h('button', { class: 'btn sec small', onclick: e => act(e.currentTarget, async () => { await api('setActive', { targetId: p.id, actief: !p.actief }); VIEWS.codes(q); }) }, p.actief ? 'Zet op niet actief' : 'Zet op actief'))));
    let nName = '', nType = 'personeel', nCode = '';
    const add = h('div', { class: 'card' }, h('h2', {}, 'Nieuwe persoon (zonder account)'),
      h('input', { class: 'field', placeholder: 'Volledige naam', 'aria-label': 'Naam', oninput: e => { nName = e.target.value; } }),
      h('select', { class: 'field', 'aria-label': 'Soort', onchange: e => { nType = e.target.value; } }, h('option', { value: 'personeel' }, 'Personeel'), h('option', { value: 'lesgever' }, 'Lesgever')),
      h('input', { class: 'field', inputmode: 'numeric', maxlength: '8', placeholder: 'Eigen code (optioneel, anders maken we er een)', 'aria-label': 'Eigen code', oninput: e => { nCode = e.target.value; } }),
      h('button', { class: 'btn', onclick: e => act(e.currentTarget, async () => { const c = await api('addPerson', { name: nName, type: nType, code: nCode.trim() }); codeModal(nName.trim(), c.code); VIEWS.codes(q); }) }, 'Toevoegen en code maken'));
    page('Codes beheren', h('p', { class: 'muted' }, 'Een code wordt maar één keer getoond. Bestaande codes kan niemand opvragen, enkel vervangen. Je kan een code laten maken of zelf een code kiezen.'),
      r.persons.some(p => p.actief && !p.hasCode) ? h('p', {}, h('button', { class: 'btn', onclick: e => act(e.currentTarget, async () => { const x = await api('bulkCodes'); bulkModal(x.items); VIEWS.codes(q); }) }, 'Codes maken voor iedereen zonder code')) : null,
      h('div', { class: 'two' }, h('div', { class: 'card' }, search, rows.length ? rows : h('p', { class: 'muted' }, 'Niemand gevonden.')), add));
    const f = document.querySelector('input[type=search]'); if (f && q) { f.focus(); f.setSelectionRange(q.length, q.length); }
  };
})();
