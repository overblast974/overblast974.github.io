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
// 4. WIDGET DE DEMANDE DE RENDEZ-VOUS (accueil)
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_TITLE = MONTHS_FR.map((m) => m.charAt(0).toUpperCase() + m.slice(1));
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_LONG = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const BOOKING_SUBMIT_LABEL = 'Confirmer ma demande de contact';

/** Première date réservable (absence de Loïc jusque-là). Mettre null pour la désactiver. */
const BOOKING_FIRST_DAY = new Date(2027, 0, 11);

class BookingCalendar {
  constructor(container) {
    this.container = container;
    this.TIMESLOTS = ['17:30', '18:30', '19:30', '20:30'];
    this.SATURDAY_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const start = this.firstMonth();
    this.currentYear = start.getFullYear();
    this.currentMonth = start.getMonth();
    this.selectedDate = null;
    this.selectedTime = null;
    this.sending = false;

    this.container.innerHTML = '';
    this.calendarEl = document.createElement('div');
    this.calendarEl.className = 'calendar';
    this.detailsEl = document.createElement('div');
    this.detailsEl.className = 'booking';
    this.container.append(this.calendarEl, this.detailsEl);
    this.renderCalendar();
  }

  static sameDay(a, b) {
    return Boolean(a && b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /** Dimanche : pas de rendez-vous. */
  isWeekend(date) {
    return date.getDay() === 0;
  }

  /** Créneaux du jour : soirée en semaine, journée le samedi. */
  slotsFor(date) {
    return date.getDay() === 6 ? this.SATURDAY_SLOTS : this.TIMESLOTS;
  }

  /** Mois où commence le calendrier : le mois courant, ou celui de la première date réservable. */
  firstMonth() {
    const now = new Date();
    const first = BOOKING_FIRST_DAY && BOOKING_FIRST_DAY > now ? BOOKING_FIRST_DAY : now;
    return new Date(first.getFullYear(), first.getMonth(), 1);
  }

  /** Jour passé, avant la première date réservable, ou aujourd'hui après 17 h (plus de créneau). */
  isPast(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < today) return true;
    if (BOOKING_FIRST_DAY && d < BOOKING_FIRST_DAY) return true;
    if (d.getTime() === today.getTime() && now.getHours() >= (d.getDay() === 6 ? 15 : 20)) return true;
    return false;
  }

  renderCalendar({ focusDay = false } = {}) {
    const now = new Date();
    const isPrevDisabled = new Date(this.currentYear, this.currentMonth, 1) <= this.firstMonth();
    const title = `${MONTHS_TITLE[this.currentMonth]} ${this.currentYear}`;

    let html = `
      <div class="calendar__head">
        <button type="button" class="calendar__nav calendar__nav--prev" ${isPrevDisabled ? 'disabled' : ''}>${icon('arrow-right')}<span class="visually-hidden">Mois précédent</span></button>
        <p class="calendar__title" id="calendar-titre" aria-live="polite">${title}</p>
        <button type="button" class="calendar__nav calendar__nav--next">${icon('arrow-right')}<span class="visually-hidden">Mois suivant</span></button>
      </div>
      <div class="calendar__grid" role="group" aria-labelledby="calendar-titre">`;
    DAYS_SHORT.forEach((d) => { html += `<span class="calendar__dayname" aria-hidden="true">${d}</span>`; });

    const first = new Date(this.currentYear, this.currentMonth, 1);
    let offset = first.getDay() - 1;
    if (offset < 0) offset = 6;
    for (let i = 0; i < offset; i++) html += '<span class="calendar__day" aria-hidden="true"></span>';

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const label = `${DAYS_LONG[date.getDay()]} ${day} ${MONTHS_FR[this.currentMonth]}`;
      const today = BookingCalendar.sameDay(date, now) ? ' is-today' : '';
      if (this.isPast(date) || this.isWeekend(date)) {
        html += `<span class="calendar__day${today}"><span aria-hidden="true">${day}</span><span class="visually-hidden">${label} (indisponible)</span></span>`;
      } else {
        const pressed = BookingCalendar.sameDay(date, this.selectedDate);
        html += `<button type="button" class="calendar__day${today}" data-day="${day}" aria-pressed="${pressed}" aria-label="${label}${today ? ' (aujourd’hui)' : ''}">${day}</button>`;
      }
    }
    html += '</div><p class="calendar__legend">Du lundi au samedi. Choisissez un jour, puis un créneau.</p>';
    this.calendarEl.innerHTML = html;

    this.calendarEl.querySelector('.calendar__nav--prev').addEventListener('click', () => this.changeMonth(-1));
    this.calendarEl.querySelector('.calendar__nav--next').addEventListener('click', () => this.changeMonth(1));
    this.calendarEl.querySelectorAll('button[data-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectDate(new Date(this.currentYear, this.currentMonth, Number(btn.dataset.day)));
      });
    });
    if (focusDay) {
      const target = this.calendarEl.querySelector('button[data-day]');
      if (target) target.focus();
    }
  }

  changeMonth(delta) {
    const now = new Date();
    let m = this.currentMonth + delta;
    let y = this.currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (new Date(y, m, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) return;
    this.currentMonth = m;
    this.currentYear = y;
    this.selectedDate = null;
    this.selectedTime = null;
    this.detailsEl.innerHTML = '';
    this.renderCalendar();
    // garder le focus sur le bouton utilisé
    const btn = this.calendarEl.querySelector(delta < 0 ? '.calendar__nav--prev' : '.calendar__nav--next');
    if (btn && !btn.disabled) btn.focus();
    else this.calendarEl.querySelector('.calendar__nav--next').focus();
  }

  selectDate(date) {
    this.selectedDate = date;
    this.selectedTime = null;
    this.calendarEl.querySelectorAll('button[data-day]').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.day) === date.getDate()));
    });
    this.renderTimeSlots(date);
  }

  displayDate(date) {
    return `${DAYS_LONG[date.getDay()]} ${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
  }

  renderTimeSlots(date) {
    const now = new Date();
    const isToday = BookingCalendar.sameDay(date, now);
    const slots = this.slotsFor(date).filter((time) => {
      if (!isToday) return true;
      const [h, m] = time.split(':').map(Number);
      const t = new Date(now);
      t.setHours(h, m, 0, 0);
      return t > now;
    });

    const block = document.createElement('div');
    block.className = 'slots-block';
    const titleId = 'creneaux-titre';
    block.innerHTML = `<p class="slots-block__title" id="${titleId}">Créneaux proposés : ${this.displayDate(date)}</p>`;
    if (!slots.length) {
      block.insertAdjacentHTML('beforeend', '<p class="muted">Aucun créneau proposé pour ce jour.</p>');
    } else {
      const row = document.createElement('div');
      row.className = 'slots';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-labelledby', titleId);
      slots.forEach((time) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot';
        btn.dataset.time = time;
        btn.textContent = time.replace(':', 'h');
        btn.setAttribute('aria-pressed', String(this.selectedTime === time));
        btn.addEventListener('click', () => {
          this.selectedTime = time;
          row.querySelectorAll('.slot').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          this.renderForm(date, time);
        });
        row.appendChild(btn);
      });
      block.appendChild(row);
    }
    this.detailsEl.innerHTML = '';
    this.detailsEl.appendChild(block);
  }

  renderForm(date, time) {
    this.detailsEl.querySelector('.booking-form-wrapper')?.remove();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const displayDate = this.displayDate(date);
    const displayTime = time.replace(':', 'h');

    const wrapper = document.createElement('div');
    wrapper.className = 'booking-form-wrapper booking';
    wrapper.innerHTML = `
      <p class="booking-summary">${icon('calendar')}<span>Votre demande de rendez-vous : <strong>${displayDate}</strong> à <strong>${displayTime}</strong></span></p>
      <form class="form booking-form" action="${FORMSPREE_URL}" method="POST" novalidate>
        <input type="hidden" name="date" value="${dateStr}">
        <input type="hidden" name="heure" value="${time}">
        <input type="hidden" name="_subject" value="Demande de rendez-vous — ${displayDate} à ${displayTime}">
        <p class="form__required">Les champs marqués d'un astérisque (<span class="req" aria-hidden="true">*</span>) sont obligatoires.</p>

        <div class="field">
          <label for="book-nom">Nom complet <span class="req" aria-hidden="true">*</span></label>
          <input class="input" type="text" id="book-nom" name="nom" required autocomplete="name">
        </div>

        <div class="field">
          <label for="book-tel">Téléphone <span class="req" aria-hidden="true">*</span></label>
          <input class="input" type="tel" id="book-tel" name="telephone" required autocomplete="tel">
        </div>

        <div class="field">
          <label for="book-email">Email <span class="req" aria-hidden="true">*</span></label>
          <input class="input" type="email" id="book-email" name="email" required autocomplete="email">
        </div>

        <fieldset class="field">
          <legend>Contact préféré <span class="req" aria-hidden="true">*</span></legend>
          <div class="choices">
            <label class="choice"><input type="radio" name="contact_prefere" value="Appel téléphonique" required> Appel téléphonique</label>
            <label class="choice"><input type="radio" name="contact_prefere" value="Email"> Email</label>
          </div>
        </fieldset>

        <div class="field">
          <label for="book-service">Service souhaité (facultatif)</label>
          <select class="select" id="book-service" name="service">
            <option value="">Choisissez un service</option>
            <option value="Coaching Sportif">Coaching sportif</option>
            <option value="Nutrition">Alimentation</option>
            <option value="Pilates">Pilates</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div class="field">
          <label for="book-message">Message (facultatif)</label>
          <textarea class="textarea" id="book-message" name="message" rows="4" aria-describedby="book-message-aide"></textarea>
          <p class="hint" id="book-message-aide">Votre demande : objectif, disponibilités, lieu souhaité. Merci de ne pas indiquer d'informations sur votre santé : nous en parlerons de vive voix.</p>
        </div>

        <div class="honeypot" aria-hidden="true">
          <label for="book-gotcha">Ne pas remplir ce champ</label>
          <input type="text" id="book-gotcha" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>

        <button type="submit" class="btn btn--primary btn--block">${BOOKING_SUBMIT_LABEL}</button>
        <div class="status" role="status" aria-live="polite" tabindex="-1"></div>
        <div class="privacy">
          <p>Vos données (nom, coordonnées, message) servent uniquement à répondre à votre demande. Elles sont traitées par Loïc Boyer (Coach APA'R), transmises par le service de formulaires Formspree (États-Unis) et reçues dans sa messagerie. Elles sont supprimées 12 mois après notre dernier échange si aucun accompagnement n'est engagé. <strong>Merci de ne pas indiquer d'informations sur votre santé dans ce formulaire.</strong> Vous pouvez accéder à vos données, les rectifier ou les faire effacer en écrivant à <a href="mailto:coachapar@gmail.com">coachapar@gmail.com</a>. <a href="/pages/politique-confidentialite.html">En savoir plus<span class="visually-hidden"> : politique de confidentialité</span></a></p>
        <details>
          <summary>En savoir plus</summary>
          <p><strong>Qui traite vos données ?</strong> Loïc Boyer, entrepreneur individuel, exerçant sous le nom Coach APA'R. Contact : coachapar@gmail.com.</p>
          <p><strong>Pour quoi faire ?</strong> Répondre à votre demande d'information ou de rendez-vous, avant tout engagement de votre part. Vos données ne servent à aucune prospection et ne sont ni vendues ni cédées.</p>
          <p><strong>Qui les reçoit ?</strong> Loïc Boyer uniquement. Pour l'acheminement, elles passent par Formspree, service de formulaires dont les serveurs sont aux États-Unis (transfert encadré par des clauses contractuelles types de la Commission européenne), puis par la messagerie Gmail de Google.</p>
          <p><strong>Combien de temps ?</strong> 12 mois après notre dernier échange si aucun accompagnement n'est engagé. Si vous devenez client, elles sont conservées le temps de l'accompagnement.</p>
          <p><strong>Vos droits.</strong> Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation de leur traitement ou vous opposer à leur traitement, en écrivant à coachapar@gmail.com. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).</p>
          <p><strong>Pourquoi ne pas parler de santé ici ?</strong> Les informations de santé sont des données sensibles. Elles ne doivent pas transiter par ce formulaire : nous en parlerons de vive voix lors du premier échange.</p>
        </details>
        </div>
      </form>`;
    this.detailsEl.appendChild(wrapper);

    const form = wrapper.querySelector('form');
    watchFieldErrors(form);
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (this.sending) return;
    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.status');
    this.sending = true;
    setButtonLoading(submitBtn, true);
    setStatus(status, 'pending', 'Envoi en cours…', 'Merci de patienter quelques secondes.');

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        this.showConfirmation();
        return;
      }
      this.showError(form, status, submitBtn);
    } catch (err) {
      console.error('BookingCalendar submit error:', err);
      this.showError(form, status, submitBtn);
    } finally {
      this.sending = false;
    }
  }

  showError(form, status, submitBtn) {
    setStatus(status, 'error', "Votre demande n'a pas pu être envoyée.",
      'Vos informations sont conservées : réessayez dans un instant, ou écrivez-moi à coachapar@gmail.com, ou appelez le 07 65 77 51 04.');
    setButtonLoading(submitBtn, false, BOOKING_SUBMIT_LABEL);
    status.focus();
  }

  showConfirmation() {
    this.selectedDate = null;
    this.selectedTime = null;
    this.calendarEl.querySelectorAll('button[data-day]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    this.detailsEl.innerHTML = `
      <div class="status status--success" role="status">
        ${icon('succes')}
        <div class="status__body">
          <h3 tabindex="-1">Demande envoyée !</h3>
          <p>Votre demande a été envoyée ! Je vous contacterai au plus vite pour confirmer le rendez-vous.</p>
          <button type="button" class="btn btn--secondary">Faire une nouvelle demande</button>
        </div>
      </div>`;
    this.detailsEl.querySelector('h3').focus();
    this.detailsEl.querySelector('button').addEventListener('click', () => {
      this.detailsEl.innerHTML = '';
      this.renderCalendar({ focusDay: true });
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  try { initMobileMenu(); } catch (e) { console.error('initMobileMenu:', e); }
  try { initContactForm(); } catch (e) { console.error('initContactForm:', e); }
  try {
    const bookingEl = document.getElementById('bookingWidget');
    if (bookingEl) new BookingCalendar(bookingEl);
  } catch (e) { console.error('BookingCalendar:', e); }
});
