/**
 * site.js : le seul script du site (source commentée ; le site publie js/site.js, réduit à la fabrication).
 * Aucune bibliothèque, aucun style écrit dans le balisage : le script ne pose que des classes et des
 * attributs ARIA (politique de sécurité de contenu « style-src 'self' », CONFORMITE E-53).
 * Sans script, tout le contenu est là : menu déplié (css/sans-script.css), barres pleines, rien de caché.
 * 1. Menu de l'en-tête (téléphone et tablette).
 * 2. Signature S2 « le forfait se remplit » (accueil et page Tarifs).
 * 3. Apparitions au défilement (accueil : portes du bloc 2, portrait du bloc 3).
 */
'use strict';

(function menu() {
  var bouton = document.querySelector('.menu-toggle');
  var panneau = document.getElementById('menu-mobile');
  if (!bouton || !panneau) return;
  var libelle = bouton.querySelector('.menu-toggle__label');
  var use = bouton.querySelector('use');
  function regler(ouvert, rendreFocus) {
    bouton.setAttribute('aria-expanded', String(ouvert));
    panneau.hidden = !ouvert;
    if (libelle) libelle.textContent = ouvert ? 'Fermer' : 'Menu';
    if (use) use.setAttribute('href', '/images/icons.svg#i-' + (ouvert ? 'close' : 'menu'));
    if (ouvert) { var a = panneau.querySelector('a'); if (a) a.focus(); }
    else if (rendreFocus) bouton.focus();
  }
  bouton.addEventListener('click', function () { regler(bouton.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bouton.getAttribute('aria-expanded') === 'true') regler(false, true);
  });
  panneau.addEventListener('click', function (e) { if (e.target.closest('a')) regler(false); });
  window.matchMedia('(min-width: 75rem)').addEventListener('change', function (e) { if (e.matches) regler(false); });
})();

// Garde-fous communs aux mouvements posés par le script : rien sans IntersectionObserver,
// rien en mouvement réduit, rien à l'arrivée sur une ancre (on arrive pour lire, pas pour regarder).
var bouge = 'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !location.hash;

(function forfaitQuiSeRemplit() {
  var liste = document.querySelector('.forfaits');
  if (!liste || !bouge) return;
  var r = liste.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) return;            // déjà à l'écran : on ne vide pas ce qui est lu
  liste.classList.add('forfaits--a-remplir');
  var obs = new IntersectionObserver(function (entrees) {
    if (entrees.some(function (e) { return e.isIntersecting; })) {
      liste.classList.add('forfaits--rempli');
      obs.disconnect();                                               // une seule fois par visite de la page
    }
  }, { threshold: 0.5 });
  obs.observe(liste);
})();

(function apparitions() {
  // Seuls les éléments sous le pli au chargement sont cachés puis montrés.
  var elements = Array.prototype.slice.call(document.querySelectorAll('[data-apparait]'));
  if (!elements.length || !bouge) return;
  var sousLePli = elements.filter(function (e) { return e.getBoundingClientRect().top > window.innerHeight; });
  sousLePli.forEach(function (e) { e.classList.add('apparait--attente'); });
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('apparait--vu');
      obs.unobserve(en.target);                                       // une fois par visite
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  sousLePli.forEach(function (e) { obs.observe(e); });
})();
