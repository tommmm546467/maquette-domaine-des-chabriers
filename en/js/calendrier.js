/* Domaine des Chabriers : le panneau « Calendrier » (V3, demande de Tom du 22/10/2026).
   Le bouton Calendrier de l'en-tête ouvre un panneau à droite : on choisit un logement, on voit les jours
   disponibles, réservés ou fermés, on choisit l'arrivée puis le départ. « Continuer ma demande » ouvre le
   formulaire de contact avec les dates et le logement déjà remplis. Pas de formulaire dans le panneau.
   Sans JavaScript, le bouton garde son lien vers le formulaire. Données : js/disponibilites.js. */
(function () {
  'use strict';
  var DISPOS = window.DISPONIBILITES;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var NB = ' ';
  var MOIS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var JOURS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* Dates : chaînes AAAA-MM-JJ, calculs en heure locale ---------------------------------------- */
  var cle = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var date = function (k) { var p = k.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); };
  var plus = function (k, n) { var d = date(k); d.setDate(d.getDate() + n); return cle(d); };
  var aujourdhui = cle(new Date());
  var lisible = function (k) { var d = date(k); return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); };

  /* Les réservations qui comptent pour un choix : les siennes, plus celles qui le bloquent
     (une privatisation du domaine bloque les gîtes ; un gîte réservé bloque la privatisation) */
  function reservations(logement) {
    var r = DISPOS[logement].reserve.slice();
    Object.keys(DISPOS).forEach(function (autre) {
      if (autre !== logement && (logement === 'domaine' || autre === 'domaine')) r = r.concat(DISPOS[autre].reserve);
    });
    return r;
  }
  /* Une nuit (celle qui commence le jour k) : libre, réservée ou fermée */
  function etat(logement, k) {
    var l = DISPOS[logement];
    if (k < aujourdhui) return 'passe';
    if (l.ouvreLe && k < l.ouvreLe) return 'ferme';
    if (l.mois && l.mois.indexOf(date(k).getMonth() + 1) < 0) return 'ferme';
    var r = reservations(logement);
    for (var i = 0; i < r.length; i++) if (k >= r[i][0] && k < r[i][1]) return 'reserve';
    return 'libre';
  }
  /* Nuits minimum : celles de disponibilites.js ; 3 l'été au château (bon à savoir de la page tarifs) */
  function minimum(logement, arrivee, depart) {
    var mini = DISPOS[logement].minimum || 2;
    if (logement !== 'chateau') return mini;
    for (var k = arrivee; k < depart; k = plus(k, 1)) { var m = date(k).getMonth() + 1; if (m === 7 || m === 8) return 3; }
    return mini;
  }
  /* Premier mois où le logement a une nuit libre, à partir d'aujourd'hui */
  function premierMois(logement) {
    for (var k = aujourdhui, i = 0; i < 900; i++, k = plus(k, 1)) if (etat(logement, k) === 'libre') return k.slice(0, 7);
    return aujourdhui.slice(0, 7);
  }

  var s = { logement: 'chateau', mois: null, arrivee: null, depart: null, message: '' };
  var panneau, ouvreur;

  function construire() {
    panneau = document.createElement('div');
    panneau.className = 'cal';
    panneau.id = 'calendrier';
    panneau.hidden = true;
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-modal', 'true');
    panneau.setAttribute('aria-labelledby', 'cal-titre');
    var logements = Object.keys(DISPOS).map(function (k) {
      return '<button type="button" class="cal__logement" data-logement="' + k + '" aria-pressed="false"><strong>' + DISPOS[k].nom + '</strong><small>' + DISPOS[k].detail + '</small></button>';
    }).join('');
    panneau.innerHTML =
      '<div class="cal__voile" data-cal-fermer></div>' +
      '<aside class="cal__panneau">' +
        '<div class="cal__tete"><div><p class="sur-titre">Calendar</p><h2 id="cal-titre">Your <em>available dates</em></h2></div>' +
        '<button type="button" class="cal__fermer" data-cal-fermer aria-label="Close the calendar">×</button></div>' +
        '<div class="cal__corps">' +
          '<p class="cal__etiquette">Accommodation</p><div class="cal__logements">' + logements + '</div>' +
          '<div class="cal__nav"><button type="button" class="cal__fleche" data-cal-mois="-1" aria-label="Previous month">←</button>' +
          '<h3 class="cal__titre-mois" aria-live="polite"></h3>' +
          '<button type="button" class="cal__fleche" data-cal-mois="1" aria-label="Next month">→</button></div>' +
          '<div class="cal__jours" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>' +
          '<div class="cal__grille"></div>' +
          '<ul class="cal__legende"><li><span class="cal__pastille cal__pastille--libre"></span>Available</li><li><span class="cal__pastille cal__pastille--reserve"></span>Booked</li><li><span class="cal__pastille cal__pastille--ferme"></span>Closed</li></ul>' +
        '</div>' +
        '<div class="cal__pied"><p class="cal__choix" aria-live="polite"></p>' +
          '<a class="bouton cal__continuer" href="contact.html#demande" aria-disabled="true">Continue my request</a>' +
          '<p class="cal__note">Bookings up to date as of 23 October 2026.</p></div>' +
      '</aside>';
    document.body.appendChild(panneau);

    panneau.addEventListener('click', function (e) {
      if (e.target.closest('[data-cal-fermer]')) return fermer();
      var l = e.target.closest('[data-logement]');
      if (l) { s.logement = l.getAttribute('data-logement'); s.arrivee = s.depart = null; s.message = ''; s.mois = premierMois(s.logement); return dessiner(); }
      var f = e.target.closest('[data-cal-mois]');
      if (f) { var d = date(s.mois + '-01'); d.setMonth(d.getMonth() + +f.getAttribute('data-cal-mois')); s.mois = cle(d).slice(0, 7); return dessiner(); }
      var j = e.target.closest('[data-jour]');
      if (j) return choisir(j.getAttribute('data-jour'));
      var c = e.target.closest('.cal__continuer');
      if (c && c.getAttribute('aria-disabled') === 'true') { e.preventDefault(); s.message = s.arrivee ? 'Choisissez maintenant votre date de départ.' : 'Choisissez d’abord votre date d’arrivée.'; dessiner(); }
    });
    panneau.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermer();
      if (e.key === 'Tab') { // le focus reste dans le panneau
        var f = $$('button, a[href]', $('.cal__panneau', panneau)).filter(function (x) { return x.offsetParent !== null; });
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  function choisir(k) {
    var e = etat(s.logement, k);
    if (!s.arrivee || s.depart || k <= s.arrivee) {
      // choix de l'arrivée : la première nuit doit être libre
      if (e !== 'libre') { s.message = e === 'reserve' ? 'This day is already booked.' : 'The accommodation is closed on that day.'; return dessiner(); }
      s.arrivee = k; s.depart = null; s.message = 'Now choose your departure date.';
      return dessiner();
    }
    // choix du départ : toutes les nuits entre l'arrivée et la veille du départ doivent être libres
    for (var n = s.arrivee; n < k; n = plus(n, 1)) {
      if (etat(s.logement, n) !== 'libre') { s.message = 'A night in this period is already taken: please choose other dates.'; return dessiner(); }
    }
    var nuits = Math.round((date(k) - date(s.arrivee)) / 864e5), mini = minimum(s.logement, s.arrivee, k);
    if (nuits < mini) { s.message = mini === 3 ? 'In summer, 3 nights minimum at the château.' : mini + ' nights minimum.'; return dessiner(); }
    s.depart = k; s.message = '';
    dessiner();
  }

  function dessiner() {
    $$('[data-logement]', panneau).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-logement') === s.logement); });
    var premier = date(s.mois + '-01');
    $('.cal__titre-mois', panneau).textContent = MOIS[premier.getMonth()] + ' ' + premier.getFullYear();
    $('[data-cal-mois="-1"]', panneau).disabled = s.mois <= aujourdhui.slice(0, 7);
    var html = '', decalage = (premier.getDay() + 6) % 7;
    for (var i = 0; i < decalage; i++) html += '<span class="cal__vide"></span>';
    for (var d = new Date(premier); d.getMonth() === premier.getMonth(); d.setDate(d.getDate() + 1)) {
      var k = cle(d), e = etat(s.logement, k), classes = 'cal__jour cal__jour--' + e;
      if (k === s.arrivee) classes += ' est-arrivee';
      if (k === s.depart) classes += ' est-depart';
      if (s.arrivee && s.depart && k > s.arrivee && k < s.depart) classes += ' est-dans';
      var nom = lisible(k) + ', ' + { libre: 'available', reserve: 'booked', ferme: 'closed', passe: 'past' }[e];
      html += '<button type="button" class="' + classes + '" data-jour="' + k + '"' + (e === 'passe' ? ' disabled' : '') +
        (e === 'libre' || (s.arrivee && !s.depart && k > s.arrivee) ? '' : ' aria-disabled="true"') + ' aria-label="' + nom + '">' + d.getDate() + '</button>';
    }
    $('.cal__grille', panneau).innerHTML = html;
    var choix = $('.cal__choix', panneau), suite = $('.cal__continuer', panneau);
    if (s.arrivee && s.depart) {
      var nuits = Math.round((date(s.depart) - date(s.arrivee)) / 864e5);
      choix.innerHTML = '<strong>' + DISPOS[s.logement].nom + '</strong><br>From ' + lisible(s.arrivee) + ' to ' + lisible(s.depart) + ' · ' + nuits + ' nights';
      suite.href = 'contact.html?projet=' + (DISPOS[s.logement].projet || 'gite') + '&logement=' + s.logement + '&arrivee=' + s.arrivee + '&depart=' + s.depart + '#demande';
      suite.removeAttribute('aria-disabled');
    } else {
      choix.textContent = s.message || (s.arrivee ? 'Arriving ' + lisible(s.arrivee) + '. Now choose your departure date.' : 'Choose your arrival date.');
      suite.href = 'contact.html#demande';
      suite.setAttribute('aria-disabled', 'true');
    }
    if (s.message && s.arrivee && s.depart) choix.innerHTML += '<br>' + s.message;
  }

  function ouvrir(e) {
    if (!DISPOS) return;
    if (e) e.preventDefault();
    if (!panneau) construire();
    ouvreur = document.activeElement;
    // un bouton peut choisir le logement d'avance (data-calendrier="chateau" sur la page du château…)
    var voulu = e && e.currentTarget && e.currentTarget.getAttribute('data-calendrier');
    if (voulu && DISPOS[voulu] && voulu !== s.logement) { s.logement = voulu; s.arrivee = s.depart = null; s.message = ''; s.mois = null; }
    if (!s.mois) s.mois = premierMois(s.logement);
    dessiner();
    panneau.hidden = false;
    document.body.classList.add('cal-ouvert');
    var entete = $('.entete');
    if (entete && entete.classList.contains('menu-ouvert')) $('.entete__burger').click();
    requestAnimationFrame(function () { panneau.classList.add('est-ouvert'); $('.cal__fermer', panneau).focus(); });
  }
  function fermer() {
    panneau.classList.remove('est-ouvert');
    document.body.classList.remove('cal-ouvert');
    setTimeout(function () { panneau.hidden = true; }, 350);
    if (ouvreur && ouvreur.focus) ouvreur.focus();
  }

  $$('[data-calendrier]').forEach(function (b) { b.addEventListener('click', ouvrir); });

  /* Page contact : on reprend les dates et le logement choisis dans le panneau ---------------- */
  var form = $('form[data-formulaire]');
  var p = new URLSearchParams(location.search);
  if (form && DISPOS && p.get('arrivee')) {
    var d1 = $('#c-date1', form), d2 = $('#c-date2', form), msg = $('[name="message"]', form);
    if (d1) d1.value = p.get('arrivee');
    if (d2 && p.get('depart')) d2.value = p.get('depart');
    var l = DISPOS[p.get('logement')];
    if (l && msg && !msg.value) msg.value = 'Preferred accommodation: ' + l.nom + ' (' + l.detail + ').';
  }
})();
