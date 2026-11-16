/**
 * app.js : Coach APA'R (lot 1)
 * Script unique des 11 pages. Sans dépendance.
 * - menu téléphone de l'en-tête commun ;
 * - formulaire de contact (pages/contact.html) ;
 * - widget de demande de rendez-vous (accueil).
 * Formulaires : Formspree https://formspree.io/f/xwplpobd
 * Règle conservée du lot 0 : le succès ne s'affiche que si Formspree répond OK.
 */

'use strict';

const SPRITE = '/images/icons.svg';
const FORMSPREE_URL = 'https://formspree.io/f/xwplpobd';

/** Petit gabarit d'icône du sprite local (décorative). */
function icon(name, extra) {
  return `<svg class="icon${extra ? ' ' + extra : ''}" aria-hidden="true"><use href="${SPRITE}#i-${name}"/></svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MENU TÉLÉPHONE
// ─────────────────────────────────────────────────────────────────────────────

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-mobile');
  if (!toggle || !menu) return;
  const label = toggle.querySelector('.menu-toggle__label');
  const use = toggle.querySelector('use');

  function setMenu(open, { returnFocus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (label) label.textContent = open ? 'Fermer' : 'Menu';
    if (use) use.setAttribute('href', `${SPRITE}#i-${open ? 'close' : 'menu'}`);
    if (open) {
      const first = menu.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));

  // Échap ferme le menu et rend le focus au bouton
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, { returnFocus: true });
    }
  });

  // Un clic sur un lien du menu le ferme
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  // Passage en grand écran : le menu téléphone n'a plus lieu d'être
  const wide = window.matchMedia('(min-width: 64rem)');
  wide.addEventListener('change', (e) => { if (e.matches) setMenu(false); });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ERREURS DE CHAMP (communes aux deux formulaires)
// ─────────────────────────────────────────────────────────────────────────────

/** Message précis pour un champ invalide. */
function errorMessageFor(field) {
  const v = field.validity;
  if (field.type === 'radio') return 'Choisissez comment vous préférez être contacté.';
  if (v.typeMismatch && field.type === 'email') return 'Adresse email incomplète, par exemple nom@exemple.fr.';
  if (v.valueMissing) {
    switch (field.type) {
      case 'email': return 'Indiquez votre adresse email, par exemple nom@exemple.fr.';
      case 'tel': return 'Indiquez votre numéro de téléphone, par exemple 06 12 34 56 78.';
      default: return 'Indiquez votre nom.';
    }
  }
  return 'Ce champ est à vérifier.';
}

/** Retire l'erreur affichée sous un champ (ou un groupe de boutons radio). */
function clearFieldError(form, field) {
  const key = field.type === 'radio' ? field.name : field.id;
  const err = form.querySelector(`[data-error-for="${key}"]`);
  const targets = field.type === 'radio' ? form.querySelectorAll(`input[name="${field.name}"]`) : [field];
  targets.forEach((t) => {
    t.removeAttribute('aria-invalid');
    if (err) {
      const ids = (t.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== err.id);
      if (ids.length) t.setAttribute('aria-describedby', ids.join(' '));
      else t.removeAttribute('aria-describedby');
    }
  });
  if (err) err.remove();
}

/** Affiche l'erreur sous le champ, reliée par aria-describedby. */
function showFieldError(form, field) {
  clearFieldError(form, field);
  const key = field.type === 'radio' ? field.name : field.id;
  const err = document.createElement('p');
  err.className = 'field-error';
  err.id = `${key}-erreur`;
  err.dataset.errorFor = key;
  err.innerHTML = `${icon('alerte')}<span></span>`;
  err.querySelector('span').textContent = errorMessageFor(field);
  const targets = field.type === 'radio' ? form.querySelectorAll(`input[name="${field.name}"]`) : [field];
  targets.forEach((t) => {
    t.setAttribute('aria-invalid', 'true');
    const ids = (t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    ids.unshift(err.id);
    t.setAttribute('aria-describedby', ids.join(' '));
  });
  const container = field.closest('.field');
  if (field.type === 'radio') container.appendChild(err);
  else field.insertAdjacentElement('afterend', err);
}

/**
 * Vérifie le formulaire. Affiche une erreur sous chaque champ invalide,
 * place le focus sur le premier. Retourne true si tout est valide.
 */
function validateForm(form) {
  let first = null;
  const seenRadio = new Set();
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type === 'hidden' || field.closest('.honeypot')) return;
    if (field.type === 'radio') {
      if (seenRadio.has(field.name)) return;
      seenRadio.add(field.name);
    }
    if (!field.checkValidity()) {
      showFieldError(form, field);
      if (!first) first = field;
    } else {
      clearFieldError(form, field);
    }
  });
  if (first) first.focus();
  return !first;
}

/** Une erreur disparaît dès que le champ redevient valide. */
function watchFieldErrors(form) {
  form.addEventListener('input', (e) => {
    const f = e.target;
    if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) clearFieldError(form, f);
  });
  form.addEventListener('change', (e) => {
    const f = e.target;
    if (f.type === 'radio' && f.checked) clearFieldError(form, f);
  });
}

/**
 * Remplit une zone de statut (.status). Les erreurs sont annoncées tout de suite.
 * @param {HTMLElement} status
 * @param {'pending'|'success'|'error'} type
 * @param {string} title  Titre écrit (jamais de couleur seule)
 * @param {string} [text] Précision
 */
function setStatus(status, type, title, text) {
  if (!status) return;
  status.setAttribute('role', type === 'error' ? 'alert' : 'status');
  status.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  status.className = `status status--${type}`;
  const iconName = { pending: 'chargement', success: 'succes', error: 'alerte' }[type];
  status.innerHTML = `${icon(iconName, type === 'pending' ? 'spinner' : '')}<p><strong></strong><span></span></p>`;
  status.querySelector('strong').textContent = title;
  status.querySelector('span').textContent = text ? ` ${text}` : '';
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('is-loading', loading);
  if (loading) {
    btn.innerHTML = `${icon('chargement', 'spinner')}<span>Envoi en cours…</span>`;
  } else {
    btn.textContent = label;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FORMULAIRE DE CONTACT (pages/contact.html)
// ─────────────────────────────────────────────────────────────────────────────

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const status = document.getElementById('contactStatus');
  const originalLabel = submitBtn ? submitBtn.textContent.trim() : 'Envoyer';
  let sending = false;

  // Pré-sélection du service depuis l'adresse (ex. contact.html?service=cours-pilates)
  const serviceSelect = document.getElementById('service');
  const wanted = new URLSearchParams(window.location.search).get('service');
  if (serviceSelect && wanted && serviceSelect.querySelector(`option[value="${CSS.escape(wanted)}"]`)) {
    serviceSelect.value = wanted;
  }

  watchFieldErrors(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!validateForm(form)) return;

    sending = true;
    setButtonLoading(submitBtn, true);
    setStatus(status, 'pending', 'Envoi en cours…', 'Merci de patienter quelques secondes.');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        form.reset();
        setStatus(status, 'success', 'Message envoyé !', 'Je vous répondrai dans les plus brefs délais.');
      } else {
        setStatus(status, 'error', "Votre message n'a pas pu être envoyé.",
          'Votre texte est conservé : réessayez dans un instant, ou écrivez-moi à coachapar@gmail.com, ou appelez le 07 65 77 51 04.');
      }
    } catch (err) {
      console.error('Formulaire de contact :', err);
      setStatus(status, 'error', "Votre message n'a pas pu être envoyé.",
        'Votre texte est conservé : réessayez dans un instant, ou écrivez-moi à coachapar@gmail.com, ou appelez le 07 65 77 51 04.');
    } finally {
      sending = false;
      setButtonLoading(submitBtn, false, originalLabel);
      if (status) status.focus();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  try { initMobileMenu(); } catch (e) { console.error('initMobileMenu:', e); }
  try { initContactForm(); } catch (e) { console.error('initContactForm:', e); }
});
