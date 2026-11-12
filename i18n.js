// Vertalingen voor de broodjespagina: Nederlands (basis), Frans en Engels.
// De pagina schrijft haar teksten in het Nederlands. Deze module vertaalt ze bij het tonen.
// Opgeslagen bestellingen, de mail naar de broodjeszaak en de database blijven altijd in het Nederlands.
(function () {
  'use strict';
  const LANGS = ['nl', 'fr', 'en'];
  const LOCALE = { nl: 'nl-BE', fr: 'fr-BE', en: 'en-GB' };
  const DICT = { fr: {}, en: {} };
  const PATTERNS = [];
  let lang = 'nl';
  try { const s = localStorage.getItem('bj_lang'); if (LANGS.includes(s)) lang = s; } catch (e) { /* geen opslag beschikbaar */ }

  const D = (nl, fr, en) => { DICT.fr[nl] = fr; DICT.en[nl] = en; };
  const P = (re, fr, en) => PATTERNS.push([re, fr, en]);
  const NB = '\u00a0';   // harde spatie vóór ? : ! in het Frans

  // ---------- tijd ----------
  const time = (x, l) => l === 'fr' ? x.replace(/(\d)u\b/, '$1h') : x.replace(/^(\d{1,2})u$/, (a, h) => h + ':00');

  // ---------- losse woorden ----------
  const SOORT = { wit: ['blanc', 'white'], bruin: ['brun', 'brown'], fitness: ['fitness', 'fitness'] };
  D('wit', 'blanc', 'white'); D('bruin', 'brun', 'brown');
  D('Wit', 'Blanc', 'White'); D('Bruin', 'Brun', 'Brown'); D('Fitness', 'Fitness', 'Fitness');

  // ---------- algemeen ----------
  D('Lesgever', 'Formateur', 'Instructor'); D('Personeel', 'Personnel', 'Staff');
  D('Er ging iets mis.', "Une erreur s'est produite.", 'Something went wrong.');
  D('Geen verbinding met de server. Probeer opnieuw.', 'Pas de connexion au serveur. Réessayez.', 'No connection to the server. Please try again.');
  D('Je bent uitgelogd. Log opnieuw in.', 'Vous avez été déconnecté. Reconnectez-vous.', 'You have been logged out. Please log in again.');
  D('Naar de startpagina', "Vers la page d'accueil", 'Go to the start page');
  D('Broodjes bestellen', 'Commander des sandwichs', 'Order sandwiches');
  D('Mijn code', 'Mon code', 'My code'); D('Uitloggen', 'Se déconnecter', 'Log out');
  D('← Terug', '← Retour', '← Back'); D('Minder', 'Moins', 'Less'); D('Meer', 'Plus', 'More');
  D('Taal', 'Langue', 'Language'); D('Even laden…', 'Chargement…', 'Loading…');
  D('Opslaan', 'Enregistrer', 'Save'); D('Annuleren', 'Annuler', 'Cancel'); D('Afsluiten', 'Fermer', 'Close'); D('Klaar', 'Terminé', 'Done');
  D('Totaal', 'Total', 'Total'); D('Vandaag', "Aujourd'hui", 'Today');
  D('Opmerking', 'Remarque', 'Remark'); D('Aantal', 'Quantité', 'Quantity');
  D('Volgende', 'Suivant', 'Next'); D('Aanpassen', 'Modifier', 'Edit'); D('Verzenden', 'Envoyer', 'Send'); D('Bestellen', 'Commander', 'Order');
  D('Je was even weg en bent daarom uitgelogd.', 'Vous étiez absent un moment et avez donc été déconnecté.', 'You were away for a while and have been logged out.');

  // ---------- aanmelden ----------
  D('Wie ben jij?', `Qui êtes-vous${NB}?`, 'Who are you?');
  D('Typ de eerste letters van je naam', 'Tapez les premières lettres de votre nom', 'Type the first letters of your name');
  D('Zoek je naam', 'Cherchez votre nom', 'Search for your name');
  D('Geen naam gevonden. Probeer een andere schrijfwijze.', 'Aucun nom trouvé. Essayez une autre orthographe.', 'No name found. Try a different spelling.');
  D('Typ je code', 'Tapez votre code', 'Enter your code'); D('Wis', 'Effacer', 'Delete');
  D('← Ik ben iemand anders', "← Je suis quelqu'un d'autre", '← I am someone else');
  D('Code vergeten? Vraag een nieuwe aan bij de broodjes-beheerders.', `Code oublié${NB}? Demandez-en un nouveau aux gestionnaires des sandwichs.`, 'Forgot your code? Ask the sandwich administrators for a new one.');
  P(/^Je code heeft minstens (\d+) cijfers\.$/, m => `Votre code comporte au moins ${m[1]} chiffres.`, m => `Your code has at least ${m[1]} digits.`);
  D('Mijn code wijzigen', 'Modifier mon code', 'Change my code');
  P(/^Kies een code die je goed onthoudt: minstens (\d+) cijfers\. Niet 1234, 4321 of vier keer hetzelfde cijfer\.$/,
    m => `Choisissez un code facile à retenir : au moins ${m[1]} chiffres. Pas 1234, 4321 ni le même chiffre quatre fois.`,
    m => `Choose a code you will remember: at least ${m[1]} digits. Not 1234, 4321 or the same digit four times.`);
  D('Nieuwe code', 'Nouveau code', 'New code'); D('Nieuwe code nog eens', 'Nouveau code, encore une fois', 'New code again');
  D('De twee codes zijn niet gelijk.', 'Les deux codes ne sont pas identiques.', 'The two codes do not match.');
  D('Je code is gewijzigd.', 'Votre code a été modifié.', 'Your code has been changed.');

  // ---------- beginscherm ----------
  P(/^Hallo (.+), waar zit je\?$/, m => `Bonjour ${m[1]}, où êtes-vous${NB}?`, m => `Hello ${m[1]}, where are you?`);
  P(/^Hallo (.+)$/, m => `Bonjour ${m[1]}`, m => `Hello ${m[1]}`);
  P(/^Bestellen kan tot (.+)$/, (m, t, l) => `Commandes possibles jusqu'à ${time(m[1], 'fr')}`, (m) => `Ordering is possible until ${time(m[1], 'en')}`);
  P(/^Nog (?:(\d+) u )?(\d+) min\.$/, m => `Encore ${m[1] ? m[1] + ' h ' : ''}${m[2]} min.`, m => `${m[1] ? m[1] + ' h ' : ''}${m[2]} min left.`);
  P(/^Het is (.+)\. Het bestellen is gesloten\.$/, m => `Il est ${m[1]}. Les commandes sont closes.`, m => `It is ${m[1]}. Ordering is closed.`);
  P(/^Het is (.+)$/, m => `Il est ${m[1]}`, m => `It is ${m[1]}`);
  D('Bestellen is gesloten voor het personeel. Voor jou niet.', 'Les commandes sont closes pour le personnel. Pas pour vous.', 'Ordering is closed for staff. Not for you.');
  D('Het bestellen is gesloten voor vandaag. Iets vergeten? Bel een broodjes-beheerder.', `Les commandes sont closes pour aujourd'hui. Un oubli${NB}? Appelez un gestionnaire des sandwichs.`, 'Ordering is closed for today. Forgot something? Call a sandwich administrator.');
  D('Broodje bestellen', 'Commander un sandwich', 'Order a sandwich'); D('Mijn bestellingen', 'Mes commandes', 'My orders');
  D('Beheer', 'Gestion', 'Administration'); D('Jeton uitgeven', 'Distribuer un jeton', 'Give a token');
  D('Maandproducten invullen', 'Remplir les produits du mois', 'Fill in monthly products'); D('Prijzen invullen', 'Remplir les prix', 'Fill in prices');
  D('Nog door te bellen', 'Encore à téléphoner', 'Still to call'); D('Bestelling toevoegen na 9u', 'Ajouter une commande après 9h', 'Add an order after 9 am');
  D('Assortiment vergadering', 'Assortiment réunion', 'Meeting assortment'); D('Codes beheren', 'Gérer les codes', 'Manage codes');
  D('Maandoverzicht HR', 'Récapitulatif mensuel RH', 'Monthly overview HR'); D('Alleen voor IT', "Réservé à l'IT", 'IT only');
  D('Menu en prijzen', 'Menu et prix', 'Menu and prices'); D('Instellingen', 'Paramètres', 'Settings');
  D('Mail naar de broodjeszaak', 'E-mail au traiteur', 'Email to the sandwich shop');
  D('Nog geen bestellingen', 'Pas encore de commandes', 'No orders yet'); D('Klaar om te verzenden', 'Prêt à envoyer', 'Ready to send');
  D('Herinnering: de mail naar de broodjeszaak is nog niet verzonden.', "Rappel : l'e-mail au traiteur n'a pas encore été envoyé.", 'Reminder: the email to the sandwich shop has not been sent yet.');
  D('Open hem hieronder en klik op Verzenden.', 'Ouvrez-le ci-dessous et cliquez sur Envoyer.', 'Open it below and click Send.');

  // ---------- bestellen ----------
  D('Belegd', 'Garnis', 'Filled'); D('Warm', 'Chauds', 'Hot'); D('Salade', 'Salades', 'Salads'); D('Gebak', 'Pâtisseries', 'Pastries'); D('Overig', 'Divers', 'Other');
  D('Belegd broodje', 'Sandwich garni', 'Filled sandwich'); D('Warm broodje', 'Sandwich chaud', 'Hot sandwich');
  D('prijs volgt', 'prix à suivre', 'price to follow'); D('Verwijder', 'Supprimer', 'Remove'); D('Mandje', 'Panier', 'Basket');
  D('Nog niets toegevoegd. Kies links een broodje.', "Rien n'a encore été ajouté. Choisissez un sandwich à gauche.", 'Nothing added yet. Choose a sandwich on the left.');
  D('Voor sommige producten volgt de prijs nog.', 'Le prix de certains produits suivra.', 'The price of some products will follow.');
  D('Bekijk mandje', 'Voir le panier', 'View basket'); D('Kies een broodje.', 'Choisissez un sandwich.', 'Choose a sandwich.');
  D('Andere', 'Autre', 'Other');
  D('Wat wil je bestellen?', `Que souhaitez-vous commander${NB}?`, 'What would you like to order?');
  D('Opmerking, bv. zonder tomaat', 'Remarque, p. ex. sans tomate', 'Remark, e.g. no tomato');
  D('Typ wat je wil bestellen.', 'Indiquez ce que vous souhaitez commander.', 'Type what you would like to order.');
  D('Toevoegen aan mandje', 'Ajouter au panier', 'Add to basket');
  P(/^Fitness \+ (.+)$/, m => `Fitness + ${m[1]}`, m => `Fitness + ${m[1]}`);
  P(/^(.+) zit in je mandje\.$/, (m, t) => `${t(m[1])} a été ajouté au panier.`, (m, t) => `${t(m[1])} is in your basket.`);
  // een bestelregel zoals ze in het mandje staat: 2× Smos, wit
  P(/^(\d+)× (.+?)(?:, (wit|bruin|fitness))?$/, (m, t) => `${m[1]}× ${t(m[2])}${m[3] ? ', ' + SOORT[m[3]][0] : ''}`, (m, t) => `${m[1]}× ${t(m[2])}${m[3] ? ', ' + SOORT[m[3]][1] : ''}`);
  // een bestelregel zoals de database ze bewaart: 2x Wit broodje Smos (zonder tomaat)
  const dbLine = (m, t, i) => `${m[1]}× ${t(m[3])}${m[2] ? ', ' + SOORT[m[2].toLowerCase()][i] : ''}${m[4] ? ' (' + m[4] + ')' : ''}`;
  P(/^(\d+)x (?:(Wit|Bruin|Fitness) broodje )?(.+?)(?: \((.+)\))?$/, (m, t) => dbLine(m, t, 0), (m, t) => dbLine(m, t, 1));

  // ---------- afrekenen en bevestiging ----------
  D('Wat je bestelt', 'Votre commande', 'What you are ordering');
  D('Waar leveren we het?', `Où livrons-nous${NB}?`, 'Where should we deliver it?');
  D('Voor vandaag. Een datum in het verleden kan niet.', "Pour aujourd'hui. Une date passée est impossible.", 'For today. A date in the past is not possible.');
  D('Het bedrag wordt aan het einde van de maand van je loon afgehouden.', 'Le montant sera retenu sur votre salaire à la fin du mois.', 'The amount will be deducted from your salary at the end of the month.');
  D('Nog iets toevoegen', "Ajouter autre chose", 'Add something else'); D('Nog een bestelling', 'Encore une commande', 'Another order');
  D('Je bestelling is verstuurd', 'Votre commande a été envoyée', 'Your order has been sent');
  D('Te laat', 'Trop tard', 'Too late');
  D('Je bestelling kwam na de mail binnen. De beheerders bellen de broodjeszaak.', "Votre commande est arrivée après l'envoi de l'e-mail. Les gestionnaires téléphonent au traiteur.", 'Your order came in after the email was sent. The administrators will call the sandwich shop.');
  D('Dit scherm sluit vanzelf.', 'Cet écran se ferme automatiquement.', 'This screen closes by itself.');

  // ---------- mijn bestellingen ----------
  P(/^Annuleren kan tot (.+)$/, m => `Annulation possible jusqu'à ${time(m[1], 'fr')}`, m => `You can cancel until ${time(m[1], 'en')}`);
  D('Bestelling geannuleerd.', 'Commande annulée.', 'Order cancelled.');
  D('Je hebt vandaag nog niets besteld.', "Vous n'avez encore rien commandé aujourd'hui.", 'You have not ordered anything today.');
  D('Totaal deze maand', 'Total ce mois-ci', 'Total this month');
  P(/^(\d+) bestelling\(en\) zonder prijs zijn nog niet meegeteld\.$/, m => `${m[1]} commande(s) sans prix ne sont pas encore comptées.`, m => `${m[1]} order(s) without a price are not counted yet.`);
  D('Eerder deze maand', 'Plus tôt ce mois-ci', 'Earlier this month'); D('Nog niets deze maand.', "Rien pour l'instant ce mois-ci.", 'Nothing yet this month.');
  D('Nieuw', 'Nouveau', 'New'); D('Verstuurd', 'Envoyé', 'Sent'); D('Geannuleerd', 'Annulé', 'Cancelled');
  D('Telefonisch doorgegeven', 'Communiqué par téléphone', 'Passed on by phone'); D('Prijs te bepalen', 'Prix à déterminer', 'Price to be determined');
  P(/^(.+) · (\d{2}:\d{2})$/, (m, t) => `${t(m[1])} · ${m[2]}`, (m, t) => `${t(m[1])} · ${m[2]}`);
  P(/^(\d{2}\/\d{2}) · (.+)$/, (m, t) => `${m[1]} · ${t(m[2])}`, (m, t) => `${m[1]} · ${t(m[2])}`);

  // ---------- lesgevers ----------
  D('Het bestellen is gesloten', 'Les commandes sont closes', 'Ordering is closed');
  P(/^Het bestellen sloot om (.+)\.$/, m => `Les commandes ont fermé à ${time(m[1], 'fr')}.`, m => `Ordering closed at ${time(m[1], 'en')}.`);
  D('Iets vergeten? Bel een van de broodjes-beheerders. Zij regelen het met de broodjeszaak.', `Un oubli${NB}? Appelez l'un des gestionnaires des sandwichs. Ils s'en occupent avec le traiteur.`, 'Forgot something? Call one of the sandwich administrators. They will arrange it with the sandwich shop.');
  P(/^Je bestelling is voor vandaag\. Bestellen kan tot ([^.]+)\.(?: (Nog .+))?$/,
    (m, t) => `Votre commande est pour aujourd'hui. Commandes possibles jusqu'à ${time(m[1], 'fr')}.${m[2] ? ' ' + t(m[2]) : ''}`,
    (m, t) => `Your order is for today. Ordering is possible until ${time(m[1], 'en')}.${m[2] ? ' ' + t(m[2]) : ''}`);
  D('Opmerking, bv. 1 zonder tomaat', 'Remarque, p. ex. 1 sans tomate', 'Remark, e.g. 1 without tomato');
  P(/^Opmerking bij (.+)$/, (m, t) => `Remarque pour ${t(m[1])}`, (m, t) => `Remark for ${t(m[1])}`);
  D('Jouw bestelling', 'Votre commande', 'Your order'); D('Nog niets gekozen.', "Rien n'a encore été choisi.", 'Nothing chosen yet.');
  P(/^(\d+) stuks$/, m => `${m[1]} pièces`, m => `${m[1]} pieces`);
  D('Naar overzicht', 'Vers le récapitulatif', 'To summary'); D('Kies je broodjes', 'Choisissez vos sandwichs', 'Choose your sandwiches');
  D('Tik + bij wit of bruin. Opmerking nodig? Typ ze eronder.', 'Appuyez sur + pour blanc ou brun. Une remarque ? Écrivez-la en dessous.', 'Tap + for white or brown. Need a remark? Type it below.');
  const part = (s, i) => s.replace(/^(\d+) (wit|bruin)$/, (a, n, k) => `${n} ${SOORT[k][i]}`);
  P(/^(\d+ (?:wit|bruin))(?: · (\d+ (?:wit|bruin)))?$/, m => part(m[1], 0) + (m[2] ? ' · ' + part(m[2], 0) : ''), m => part(m[1], 1) + (m[2] ? ' · ' + part(m[2], 1) : ''));
  P(/^Opmerking: (.*)$/, m => `Remarque : ${m[1]}`, m => `Remark: ${m[1]}`);
  D('Klopt je bestelling?', `Votre commande est-elle correcte${NB}?`, 'Is your order correct?');
  D('Ja, deze bestelling is correct', 'Oui, cette commande est correcte', 'Yes, this order is correct');
  P(/^(.+) · (.+) · vandaag$/, (m, t) => `${m[1]} · ${t(m[2])} · aujourd'hui`, (m, t) => `${m[1]} · ${t(m[2])} · today`);
  D('Je bestelling is goed verzonden', 'Votre commande a bien été envoyée', 'Your order has been sent successfully');
  P(/^Bedankt, (.+?) · (.+?) · vandaag om (.+)$/, (m, t) => `Merci, ${m[1]} · ${t(m[2])} · aujourd'hui à ${m[3]}`, (m, t) => `Thank you, ${m[1]} · ${t(m[2])} · today at ${m[3]}`);
  D('Je bestelling kwam binnen nadat de mail naar de broodjeszaak was verstuurd. De beheerders bellen de broodjeszaak.', "Votre commande est arrivée après l'envoi de l'e-mail au traiteur. Les gestionnaires téléphonent au traiteur.", 'Your order came in after the email to the sandwich shop was sent. The administrators will call the sandwich shop.');
  P(/^Iets vergeten\? Na (.+?) kan je niet meer zelf bestellen\. De beheergroep krijgt dan een melding en belt de broodjeszaak\.$/,
    m => `Un oubli${NB}? Après ${time(m[1], 'fr')}, vous ne pouvez plus commander vous-même. Le groupe de gestion recevra alors un message et téléphonera au traiteur.`,
    m => `Forgot something? After ${time(m[1], 'en')} you can no longer order yourself. The administrators will then get a message and call the sandwich shop.`);
  D('Nieuwe bestelling', 'Nouvelle commande', 'New order');

  // ---------- meldingen van de database ----------
  D('Annuleren kan niet meer na 9u.', "L'annulation n'est plus possible après 9h.", 'Cancelling is no longer possible after 9 am.');
  D('Dat is niet de juiste code. Probeer opnieuw.', "Ce n'est pas le bon code. Réessayez.", 'That is not the right code. Please try again.');
  D('Deze bestelling kan niet geannuleerd worden.', 'Cette commande ne peut pas être annulée.', 'This order cannot be cancelled.');
  D('Dit account is niet actief.', "Ce compte n'est pas actif.", 'This account is not active.');
  D('Dit product is niet beschikbaar voor lesgevers.', "Ce produit n'est pas disponible pour les formateurs.", 'This product is not available for instructors.');
  D('Dit product is niet beschikbaar.', "Ce produit n'est pas disponible.", 'This product is not available.');
  D('Dit zijn te veel regels in één bestelling.', 'Il y a trop de lignes dans une seule commande.', 'That is too many lines in one order.');
  D('Er ging iets mis. Probeer opnieuw of vraag het aan IT.', "Une erreur s'est produite. Réessayez ou contactez l'IT.", 'Something went wrong. Try again or ask IT.');
  D('Het bestellen is gesloten voor vandaag.', "Les commandes sont closes pour aujourd'hui.", 'Ordering is closed for today.');
  D('Je bent niet ingelogd.', "Vous n'êtes pas connecté.", 'You are not logged in.');
  D('Je bestelling is leeg.', 'Votre commande est vide.', 'Your order is empty.');
  D('Je hebt nog geen code. Vraag er een aan bij de broodjes-beheerders.', "Vous n'avez pas encore de code. Demandez-en un aux gestionnaires des sandwichs.", 'You do not have a code yet. Ask the sandwich administrators for one.');
  D('Kies een leverplaats.', 'Choisissez un lieu de livraison.', 'Choose a delivery location.');
  D('Ongeldige regel in je bestelling.', 'Ligne invalide dans votre commande.', 'Invalid line in your order.');
  D('Typ wat je wil bestellen bij "Iets anders".', 'Indiquez ce que vous souhaitez commander sous « Autre ».', 'Type what you would like to order under "Other".');
  D('Geen toegang.', 'Accès refusé.', 'No access.'); D('Onbekende actie.', 'Action inconnue.', 'Unknown action.');
  D('Een code bestaat enkel uit cijfers.', 'Un code se compose uniquement de chiffres.', 'A code consists of digits only.');
  D('Kies geen code met enkel hetzelfde cijfer.', 'Ne choisissez pas un code composé du même chiffre.', 'Do not choose a code made of the same digit.');
  D('Kies geen code zoals 1234 of 4321.', 'Ne choisissez pas un code comme 1234 ou 4321.', 'Do not choose a code like 1234 or 4321.');
  P(/^De code heeft (\d+) tot (\d+) cijfers\.$/, m => `Le code comporte de ${m[1]} à ${m[2]} chiffres.`, m => `The code has ${m[1]} to ${m[2]} digits.`);
  P(/^Te veel foute pogingen\. Probeer over (\d+) minuten opnieuw\.$/, m => `Trop de tentatives échouées. Réessayez dans ${m[1]} minute${m[1] === '1' ? '' : 's'}.`, m => `Too many failed attempts. Try again in ${m[1]} minute${m[1] === '1' ? '' : 's'}.`);

  // ---------- producten, plaatsen (enkel de weergave; opgeslagen blijft alles Nederlands) ----------
  [
    ['Prépare', 'Américain préparé', 'Prepared steak tartare'], ['Smos', 'Smos (jambon, fromage, œuf, crudités)', 'Smos (ham, cheese, egg, salad)'],
    ['Kaas', 'Fromage', 'Cheese'], ['Hesp', 'Jambon', 'Ham'], ['Tonijn', 'Thon', 'Tuna'], ['Tonijntino', 'Tonijntino (thon)', 'Tonijntino (tuna)'],
    ['Krabsalade', 'Salade de crabe', 'Crab salad'], ['Vleessalade', 'Salade de viande', 'Meat salad'], ['Kip curry', 'Poulet curry', 'Chicken curry'],
    ['Gezond', 'Sain', 'Healthy'], ['Veggiesalade', 'Salade végétarienne', 'Veggie salad'], ['Kip curry tropical', 'Poulet curry tropical', 'Tropical chicken curry'],
    ['Zalmsalade', 'Salade de saumon', 'Salmon salad'], ['Gerookte zalm tartare', 'Saumon fumé tartare', 'Smoked salmon tartare'],
    ['Brie, honing, walnoten', 'Brie, miel, noix', 'Brie, honey, walnuts'], ['Italia, serrano, mozarella', 'Italia, serrano, mozzarella', 'Italia, serrano, mozzarella'],
    ['Broodje gebakken kip', 'Sandwich au poulet frit', 'Fried chicken sandwich'], ['Broodje Breydelspek special', 'Sandwich Breydelspek spécial', 'Breydelspek special sandwich'],
    ['Broodje van de maand', 'Sandwich du mois', 'Sandwich of the month'], ['Veggie', 'Végétarien', 'Veggie'],
    ['Flaguette breydelham', 'Flaguette jambon Breydel', 'Breydel ham flaguette'], ['Flaguette kip pepersaus', 'Flaguette poulet sauce poivre', 'Chicken flaguette with pepper sauce'],
    ['Flaguette omelet brieks', 'Flaguette omelette Brieks', 'Brieks omelette flaguette'], ['Panini kip pesto', 'Panini poulet pesto', 'Chicken pesto panini'],
    ['Panini kaas & ham', 'Panini fromage & jambon', 'Cheese & ham panini'],
    ['Salade kip', 'Salade au poulet', 'Chicken salad'], ['Salade tomaat & mozarella', 'Salade tomate & mozzarella', 'Tomato & mozzarella salad'],
    ['Salade tonijn', 'Salade au thon', 'Tuna salad'], ['Salade gerookte zalm', 'Salade au saumon fumé', 'Smoked salmon salad'],
    ['Ceasar salad', 'Salade César', 'Caesar salad'], ['Slaatje americain', "Salade d'américain", 'Steak tartare salad'],
    ['Poké bowl sweet chicken', 'Poké bowl poulet sweet', 'Poké bowl sweet chicken'], ['Poké bowl spicy chicken', 'Poké bowl poulet épicé', 'Poké bowl spicy chicken'],
    ['Poké bowl salmon style', 'Poké bowl style saumon', 'Poké bowl salmon style'], ['Salade van de maand', 'Salade du mois', 'Salad of the month'],
    ['Worstenbroodje', 'Pain à la saucisse', 'Sausage roll'], ['Appelflap', 'Chausson aux pommes', 'Apple turnover'], ['Appelschijfje', 'Tranche aux pommes', 'Apple slice'],
    ['Appeltaart', 'Tarte aux pommes', 'Apple pie'], ['Mattetaart', 'Tarte aux mattes (fromage blanc)', 'Matte tart (curd cheese tart)'], ['Flantaart', 'Tarte au flan', 'Custard tart'],
    ['Eclair', 'Éclair', 'Éclair'], ['Carré confituur', 'Carré confiture', 'Jam square'], ['Kriekentaartje', 'Tartelette aux cerises', 'Cherry tartlet'],
    ['Rabarbercake', 'Cake à la rhubarbe', 'Rhubarb cake'], ['Rijsttaartje', 'Tartelette au riz', 'Rice pudding tartlet'], ['Rijstvlaai', 'Tarte au riz', 'Rice tart'],
    ['Broodpudding', 'Pudding au pain', 'Bread pudding'],
    ['Kantoor', 'Bureau', 'Office'], ['Magazijn', 'Entrepôt', 'Warehouse'], ['Vergaderzaal', 'Salle de réunion', 'Meeting room'], ['Appartement', 'Appartement', 'Apartment']
  ].forEach(([nl, fr, en]) => D(nl, fr, en));
  P(/^Lokaal (.+)$/, m => `Local ${m[1]}`, m => `Classroom ${m[1]}`);
  P(/^Zaal (.+)$/, m => `Salle ${m[1]}`, m => `Hall ${m[1]}`);

  // ---------- de vertaalmachine ----------
  function tr(s) {
    if (lang === 'nl' || typeof s !== 'string' || !s) return s;
    const key = s.trim(); if (!key) return s;
    const d = DICT[lang];
    if (Object.prototype.hasOwnProperty.call(d, key)) return s.replace(key, () => d[key]);
    for (const [re, fr, en] of PATTERNS) {
      const m = re.exec(key);
      if (m) return s.replace(key, () => (lang === 'fr' ? fr : en)(m, tr));
    }
    return s;
  }

  // Bewaart de Nederlandse originelen, zodat een taalwissel de tekst opnieuw kan vertalen zonder iets te verliezen.
  const ORIG = new WeakMap(), ATTR = new WeakMap();
  const remember = (node, s) => { if (/[A-Za-zÀ-ÿ]/.test(s)) ORIG.set(node, s); };
  const rememberAttr = (el, k, v) => { if (/[A-Za-zÀ-ÿ]/.test(v)) { const a = ATTR.get(el) || {}; a[k] = v; ATTR.set(el, a); } };
  function apply(root) {
    root = root || document.body;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const o = ORIG.get(n); if (o !== undefined) { const t = tr(o); if (n.nodeValue !== t) n.nodeValue = t; } }
    root.querySelectorAll('*').forEach(el => { const a = ATTR.get(el); if (a) for (const k of Object.keys(a)) el.setAttribute(k, tr(a[k])); });
    document.documentElement.lang = lang;
    document.title = 'Heli · ' + tr('Broodjes bestellen');
  }
  function set(l) {
    if (!LANGS.includes(l)) return;
    lang = l;
    try { localStorage.setItem('bj_lang', l); } catch (e) { /* niet erg */ }
    apply(document.body);
    if (typeof window.I18N.onChange === 'function') window.I18N.onChange(l);
  }

  window.I18N = {
    get lang() { return lang; }, langs: LANGS, tr, set, apply, remember, rememberAttr,
    locale: () => LOCALE[lang] || 'nl-BE',
    _dict: DICT, _patterns: PATTERNS
  };
  document.documentElement.lang = lang;
})();
