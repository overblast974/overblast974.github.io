/**
 * app.js — Coach APA'R Montpellier
 * Site statique GitHub Pages — Vanilla JS ES6+
 * Formulaires: Formspree https://formspree.io/f/xwplpobd
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise le comportement de la navbar:
 * - Glassmorphism au scroll (classe "scrolled")
 * - Ombre sticky
 * - Toggle menu mobile
 * - Smooth scroll sur les ancres
 * - Active link via IntersectionObserver
 * - Fermer menu mobile au clic sur un lien
 * - Fermer menu mobile au resize > 768px
 */
function initNavigation() {
  const navbar = document.querySelector('.navbar') || document.querySelector('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMobileMenu = document.querySelector('.nav-mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // --- Scroll: glassmorphism + shadow ---
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (window.scrollY > 0) {
      navbar.classList.add('shadow');
    } else {
      navbar.classList.remove('shadow');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // état initial

  // --- Menu mobile : ouverture, fermeture, états accessibles ---
  function setMobileMenu(open, { returnFocus = false } = {}) {
    if (!navToggle || !navMobileMenu) return;
    navMobileMenu.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    navMobileMenu.setAttribute('aria-hidden', String(!open));
    if (open) {
      // Léger délai : les liens héritent la transition de visibilité du menu
      const firstLink = navMobileMenu.querySelector('a');
      if (firstLink) setTimeout(() => firstLink.focus(), 60);
    } else if (returnFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', () => {
      setMobileMenu(!navMobileMenu.classList.contains('active'));
    });

    // Échap ferme le menu et rend le focus au bouton
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobileMenu.classList.contains('active')) {
        setMobileMenu(false, { returnFocus: true });
      }
    });
  }

  // --- Smooth scroll sur tous les liens href="#..." ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Fermer le menu mobile si ouvert
        if (navMobileMenu && navMobileMenu.classList.contains('active')) {
          setMobileMenu(false);
        }
        // Amener le focus clavier dans la section atteinte
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // --- Active link via IntersectionObserver ---
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // --- Resize: fermer menu mobile si > 768px ---
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900 && navMobileMenu && navMobileMenu.classList.contains('active')) {
      setMobileMenu(false);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SCROLL REVEAL ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise les animations d'apparition au scroll pour les éléments .reveal.
 * Supporte l'attribut data-delay pour les grilles.
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Style initial appliqué via JS (au cas où le CSS ne le ferait pas)
  revealEls.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise le comportement accordion des FAQ.
 * - Ouvre/ferme via max-height
 * - Ferme les autres items
 * - Rotation de l'icône
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!question || !answer) return;

    // Initialiser max-height à 0
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.35s ease';

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Fermer tous les items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
          const otherQuestion = other.querySelector('.faq-question');
          if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle l'item courant
      if (isOpen) {
        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOOKING CALENDAR WIDGET
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Widget de réservation calendrier.
 * Monte une interface complète (calendrier → créneaux → formulaire → confirmation)
 * dans l'élément identifié par elementId.
 */
class BookingCalendar {
  /**
   * @param {string} elementId - L'id de l'élément conteneur dans le DOM
   */
  constructor(elementId) {
    this.container = document.getElementById(elementId);
    if (!this.container) return;

    this.TIMESLOTS = ['17:30', '18:30', '19:30', '20:30'];
    this.FORMSPREE_URL = 'https://formspree.io/f/xwplpobd';
    this.DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    this.MONTHS_FR = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];

    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth(); // 0-indexed
    this.selectedDate = null;
    this.selectedTime = null;

    this.render();
  }

  /**
   * Rendu principal du widget.
   */
  render() {
    this.container.innerHTML = '';
    this.container.classList.add('booking-widget');

    // Wrapper calendrier
    const calendarWrapper = document.createElement('div');
    calendarWrapper.className = 'booking-calendar';
    this.container.appendChild(calendarWrapper);
    this.calendarWrapper = calendarWrapper;

    this.renderCalendar();
  }

  /**
   * Détermine si une date est un week-end.
   * @param {Date} date
   * @returns {boolean}
   */
  isWeekend(date) {
    const day = date.getDay(); // 0 = dimanche, 6 = samedi
    return day === 0 || day === 6;
  }

  /**
   * Détermine si une date est dans le passé (ou aujourd'hui avec contrainte horaire).
   * @param {Date} date
   * @returns {boolean}
   */
  isPast(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (d < today) return true;

    // Même jour: bloquer si heure actuelle > 17:00 (plus de créneaux dispo)
    if (d.getTime() === today.getTime()) {
      const lastSlotHour = 17;
      if (now.getHours() >= lastSlotHour) return true;
    }

    return false;
  }

  /**
   * Rendu du calendrier mensuel.
   */
  renderCalendar() {
    this.calendarWrapper.innerHTML = '';

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const viewStart = new Date(this.currentYear, this.currentMonth, 1);
    const isPrevDisabled = viewStart <= currentMonthStart;

    // En-tête navigation
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <button class="cal-prev" aria-label="Mois précédent" ${isPrevDisabled ? 'disabled' : ''}>&#8249;</button>
      <span class="cal-title">${this.MONTHS_FR[this.currentMonth]} ${this.currentYear}</span>
      <button class="cal-next" aria-label="Mois suivant">&#8250;</button>
    `;
    this.calendarWrapper.appendChild(header);

    header.querySelector('.cal-prev').addEventListener('click', () => this.prevMonth());
    header.querySelector('.cal-next').addEventListener('click', () => this.nextMonth());

    // Noms des jours
    const daysRow = document.createElement('div');
    daysRow.className = 'calendar-days-header';
    this.DAYS_FR.forEach((d) => {
      const cell = document.createElement('span');
      cell.className = 'cal-day-name';
      cell.textContent = d;
      daysRow.appendChild(cell);
    });
    this.calendarWrapper.appendChild(daysRow);

    // Grille des jours
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    // getDay() retourne 0=dim, 1=lun... on veut 0=lun
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6; // dimanche → offset 6

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date();

    // Cellules vides avant le 1er
    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-cell empty';
      grid.appendChild(empty);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const cell = document.createElement('div');
      cell.className = 'cal-cell';

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const disabled = this.isPast(date) || this.isWeekend(date);

      if (isToday) cell.classList.add('today');
      if (disabled) {
        cell.classList.add('disabled');
      } else {
        cell.classList.add('available');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `Sélectionner le ${day} ${this.MONTHS_FR[this.currentMonth]}`);
      }

      // Marquer jour sélectionné
      if (this.selectedDate) {
        const sel = this.selectedDate;
        if (
          date.getDate() === sel.getDate() &&
          date.getMonth() === sel.getMonth() &&
          date.getFullYear() === sel.getFullYear()
        ) {
          cell.classList.add('selected');
        }
      }

      cell.textContent = day;

      if (!disabled) {
        cell.addEventListener('click', () => this.selectDate(date, cell));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectDate(date, cell);
          }
        });
      }

      grid.appendChild(cell);
    }

    this.calendarWrapper.appendChild(grid);

    // Zone créneaux + formulaire (persistante sous le calendrier)
    const slotsContainer = document.createElement('div');
    slotsContainer.id = 'bookingSlots';
    this.container.querySelector('#bookingSlots')?.remove();
    this.container.appendChild(slotsContainer);
    this.slotsContainer = slotsContainer;

    // Ré-afficher créneaux si date déjà sélectionnée
    if (this.selectedDate) {
      this.renderTimeSlots(this.selectedDate);
    }
  }

  /**
   * Gestion du clic sur un jour disponible.
   * @param {Date} date
   * @param {HTMLElement} cell
   */
  selectDate(date, cell) {
    this.selectedDate = date;
    this.selectedTime = null;

    // Mettre à jour la classe selected dans la grille
    this.calendarWrapper.querySelectorAll('.cal-cell.selected').forEach((c) => {
      c.classList.remove('selected');
    });
    cell.classList.add('selected');

    this.renderTimeSlots(date);
  }

  /**
   * Affiche les créneaux horaires disponibles pour une date donnée.
   * @param {Date} date
   */
  renderTimeSlots(date) {
    this.slotsContainer.innerHTML = '';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const wrapper = document.createElement('div');
    wrapper.className = 'timeslots';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px)';
    wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    const title = document.createElement('p');
    title.className = 'timeslots-title';
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    title.textContent = `Créneaux disponibles — ${dayNames[date.getDay()]} ${date.getDate()} ${this.MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
    wrapper.appendChild(title);

    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'timeslots-buttons';

    let hasSlot = false;

    this.TIMESLOTS.forEach((time) => {
      // Si aujourd'hui, filtrer les créneaux passés
      if (isToday) {
        const [h, m] = time.split(':').map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) return;
      }

      hasSlot = true;
      const btn = document.createElement('button');
      btn.className = 'timeslot';
      btn.setAttribute('data-time', time);
      btn.setAttribute('type', 'button');
      btn.textContent = time.replace(':', 'h');
      btn.setAttribute('aria-pressed', String(this.selectedTime === time));

      if (this.selectedTime === time) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        this.selectedTime = time;
        wrapper.querySelectorAll('.timeslot').forEach((b) => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        this.renderForm(date, time);
      });

      buttonsRow.appendChild(btn);
    });

    if (!hasSlot) {
      const msg = document.createElement('p');
      msg.className = 'no-slots';
      msg.textContent = 'Aucun créneau disponible pour ce jour.';
      wrapper.appendChild(msg);
    } else {
      wrapper.appendChild(buttonsRow);
    }

    this.slotsContainer.appendChild(wrapper);

    // Slide-down animation
    requestAnimationFrame(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });

    // Ré-afficher formulaire si créneau déjà sélectionné
    if (this.selectedTime) {
      this.renderForm(date, this.selectedTime);
    }
  }

  /**
   * Affiche le formulaire de réservation après sélection d'un créneau.
   * @param {Date} date
   * @param {string} time - Format "HH:MM"
   */
  renderForm(date, time) {
    // Supprimer formulaire précédent s'il existe
    this.slotsContainer.querySelector('.booking-form-wrapper')?.remove();

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[date.getDay()];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const displayDate = `${dayName} ${date.getDate()} ${this.MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
    const displayTime = time.replace(':', 'h');

    const wrapper = document.createElement('div');
    wrapper.className = 'booking-form-wrapper';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px)';
    wrapper.style.transition = 'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s';

    wrapper.innerHTML = `
      <div class="booking-summary">
        <span class="summary-icon">📅</span>
        <span class="summary-text">Votre rendez-vous : <strong>${displayDate}</strong> à <strong>${displayTime}</strong></span>
      </div>
      <form class="booking-form" action="https://formspree.io/f/xwplpobd" method="POST" novalidate>
        <input type="hidden" name="date" value="${dateStr}">
        <input type="hidden" name="heure" value="${time}">
        <p class="form-required-note"><span aria-hidden="true">*</span> champ obligatoire</p>
        <input type="hidden" name="_subject" value="Demande de rendez-vous — ${displayDate} à ${displayTime}">

        <div class="form-group">
          <label for="book-nom">Nom complet <span aria-hidden="true">*</span></label>
          <input type="text" id="book-nom" name="nom" required placeholder="Votre nom et prénom" autocomplete="name">
        </div>

        <div class="form-group">
          <label for="book-tel">Téléphone <span aria-hidden="true">*</span></label>
          <input type="tel" id="book-tel" name="telephone" required placeholder="06 XX XX XX XX" autocomplete="tel">
        </div>

        <div class="form-group">
          <label for="book-email">Email <span aria-hidden="true">*</span></label>
          <input type="email" id="book-email" name="email" required placeholder="votre@email.fr" autocomplete="email">
        </div>

        <fieldset class="form-group form-fieldset">
          <legend>Contact préféré <span aria-hidden="true">*</span></legend>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="contact_prefere" value="Appel téléphonique" required>
              Appel téléphonique
            </label>
            <label class="radio-label">
              <input type="radio" name="contact_prefere" value="Email">
              Email
            </label>
          </div>
        </fieldset>

        <div class="form-group">
          <label for="book-service">Service souhaité (facultatif)</label>
          <select id="book-service" name="service">
            <option value="">-- Choisir un service --</option>
            <option value="APA">APA (Activité Physique Adaptée)</option>
            <option value="Coaching Sportif">Coaching Sportif</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Pilates">Pilates</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div class="form-group">
          <label for="book-message">Message (facultatif)</label>
          <textarea id="book-message" name="message" rows="3" aria-describedby="book-message-aide"></textarea>
          <p class="form-hint" id="book-message-aide">Votre demande : objectif, disponibilités, lieu souhaité. Merci de ne pas indiquer d'informations sur votre santé : nous en parlerons de vive voix.</p>
        </div>

        <div class="form-honeypot" aria-hidden="true">
          <label for="book-gotcha">Ne pas remplir ce champ</label>
          <input type="text" id="book-gotcha" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>

        <button type="submit" class="btn-submit-booking">
          Confirmer ma demande de contact
        </button>
        <p class="form-status" role="status" aria-live="polite"></p>
        <div class="form-privacy">
          <p>Vos données (nom, coordonnées, message) servent uniquement à répondre à votre demande. Elles sont traitées par Loïc Boyer (Coach APA'R), transmises par le service de formulaires Formspree (États-Unis) et reçues dans sa messagerie. Elles sont supprimées 12 mois après notre dernier échange si aucun accompagnement n'est engagé. <strong>Merci de ne pas indiquer d'informations sur votre santé dans ce formulaire.</strong> Vous pouvez accéder à vos données, les rectifier ou les faire effacer en écrivant à <a href="mailto:coachapar@gmail.com">coachapar@gmail.com</a>. <a href="pages/politique-confidentialite.html">En savoir plus<span class="visually-hidden"> : politique de confidentialité</span></a></p>
        <details class="form-privacy-details">
          <summary>En savoir plus</summary>
          <p><strong>Qui traite vos données ?</strong> Loïc Boyer, entrepreneur individuel, exerçant sous le nom Coach APA'R. Contact : coachapar@gmail.com.</p>
          <p><strong>Pour quoi faire ?</strong> Répondre à votre demande d'information ou de rendez-vous, avant tout engagement de votre part. Vos données ne servent à aucune prospection et ne sont ni vendues ni cédées.</p>
          <p><strong>Qui les reçoit ?</strong> Loïc Boyer uniquement. Pour l'acheminement, elles passent par Formspree, service de formulaires dont les serveurs sont aux États-Unis (transfert encadré par des clauses contractuelles types de la Commission européenne), puis par la messagerie Gmail de Google.</p>
          <p><strong>Combien de temps ?</strong> 12 mois après notre dernier échange si aucun accompagnement n'est engagé. Si vous devenez client, elles sont conservées le temps de l'accompagnement.</p>
          <p><strong>Vos droits.</strong> Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation de leur traitement ou vous opposer à leur traitement, en écrivant à coachapar@gmail.com. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).</p>
          <p><strong>Pourquoi ne pas parler de santé ici ?</strong> Les informations de santé sont des données sensibles. Elles ne doivent pas transiter par ce formulaire : nous en parlerons de vive voix lors du premier échange.</p>
        </details>
        </div>
      </form>
    `;

    this.slotsContainer.appendChild(wrapper);

    // Animation slide-down
    requestAnimationFrame(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });

    // Gestionnaire submit
    const form = wrapper.querySelector('.booking-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Gère la soumission du formulaire de réservation via fetch.
   * @param {Event} e
   */
  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit-booking');

    // Validation HTML5 native
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    showFormMessage(form, 'Envoi en cours…', 'pending');

    try {
      const data = new FormData(form);
      const response = await fetch(this.FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        this.showConfirmation();
      } else {
        showFormMessage(form, FORM_ERROR_MESSAGE, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmer ma demande de contact';
      }
    } catch (err) {
      console.error('BookingCalendar submit error:', err);
      showFormMessage(form, FORM_ERROR_MESSAGE, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmer ma demande de contact';
    }
  }

  /**
   * Affiche le message de confirmation après envoi réussi.
   */
  showConfirmation() {
    this.slotsContainer.innerHTML = '';
    this.calendarWrapper.querySelectorAll('.cal-cell.selected').forEach((c) => {
      c.classList.remove('selected');
    });
    this.selectedDate = null;
    this.selectedTime = null;

    const confirmation = document.createElement('div');
    confirmation.className = 'booking-confirmation';
    confirmation.setAttribute('role', 'status');
    confirmation.innerHTML = `
      <div class="confirmation-icon" aria-hidden="true">✅</div>
      <h3 tabindex="-1">Demande envoyée !</h3>
      <p>Votre demande a été envoyée ! Je vous contacterai au plus vite pour confirmer le rendez-vous.</p>
      <button type="button" class="btn-new-booking">Faire une nouvelle demande</button>
    `;
    this.slotsContainer.appendChild(confirmation);
    confirmation.querySelector('h3').focus();

    confirmation.querySelector('.btn-new-booking').addEventListener('click', () => {
      this.slotsContainer.innerHTML = '';
      this.renderCalendar();
    });
  }

  /**
   * Passe au mois précédent (si pas dans le passé).
   */
  prevMonth() {
    const now = new Date();
    if (
      this.currentYear > now.getFullYear() ||
      (this.currentYear === now.getFullYear() && this.currentMonth > now.getMonth())
    ) {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.selectedDate = null;
      this.selectedTime = null;
      this.renderCalendar();
    }
  }

  /**
   * Passe au mois suivant.
   */
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.selectedDate = null;
    this.selectedTime = null;
    this.renderCalendar();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MESSAGES DE FORMULAIRE (widget de réservation)
// ─────────────────────────────────────────────────────────────────────────────

/** Message affiché quand Formspree ne confirme pas la réception. */
const FORM_ERROR_MESSAGE =
  "Votre demande n'a pas pu être envoyée. Vos informations sont conservées : " +
  'réessayez dans un instant, ou écrivez-moi à coachapar@gmail.com, ' +
  'ou appelez le 07 65 77 51 04.';

/**
 * Affiche un message dans la zone de statut du formulaire (.form-status,
 * annoncée aux lecteurs d'écran). Les erreurs sont annoncées immédiatement.
 * @param {HTMLFormElement} form
 * @param {string} message
 * @param {'success'|'error'|'pending'} type
 */
function showFormMessage(form, message, type) {
  let status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    form.appendChild(status);
  }
  status.setAttribute('role', type === 'error' ? 'alert' : 'status');
  status.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  status.className = `form-status form-message form-message--${type}`;
  status.textContent = message;
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT — Point d'entrée
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  try {
    initNavigation();
  } catch (e) {
    console.error('initNavigation:', e);
  }


  try {
    initScrollReveal();
  } catch (e) {
    console.error('initScrollReveal:', e);
  }

  try {
    initFaqAccordion();
  } catch (e) {
    console.error('initFaqAccordion:', e);
  }

  try {
    // Monter le widget calendrier si l'élément existe
    const bookingEl = document.getElementById('bookingWidget');
    if (bookingEl) {
      new BookingCalendar('bookingWidget');
    }
  } catch (e) {
    console.error('BookingCalendar:', e);
  }

});
