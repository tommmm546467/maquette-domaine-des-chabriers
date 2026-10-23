/* Domaine des Chabriers : scripts du site (sans bibliothèque) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var NBSP = ' ';

  /* En-tête : fond au défilement, menu sur téléphone ------------------- */
  var entete = $('.entete');
  if (entete) {
    var surHeros = !!$('.heros, .demande');
    if (!surHeros) entete.classList.add('est-plein');
    var majEntete = function () { entete.classList.toggle('est-defile', window.scrollY > 40); };
    majEntete();
    window.addEventListener('scroll', majEntete, { passive: true });
    var burger = $('.entete__burger');
    if (burger) burger.addEventListener('click', function () {
      var ouvert = entete.classList.toggle('menu-ouvert');
      burger.setAttribute('aria-expanded', ouvert);
      document.body.style.overflow = ouvert ? 'hidden' : '';
    });
  }

  var video = $('.heros__video');
  // Certains navigateurs bloquent la lecture automatique : on la relance une fois, sinon l'affiche reste.
  if (video && video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }

  /* Apparitions au défilement ----------------------------------------- */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('est-visible'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.apparait').forEach(function (el) { obs.observe(el); });
  } else {
    $$('.apparait').forEach(function (el) { el.classList.add('est-visible'); });
  }

  /* Diaporamas : une photo toutes les 3 secondes, en fondu ----------------- */
  $$('[data-diaporama]').forEach(function (d) {
    var photos = $$('img', d);
    if (photos.length < 2) return;
    var i = 0;
    setInterval(function () {
      photos[i].classList.remove('est-visible');
      i = (i + 1) % photos.length;
      photos[i].loading = 'eager';
      photos[i].classList.add('est-visible');
    }, 3000);
  });

  /* Frise de l'histoire : le trait se dessine et les points s'allument au défilement */
  $$('.frise').forEach(function (frise) {
    var trait = document.createElement('span');
    trait.className = 'frise__trait';
    trait.setAttribute('aria-hidden', 'true');
    frise.appendChild(trait);
    var jalons = $$('li', frise);
    var maj = function () {
      var r = frise.getBoundingClientRect();
      var hauteur = Math.min(r.height, Math.max(0, window.innerHeight * 0.7 - r.top));
      trait.style.height = hauteur + 'px';
      jalons.forEach(function (li) { li.classList.toggle('est-allume', li.offsetTop + 10 <= hauteur); });
    };
    maj();
    window.addEventListener('scroll', maj, { passive: true });
    window.addEventListener('resize', maj);
  });

  /* Bande d'avis : on double la piste pour une boucle sans couture ------ */
  $$('.defile__piste').forEach(function (piste) {
    piste.innerHTML += piste.innerHTML;
    $$('.carte-avis', piste).slice(piste.children.length / 2).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });
  });

  /* Fiches en fenêtre (chambres) --------------------------------------- */
  $$('[data-fiche]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var d = document.getElementById(bouton.getAttribute('data-fiche'));
      if (d && d.showModal) { d.showModal(); history.replaceState(null, '', '#' + d.id); }
    });
  });
  $$('dialog.fiche').forEach(function (d) {
    $('.fiche__fermer', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { history.replaceState(null, '', location.pathname + location.search); });
  });
  if (location.hash) {
    var cible = document.getElementById(location.hash.slice(1));
    if (cible && cible.tagName === 'DIALOG') cible.showModal();
  }

  /* Plan du domaine : chaque bloc allume sa lettre sur la carte -------------- */
  var plan = $('.plan--blocs');
  if (plan) {
    var allumer = function (lettre) {
      $$('[data-bloc]', plan).forEach(function (el) { el.classList.toggle('est-allume', el.getAttribute('data-bloc') === lettre); });
    };
    $$('.bloc', plan).forEach(function (b) {
      var lettre = b.getAttribute('data-bloc');
      b.addEventListener('mouseenter', function () { allumer(lettre); });
      b.addEventListener('focusin', function () { allumer(lettre); });
      b.addEventListener('mouseleave', function () { allumer(null); });
      b.addEventListener('focusout', function () { allumer(null); });
    });
  }

  /* Carrousel centré, voisines floutées, en boucle --------------------- */
  // Les photos sont copiées avant et après : on voit toujours une voisine floutée de chaque côté,
  // et en passant la dernière on retombe sans à-coup sur la première (et inversement).
  $$('[data-carrousel]').forEach(function (car) {
    var piste = $('.carrousel__piste', car);
    var originaux = $$('.diapo', piste);
    var n = originaux.length;
    var copie = function (d) { var c = d.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-copie', ''); $$('img', c).forEach(function (im) { im.alt = ''; }); return c; };
    originaux.forEach(function (d) { piste.insertBefore(copie(d), originaux[0]); });
    originaux.forEach(function (d) { piste.appendChild(copie(d)); });
    var toutes = $$('.diapo', piste);
    var pos = n, i = 0, attente = null;
    var points = $('.carrousel__points', car);
    originaux.forEach(function (d, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (k + 1));
      b.addEventListener('click', function () { aller(k - i); });
      points.appendChild(b);
    });
    function placer(k, anime) {
      car.classList.toggle('sans-transition', !anime);
      var d = toutes[k];
      var decalage = d.offsetLeft - (car.clientWidth - d.offsetWidth) / 2;
      piste.style.transform = 'translateX(' + (-decalage) + 'px)';
      toutes.forEach(function (x, m) { x.classList.toggle('est-active', m === k); });
      if (!anime) { void piste.offsetWidth; car.classList.remove('sans-transition'); }
    }
    function aller(pas) {
      if (attente) { clearTimeout(attente); recaler(); }
      pos += pas;
      i = ((pos - n) % n + n) % n;
      placer(pos, true);
      $$('button', points).forEach(function (b, k) { b.setAttribute('aria-current', k === i); });
      originaux.forEach(function (d, k) { d.setAttribute('aria-hidden', k !== i); });
      attente = setTimeout(recaler, 720);
    }
    function recaler() { attente = null; if (pos < n || pos >= 2 * n) { pos = n + i; placer(pos, false); } }
    $('.carrousel__fleche--g', car).addEventListener('click', function () { aller(-1); });
    $('.carrousel__fleche--d', car).addEventListener('click', function () { aller(1); });
    var depart = null;
    car.addEventListener('touchstart', function (e) { depart = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (depart === null) return;
      var dx = e.changedTouches[0].clientX - depart;
      if (Math.abs(dx) > 40) aller(dx < 0 ? 1 : -1);
      depart = null;
    });
    window.addEventListener('resize', function () { placer(pos, false); });
    placer(pos, false);
    $$('button', points).forEach(function (b, k) { b.setAttribute('aria-current', k === 0); });
  });

  /* Rails à flèches ------------------------------------------------------ */
  $$('[data-rail]').forEach(function (bloc) {
    var rail = $('.rail', bloc);
    var pas = function () { return rail.firstElementChild ? rail.firstElementChild.offsetWidth + 22 : 300; };
    $('[data-rail-g]', bloc).addEventListener('click', function () { rail.scrollBy({ left: -pas(), behavior: 'smooth' }); });
    $('[data-rail-d]', bloc).addEventListener('click', function () { rail.scrollBy({ left: pas(), behavior: 'smooth' }); });
  });

  /* Témoignages à flèches rondes ----------------------------------------- */
  $$('[data-temoins]').forEach(function (bloc) {
    var temoins = $$('.temoin', bloc);
    var photo = $('.temoins__photo img', bloc);
    var compte = $('.temoins__compte', bloc);
    var i = 0;
    function montrer(n) {
      i = (n + temoins.length) % temoins.length;
      temoins.forEach(function (t, k) { t.classList.toggle('est-actif', k === i); });
      var src = temoins[i].getAttribute('data-photo');
      if (src && photo) { photo.style.opacity = 0; setTimeout(function () { photo.src = src; photo.style.opacity = 1; }, 250); }
      if (compte) compte.textContent = (i + 1) + ' / ' + temoins.length;
    }
    $('[data-temoin-g]', bloc).addEventListener('click', function () { montrer(i - 1); });
    $('[data-temoin-d]', bloc).addEventListener('click', function () { montrer(i + 1); });
    montrer(0);
  });

  /* Fil du jour J qui se dessine ------------------------------------------ */
  var fil = $('.jour-j__fil span');
  if (fil) {
    var jour = $('.jour-j');
    var majFil = function () {
      var r = jour.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * .6 - r.top) / r.height));
      fil.style.height = (p * 100) + '%';
    };
    majFil();
    window.addEventListener('scroll', majFil, { passive: true });
  }

  /* Visionneuse : une photo en grand, avec ses voisines du même groupe ------ */
  var vis = null, groupe = [], rang = 0;
  function montrerPhoto() {
    var im = groupe[rang];
    $('img', vis).src = im.currentSrc || im.src;
    $('img', vis).alt = im.alt;
    $('.visionneuse__legende', vis).textContent = im.alt;
    var seule = groupe.length < 2;
    $('.visionneuse__prec', vis).hidden = seule; $('.visionneuse__suiv', vis).hidden = seule;
  }
  function agrandir(img) {
    if (!vis) {
      vis = document.createElement('dialog');
      vis.className = 'visionneuse';
      vis.setAttribute('aria-label', 'Enlarged photo');
      vis.innerHTML = '<img alt=""><p class="visionneuse__legende"></p>' +
        '<button class="visionneuse__fermer" type="button" aria-label="Close">×</button>' +
        '<button class="visionneuse__prec" type="button" aria-label="Previous photo">←</button>' +
        '<button class="visionneuse__suiv" type="button" aria-label="Next photo">→</button>';
      document.body.appendChild(vis);
      $('.visionneuse__fermer', vis).addEventListener('click', function () { vis.close(); });
      $('.visionneuse__prec', vis).addEventListener('click', function () { rang = (rang - 1 + groupe.length) % groupe.length; montrerPhoto(); });
      $('.visionneuse__suiv', vis).addEventListener('click', function () { rang = (rang + 1) % groupe.length; montrerPhoto(); });
      vis.addEventListener('click', function (e) { if (e.target === vis) vis.close(); });
      vis.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') $('.visionneuse__suiv', vis).click();
        if (e.key === 'ArrowLeft') $('.visionneuse__prec', vis).click();
      });
    }
    var bloc = img.closest('.eventail, .fiche__photos') || img.parentNode;
    groupe = $$('[data-agrandir]', bloc);
    rang = Math.max(0, groupe.indexOf(img));
    montrerPhoto();
    vis.showModal();
  }
  document.addEventListener('click', function (e) {
    var cible = e.target.closest('[data-agrandir], .eventail figure');
    if (!cible) return;
    agrandir(cible.matches('[data-agrandir]') ? cible : $('[data-agrandir]', cible));
  });
  $$('.eventail figure').forEach(function (f) {
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); agrandir($('[data-agrandir]', f)); } });
  });

  /* Agenda des stages : passés et à venir se rangent seuls ----------------- */
  var agenda = $('[data-agenda]');
  if (agenda && window.STAGES) {
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    var aVenir = [], passes = [];
    window.STAGES.forEach(function (s) { (new Date(s.fin + 'T23:59:59') < auj ? passes : aVenir).push(s); });
    aVenir.sort(function (a, b) { return a.debut < b.debut ? -1 : 1; });
    passes.sort(function (a, b) { return a.debut < b.debut ? 1 : -1; });
    var mois = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var carte = function (s, passe) {
      var d = new Date(s.debut + 'T12:00:00'), f = new Date(s.fin + 'T12:00:00');
      var el = document.createElement('article');
      el.className = 'stage' + (passe ? ' stage--passe' : '');
      el.innerHTML =
        '<div class="stage__date"><strong>' + d.getDate() + '</strong><span>to ' + f.getDate() + ' ' + mois[f.getMonth()] + '<br>' + f.getFullYear() + '</span></div>' +
        '<div class="stage__corps">' + (passe ? '<span class="etiquette">Past event</span>' : '<span class="etiquette">' + s.theme + '</span>') +
        '<h3>' + s.titre + '</h3><p>' + s.texte + '</p><div class="stage__liens">' +
        (s.page && !passe ? '<a class="bouton bouton--ligne" href="' + s.page + '">See the programme</a>' : '') +
        (s.plaquette ? '<a class="bouton bouton--ligne" href="' + s.plaquette + '" target="_blank" rel="noopener">Brochure</a>' : '') +
        (passe ? '' : '<a class="bouton" href="contact.html?projet=stage#demande">Book my retreat</a>') +
        '</div></div>';
      return el;
    };
    var zoneVenir = $('[data-agenda-venir]', agenda);
    var zonePasses = $('[data-agenda-passes]', agenda);
    var vide = $('[data-agenda-vide]', agenda);
    aVenir.forEach(function (s) { zoneVenir.appendChild(carte(s, false)); });
    passes.forEach(function (s) { zonePasses.appendChild(carte(s, true)); });
    vide.hidden = aVenir.length > 0;
    zoneVenir.hidden = aVenir.length === 0;
    $('[data-agenda-passes-bloc]', agenda).hidden = passes.length === 0;
  }

  /* Formulaire unique : préremplissage et préparation de l'e-mail ----------- */
  var form = $('form[data-formulaire]');
  if (form) {
    var params = new URLSearchParams(location.search);
    var projet = params.get('projet');
    if (projet) {
      var bulle = $('input[name="projet"][value="' + projet + '"]', form);
      if (bulle) bulle.checked = true;
    }
    var majProjet = function () {
      var p = ($('input[name="projet"]:checked', form) || {}).value || '';
      var evenement = /mariage|fete|concert/.test(p);
      $('[data-libelle-date1]', form).textContent = evenement ? 'Preferred date' : 'Arrival';
      $('[data-champ-date2]', form).hidden = evenement;
    };
    $$('input[name="projet"]', form).forEach(function (r) { r.addEventListener('change', majProjet); });
    majProjet();
    var auj2 = new Date().toISOString().slice(0, 10);
    $$('input[type="date"]', form).forEach(function (c) { c.min = auj2; });

    var erreurs = $('.formulaire__erreurs', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var manque = [];
      $$('[aria-invalid]', form).forEach(function (c) { c.removeAttribute('aria-invalid'); });
      if (!$('input[name="projet"]:checked', form)) manque.push('your project');
      $$('[required]', form).forEach(function (c) {
        if (c.type === 'radio') return;
        if (!c.value.trim() || !c.checkValidity()) { c.setAttribute('aria-invalid', 'true'); manque.push(c.getAttribute('data-manque')); }
      });
      if (manque.length) {
        var liste = manque.length > 1 ? manque.slice(0, -1).join(', ') + ' and ' + manque[manque.length - 1] : manque[0];
        erreurs.textContent = 'Please add ' + liste + ' so that Céline can reply to you.';
        erreurs.hidden = false;
        return;
      }
      erreurs.hidden = true;
      // Aucun service d'envoi n'est branché sur la maquette : on prépare l'e-mail.
      var lignes = [];
      var choix = $('input[name="projet"]:checked', form);
      lignes.push('Project: ' + $('label[for="' + choix.id + '"]', form).textContent);
      $$('.champ', form).forEach(function (ch) {
        if (ch.hidden) return;
        var c = $('input, select, textarea', ch);
        if (!c || !c.value.trim() || c.name === 'message') return;
        var v = c.value.trim();
        if (c.type === 'date') v = new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        lignes.push($('label', ch).textContent.replace(/\s*\*$/, '') + ': ' + v);
      });
      var message = $('[name="message"]', form).value.trim();
      if (message) lignes.push('', message);
      var lien = 'mailto:domainedeschabriers@gmail.com?subject=' + encodeURIComponent('Request from the website: ' + $('label[for="' + choix.id + '"]', form).textContent) + '&body=' + encodeURIComponent(lignes.join('\n'));
      var merci = $('.formulaire__merci');
      form.hidden = true; merci.hidden = false;
      $('a', merci).href = lien;
    });
  }

  /* Année du pied de page */
  $$('[data-annee]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
